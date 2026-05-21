# 피쳐 계획서

**Plan ID**: PLAN-000002  
**생성일**: 2026-05-21

## 피쳐 아이디어

메인 보드를 **공유 롤링페이퍼**로 포지셔닝하고, 스티커·텍스트에 더해 **손그림(프리핸드 드로잉)** 을 페이퍼 위에 남길 수 있게 한다.

## 목적

- 시청자가 스티커만 붙이는 수준을 넘어, **직접 그린 그림·낙서**로 응원·축하 메시지를 남긴다.
- 기존 스티커보드 인프라(BoardItem, 실시간, 로그인, 신고·관리)를 재사용해 개발 비용을 줄인다.
- UI·카피를 롤링페이퍼 톤으로 정리해 “별으잉에게 남기는 한 장의 페이퍼” 경험을 만든다.

## 배경 (PLAN-000001 대비)

| 이미 구현됨 | 본 plan에서 추가 |
|------------|------------------|
| 스티커·텍스트 배치 | **드로잉** 타입 |
| 드래그·좌표 저장 | 획(stroke) 데이터 저장 |
| Socket.io 실시간 | 드로잉 생성·삭제 브로드캐스트 |
| 네이버 로그인·제한·신고 | 드로잉용 제한·모더레이션 |

## 핵심 기능

### 1. 롤링페이퍼 UX (표현·구조)

- 홈 섹션 명칭: **스티커보드** → **롤링페이퍼** (또는 부제: “별으잉에게 응원 한 장”).
- 안내 문구: 로그인 후 스티커·글·**그림**을 남길 수 있음을 명시.
- 보드 ID는 1단계에서 기존 `main` 유지. 이벤트별 slug 보드(`/roll/[slug]`)는 2단계 후보로 문서만 남기고 구현 범위 외.

### 2. 드로잉 도구 (프리핸드)

**모드 전환** (하단 툴바): `스티커` | `텍스트` | `그리기`

**그리기 모드**

- HTML **Canvas** 레이어를 보드 위에 겹쳐 터치·마우스로 선 그리기.
- **색상** 팔레트(8~12색), **굵기** 3단계(얇음/보통/굵음).
- **지우개**: 본인이 그린 `drawing` 타입 BoardItem 삭제(선택 후 삭제 또는 “방금 획 취소” 1회).
- 스티커 드래그와 충돌 방지: 그리기 모드일 때는 보드 아이템 포인터 이벤트 비활성.

**저장 단위**

- 한 번의 “그리기 완료”(펜 떼기 / 완료 버튼)마다 `BoardItem` 1개 생성.
- `type`: `drawing`
- 위치: 획 bounding box 기준 `x`, `y` (보드 좌표)
- `pathData`: JSON 문자열 — 예시 구조:

```json
{
  "width": 120,
  "height": 80,
  "strokes": [
    { "color": "#ffffff", "size": 4, "points": [[0,0],[5,3],...] }
  ]
}
```

- 렌더: SVG `<path>` 또는 동일 Canvas에 pathData 재생.

**제한**

- 획당 최대 포인트 수(예: 500), drawing 아이템당 최대 stroke 수(예: 20).
- 사용자당 drawing 포함 **전체 BoardItem 개수**는 기존 `MAX_BOARD_ITEMS_PER_USER`에 합산.
- drawing 1개당 최대 JSON 크기(예: 32KB), 초과 시 저장 거부·UI 안내.
- 기존 **쿨다운**·금칙어는 텍스트에만 적용. drawing은 이미지 성격이라 URL 필터 불필요.

### 3. API·DB

**Prisma `BoardItem` 확장**

```prisma
pathData  String?  // drawing 전용, JSON
width     Float?   // drawing bounding box
height    Float?
```

- `type` 값: `sticker` | `text` | `drawing`
- `POST /api/board`: `type=drawing` + pathData + x,y,width,height
- `GET /api/board`: drawing 포함 전체 반환
- `DELETE`: 본인·관리자 (기존과 동일)
- `PATCH`: drawing은 이동만 허용(선택). 1단계는 **이동 불가·삭제만**으로 단순화.

