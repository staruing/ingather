# Ingather (잉게더) — web app

Next.js App Router + Prisma (SQLite dev) + 네이버 로그인 + Socket.io 스티커보드.

## 시작

```bash
cp .env.example .env
# NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, ADMIN_NAVER_IDS 설정

npm install
npm run db:push
npm run db:seed
npm run dev
```

http://localhost:3000 — Socket.io는 `server.ts` 커스텀 서버로 동작합니다 (`npm run dev`).

## 네이버 로그인

1. [네이버 개발자센터](https://developers.naver.com/apps)에서 앱 생성
2. Callback URL: `http://localhost:3000/api/auth/callback/naver`
3. `.env`에 Client ID / Secret 입력
4. 관리자: `ADMIN_NAVER_IDS`에 네이버 ID(숫자) 콤마 구분

## 프로덕션 배포 체크리스트

- [ ] `AUTH_SECRET` — `openssl rand -base64 32`
- [ ] `AUTH_URL` — 프로덕션 도메인
- [ ] PostgreSQL: `prisma/schema.prisma` provider를 `postgresql`로 변경, `DATABASE_URL` 설정
- [ ] 네이버 Callback URL 프로덕션 등록
- [ ] Socket.io: Vercel 서버리스는 WebSocket 제한 — Railway/Fly/VM 커스텀 서버 또는 Pusher/Ably 검토
- [ ] 업로드: `public/uploads` 대신 S3/Vercel Blob 권장

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 커스텀 서버 + Socket.io |
| `npm run dev:next` | Socket 없이 Next만 |
| `npm run build` | Prisma generate + production build |
| `npm run db:push` | DB 스키마 적용 |
| `npm run db:seed` | 초기 데이터·기본 스티커 |

## 구조

- `src/features/official-site/` — 기능 코드
- `prisma/` — 스키마·시드
- `server.ts` — Next + Socket.io
