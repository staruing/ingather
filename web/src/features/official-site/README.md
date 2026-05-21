# official-site Implementation

**마지막 업데이트**: 2026-05-21

## Spec 정보

- **Spec 파일**: `spec/features/official-site/official-site.md`
- **Plan 파일**: `plan/PLAN-000001_init/plan.md`
- **구현 상태**: ✅ 완료 (MVP)

## 코드 위치

- **프론트엔드**: `web/src/features/official-site/`

## Spec-Code 매핑

| Spec 요구사항 | 코드 파일 | 상태 |
|--------------|-----------|------|
| FR-1 방송 정보 | `home/broadcast-section.tsx`, `api/broadcast/`, `admin/broadcast-form.tsx` | ✅ |
| FR-2 링크·비주얼 | `home/links-section.tsx`, `api/links/`, `admin/links-form.tsx` | ✅ |
| FR-3 홈 레이아웃 | `home/home-page.tsx`, `sticker-board/sticker-board.tsx` | ✅ |
| FR-4 네이버 로그인 | `auth/naver-provider.ts`, `src/auth.ts`, `components/site-header.tsx` | ✅ |
| FR-5 보드 배치·저장 | `sticker-board/sticker-board.tsx`, `api/board/route.ts` | ✅ |
| FR-6 실시간 | `sticker-board/use-board-socket.ts`, `server.ts`, `lib/board-events.ts` | ✅ |
| FR-7 텍스트·제한 | `lib/moderation.ts`, `lib/board-limits.ts` | ✅ |
| FR-8 스티커 팩 | `prisma/seed.ts`, `api/stickers/`, `admin/stickers-form.tsx` | ✅ |
| FR-9 관리·신고 | `app/admin/`, `api/admin/`, `admin/moderation-panel.tsx` | ✅ |
| FR-10 약관·SEO | `app/terms/`, `app/privacy/`, `app/layout.tsx` metadata | ✅ |

## 생성/수정 이력

- 2026-05-21: PLAN-000001 전체 task (`/code PLAN-000001 *`) 구현
