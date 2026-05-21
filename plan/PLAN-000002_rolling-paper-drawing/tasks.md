# Implementation Tasks - 롤링페이퍼 + 프리핸드 그리기 (PLAN-000002)

**생성일**: 2026-05-21  
**Plan 파일**: `plan/PLAN-000002_rolling-paper-drawing/plan.md`  
**Spec 파일**: `spec/features/official-site/official-site.md`

## 실행 가능한 Tasks (Quick Reference)

| Task ID | 한 줄 요약 | 상태 | 우선순위 | 의존성 | 예상 시간 |
|---------|-----------|------|----------|--------|-----------|
| `extend-prisma-drawing` | BoardItem pathData·width·height 필드 추가 | ⬜ 미완료 | High | - | 15분 |
| `add-drawing-validation` | pathData 크기·획·포인트 검증 유틸 | ⬜ 미완료 | High | extend-prisma-drawing | 25분 |
| `extend-board-api-drawing` | POST/GET drawing 타입 API 처리 | ⬜ 미완료 | High | add-drawing-validation | 40분 |
| `setup-drawing-dirs` | drawing/ 폴더·타입 정의 | ⬜ 미완료 | High | - | 10분 |
| `impl-toolbar-modes` | 스티커·텍스트·그리기 모드 툴바 | ⬜ 미완료 | High | setup-drawing-dirs | 35분 |
| `impl-drawing-canvas` | Canvas 프리핸드 입력·완료→pathData | ⬜ 미완료 | High | impl-toolbar-modes, extend-board-api-drawing | 75분 |
| `impl-drawing-render` | pathData SVG/Canvas 렌더 컴포넌트 | ⬜ 미완료 | High | setup-drawing-dirs | 50분 |
| `integrate-board-drawing` | sticker-board에 드로잉 레이어·모드 통합 | ⬜ 미완료 | High | impl-drawing-canvas, impl-drawing-render | 45분 |
| `impl-drawing-delete` | 본인 drawing 선택 삭제·그리기 중 취소 | ⬜ 미완료 | Medium | integrate-board-drawing | 25분 |
| `impl-drawing-realtime` | Socket drawing create/delete 반영 | ⬜ 미완료 | High | integrate-board-drawing | 30분 |
| `rebrand-rolling-paper` | 롤링페이퍼 카피·홈 문구 변경 | ⬜ 미완료 | Medium | integrate-board-drawing | 20분 |
| `admin-drawing-preview` | 신고 목록 drawing 미리보기 | ⬜ 미완료 | Low | impl-drawing-render | 30분 |

**전체 진행률**: 0% (0/12 tasks 완료)  
**마지막 업데이트**: 2026-05-21

> **사용법**: `/code PLAN-000002 <task-id>` (예: `/code PLAN-000002 extend-prisma-drawing`)

**참고**: PLAN-000001(스티커·텍스트·실시간·인증) 구현 완료 전제. 증분 업데이트 — drawing·롤링페이퍼 관련만 포함.

---

## Tasks 상세 목록

### Phase 1: DB·API

#### Task extend-prisma-drawing

- [ ] **상태**: 미완료
- **Task ID**: `extend-prisma-drawing`
- **한 줄 요약**: BoardItem pathData·width·height 필드 추가
- **설명**: `pathData String?`, `width Float?`, `height Float?` 추가. `npx prisma db push` 적용.
- **의존성**: 없음
- **우선순위**: High
- **예상 시간**: 15분
- **구현 위치**: `web/prisma/schema.prisma`

#### Task add-drawing-validation

- [ ] **상태**: 미완료
- **Task ID**: `add-drawing-validation`
- **한 줄 요약**: pathData 크기·획·포인트 검증 유틸
- **설명**: JSON 파싱, 최대 32KB, stroke≤20, points/stroke≤500, bounding box 유효성. `validateDrawingPathData()`.
- **의존성**: `extend-prisma-drawing`
- **우선순위**: High
- **예상 시간**: 25분
- **구현 위치**: `web/src/lib/drawing-validation.ts`, `web/src/features/official-site/sticker-board/drawing/types.ts`

#### Task extend-board-api-drawing

- [ ] **상태**: 미완료
- **Task ID**: `extend-board-api-drawing`
- **한 줄 요약**: POST/GET drawing 타입 API 처리
- **설명**: `POST type=drawing` 시 pathData·x·y·width·height 저장. 검증 실패 400. PATCH는 drawing 이동 비허용(1단계). 기존 limit·cooldown에 drawing 합산.
- **의존성**: `add-drawing-validation`
- **우선순위**: High
- **예상 시간**: 40분
- **구현 위치**: `web/src/app/api/board/route.ts`

---

### Phase 2: 드로잉 UI

#### Task setup-drawing-dirs

- [ ] **상태**: 미완료
- **Task ID**: `setup-drawing-dirs`
- **한 줄 요약**: drawing/ 폴더·타입 정의
- **설명**: `sticker-board/drawing/` 생성. `DrawingPathData`, `DrawingStroke` 타입, 색·굵기 상수.
- **의존성**: 없음
- **우선순위**: High
- **예상 시간**: 10분
- **구현 위치**: `web/src/features/official-site/sticker-board/drawing/`

#### Task impl-toolbar-modes

