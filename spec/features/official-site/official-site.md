# Feature: official-site

**Plan**: PLAN-000001  
**최종 업데이트**: 2026-05-21  
**코드 위치**: `web/src/features/official-site/`

## 개요

Ingather(잉게더) — 별으잉 롤링페이퍼. 홈, 네이버 인증, 보드, 관리자 기능.

## 구현 구조

| 영역 | 경로 |
|------|------|
| 홈 | `home/home-page.tsx`, `home/broadcast-section.tsx`, `home/links-section.tsx` |
| 인증 | `auth/naver-provider.ts`, `web/src/auth.ts` |
| 스티커보드 | `sticker-board/sticker-board.tsx`, `sticker-board/use-board-socket.ts` |
| 관리자 UI | `admin/*-form.tsx`, `web/src/app/admin/` |
| API | `web/src/app/api/` |
| 실시간 | `web/server.ts`, `lib/board-events.ts` |
| DB | `web/prisma/schema.prisma` |

## 기능 요구사항 (FR)

### FR-1 홈 · 방송 정보

- `GET /api/broadcast` — 방송 상태 조회
- `PATCH /api/admin/broadcast` — 관리자 수정
- UI: `home/broadcast-section.tsx`, `admin/broadcast-form.tsx`

### FR-2 홈 · 비주얼 · 링크

- `GET /api/links` — 링크·HomeAsset
- ` /api/admin/links` — CRUD
- UI: `home/links-section.tsx`, `admin/links-form.tsx`
- 외부 링크: `lib/utils.ts` `externalLinkProps()`

### FR-3 홈 레이아웃 · 스티커보드 영역

- `home/home-page.tsx` — 보드 상단, 방송·링크 하단 그리드

### FR-4 네이버 로그인

- Auth.js + `NaverProvider`, `User` upsert, JWT에 `userId`·`role`
- 비로그인: 보드 열람만 (`sticker-board.tsx` 팔레트 숨김)

### FR-5 스티커보드 — 배치·저장

- `GET|POST|PATCH|DELETE /api/board` — boardId `main`
- 드래그·본인 삭제·관리자 삭제

### FR-6 스티커보드 — 실시간

- Socket.io `path: /api/socketio`, room `board:main`
- `emitBoardEvent` on API mutations; client `useBoardSocket`

### FR-7 스티커보드 — 텍스트·안전

- `lib/moderation.ts`, `lib/board-limits.ts`
- 최대 개수·쿨다운 env 설정

### FR-8 스티커 — 팩

- `prisma/seed.ts` — default 팩 (star, heart, moon SVG)
- `GET /api/stickers`, `POST /api/admin/stickers` (multipart)

### FR-9 관리자 · 보드 운영

- `app/admin/layout.tsx` — role=admin 가드
- `ADMIN_NAVER_IDS` allowlist
- `POST /api/board/report`, `GET|PATCH /api/admin/reports`

### FR-10 법적 · SEO

- `app/terms/page.tsx`, `app/privacy/page.tsx`
- `app/layout.tsx` metadata·openGraph

## 데이터 모델

Prisma: `User`, `BroadcastInfo`, `SiteLink`, `HomeAsset`, `StickerPack`, `Sticker`, `BoardItem`, `Report` — `web/prisma/schema.prisma`

## 비기능 요구사항

- NFR-1: `externalLinkProps()` on outbound links
- NFR-2: `requireAuth` / `requireAdmin` on protected routes
- NFR-3: 터치 드래그, 하단 sticky 팔레트 (모바일)

## 범위 외 (1단계)

- 방송 회차별 아카이브 보드
- SOOP/CHZZK 라이브 API 자동 연동
- 스티커 좋아요·랭킹