**실시간**

- `emitBoardEvent`에 `drawing` create/delete 반영.
- 클라이언트: 수신 시 pathData로 캔버스/SVG 레이어에 추가.

### 4. 모바일

- 터치 `pointerdown/move/up`으로 동일 stroke 수집.
- 그리기 모드에서 `touch-action: none`으로 스크롤 방지.
- 팔레트·색·굵기는 하단 고정(기존 NFR-3 유지).

### 5. 관리·안전

- drawing도 **신고·관리자 삭제** 대상.
- 욕설 필터는 텍스트만. 그림은 신고 플로우로 처리.
- (선택) 관리자 설정으로 `drawingEnabled` 플래그 — 1단계는 항상 on.

### 6. 롤링페이퍼 2단계 후보 (범위 외)

- 이벤트별 보드 `RollEvent` (slug, 마감일, 커버 이미지)
- 마감 후 읽기 전용 + PNG 스냅샷 export
- 비로그인 익명 낙서(캡차) — 보안 이슈로 보류

## 사용자 시나리오

1. **비로그인**: 롤링페이퍼를 구경만 한다. 다른 사람 스티커·글·그림이 실시간으로 보인다.
2. **로그인 팬**: `그리기` 모드 선택 → 색·굵기 고르고 손가락/마우스로 그림 → 완료 시 페이퍼에 고정. 이어서 스티커·텍스트도 추가 가능.
3. **방송인**: 부적절한 그림을 관리자에서 삭제·신고 처리.

## 기술 스택 (추가분)

| 영역 | 선택 |
|------|------|
| 드로잉 입력 | Canvas 2D API (추가 라이브러리 없이 1단계) |
| 저장 | BoardItem.pathData (JSON) |
| 렌더 | SVG overlay 또는 Canvas replay 컴포넌트 `DrawingLayer.tsx` |
| 실시간 | 기존 Socket.io + `board-events` |

구현 위치: `web/src/features/official-site/sticker-board/drawing/`

## 구현 단계

### Phase 1 — DB·API

1. Prisma `BoardItem` 필드 추가, migrate
2. `POST/GET` board API에 `drawing` 타입 처리·크기 검증
3. placement limit에 drawing 합산

### Phase 2 — UI

4. 툴바 모드: 스티커 / 텍스트 / 그리기
5. `DrawingCanvas` + stroke → pathData 변환
6. `DrawingItem` 렌더(기존 보드 레이어에 합류)
7. 본인 drawing 삭제·완료 버튼

### Phase 3 — 실시간·롤링페이퍼 톤

8. Socket `drawing` 이벤트 연동
9. 홈 카피·섹션 제목 롤링페이퍼로 변경
10. 모바일 터치 QA

### Phase 4 — 마무리

11. spec `official-site.md` FR 추가 (`/code` 시 동기화)
12. 관리자 moderation에서 drawing 미리보기

## 성공 기준

- 로그인 사용자가 롤링페이퍼 위에 **프리핸드로 그림**을 남기고, 새로고침 후에도 유지된다.
- 다른 사용자 화면에 **실시간**으로 나타난다.
- 스티커·텍스트 기존 기능이 깨지지 않는다.
- 모바일에서 한 손가락으로 그리기 가능하다.

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| pathData DB 비대 | 획·포인트·JSON 상한, 완료 시에만 저장 |
| Canvas·드래그 제스처 충돌 | 모드 분리, 그리기 시 pan/zoom 잠금 옵션 |
| 실시간 대용량 | stroke 단위가 아닌 “완료된 drawing 1개”만 broadcast |
| 악성 낙서 | 신고·관리자 삭제·개수 제한 |

## 의존성

- **선행**: PLAN-000001 구현 완료(보드·인증·실시간)
- **병행 가능**: 레거시 정보 채우기(삭제된 PLAN-000002)와 무관

## 제약사항

- 1단계는 **벡터 획(JSON)** 만 지원. 업로드 이미지 페인트·레이어 합성은 범위 외.
- AI 필터·이미지 검열 API는 사용하지 않음.