- [ ] **상태**: 미완료
- **Task ID**: `impl-toolbar-modes`
- **한 줄 요약**: 스티커·텍스트·그리기 모드 툴바
- **설명**: `BoardToolMode`: sticker | text | draw. 모드별 하단 UI 전환. 그리기 모드 시 색 8색·굵기 3단계.
- **의존성**: `setup-drawing-dirs`
- **우선순위**: High
- **예상 시간**: 35분
- **구현 위치**: `web/src/features/official-site/sticker-board/drawing/toolbar-modes.tsx`

#### Task impl-drawing-canvas

- [ ] **상태**: 미완료
- **Task ID**: `impl-drawing-canvas`
- **한 줄 요약**: Canvas 프리핸드 입력·완료→pathData
- **설명**: pointer 이벤트로 stroke 수집, 완료 버튼 시 bounding box 계산 후 `POST /api/board`. `touch-action: none`. 그리기 중 보드 아이템 drag 비활성.
- **의존성**: `impl-toolbar-modes`, `extend-board-api-drawing`
- **우선순위**: High
- **예상 시간**: 75분
- **구현 위치**: `web/src/features/official-site/sticker-board/drawing/drawing-canvas.tsx`

#### Task impl-drawing-render

- [ ] **상태**: 미완료
- **Task ID**: `impl-drawing-render`
- **한 줄 요약**: pathData SVG/Canvas 렌더 컴포넌트
- **설명**: `DrawingItem` — pathData strokes를 SVG path로 재생. x,y,width,height 위치. 선택 링 표시.
- **의존성**: `setup-drawing-dirs`
- **우선순위**: High
- **예상 시간**: 50분
- **구현 위치**: `web/src/features/official-site/sticker-board/drawing/drawing-item.tsx`

#### Task integrate-board-drawing

- [ ] **상태**: 미완료
- **Task ID**: `integrate-board-drawing`
- **한 줄 요약**: sticker-board에 드로잉 레이어·모드 통합
- **설명**: `sticker-board.tsx`에서 type=drawing 렌더 분기, 그리기 모드 overlay, 줌 시 drawing 스케일. `types.ts` BoardItemData 확장.
- **의존성**: `impl-drawing-canvas`, `impl-drawing-render`
- **우선순위**: High
- **예상 시간**: 45분
- **구현 위치**: `web/src/features/official-site/sticker-board/sticker-board.tsx`

#### Task impl-drawing-delete

- [ ] **상태**: 미완료
- **Task ID**: `impl-drawing-delete`
- **한 줄 요약**: 본인 drawing 선택 삭제·그리기 중 취소
- **설명**: 기존 선택 삭제가 drawing에 동작. 그리기 미완료 stroke 로컬 취소 1회.
- **의존성**: `integrate-board-drawing`
- **우선순위**: Medium
- **예상 시간**: 25분
- **구현 위치**: `web/src/features/official-site/sticker-board/drawing/`

---

### Phase 3: 실시간·브랜딩·운영

#### Task impl-drawing-realtime

- [ ] **상태**: 미완료
- **Task ID**: `impl-drawing-realtime`
- **한 줄 요약**: Socket drawing create/delete 반영
- **설명**: API emit 후 클라이언트 `applyBoardEvent`에서 drawing 렌더. 완료 단위만 broadcast(이미 API 구조 따름).
- **의존성**: `integrate-board-drawing`
- **우선순위**: High
- **예상 시간**: 30분
- **구현 위치**: `web/src/features/official-site/sticker-board/use-board-socket.ts`, `sticker-board.tsx`

#### Task rebrand-rolling-paper

- [ ] **상태**: 미완료
- **Task ID**: `rebrand-rolling-paper`
- **한 줄 요약**: 롤링페이퍼 카피·홈 문구 변경
- **설명**: 섹션 제목「롤링페이퍼」, 부제「별으잉에게 응원 한 장」, 로그인 안내에 그림 포함. `home-page.tsx` 소개 문구 조정.
- **의존성**: `integrate-board-drawing`
- **우선순위**: Medium
- **예상 시간**: 20분
- **구현 위치**: `sticker-board.tsx`, `home/home-page.tsx`

#### Task admin-drawing-preview

- [ ] **상태**: 미완료
- **Task ID**: `admin-drawing-preview`
- **한 줄 요약**: 신고 목록 drawing 미리보기
- **설명**: `moderation-panel.tsx`에서 boardItem.type===drawing이면 `DrawingItem` 미니 렌더 또는 pathData 요약.
- **의존성**: `impl-drawing-render`
- **우선순위**: Low
- **예상 시간**: 30분
- **구현 위치**: `web/src/features/official-site/admin/moderation-panel.tsx`

---

## 의존성 그래프

```
extend-prisma-drawing → add-drawing-validation → extend-board-api-drawing
setup-drawing-dirs ─┬→ impl-toolbar-modes → impl-drawing-canvas ─┐
                    └→ impl-drawing-render ──────────────────────┼→ integrate-board-drawing
                                                                  ├→ impl-drawing-delete
                                                                  ├→ impl-drawing-realtime
                                                                  └→ rebrand-rolling-paper
impl-drawing-render → admin-drawing-preview
```

## Spec 추가 예정 (code 단계 동기화)

- **FR-11**: 롤링페이퍼 UX·카피
- **FR-12**: 프리핸드 드로잉 (pathData, 모드, 실시간)

## 변경 이력

- 2026-05-21: 초기 tasks.md 생성 (PLAN-000001 기반 증분, 12 tasks)
