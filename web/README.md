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

## Vercel 배포 (NOT_FOUND / 404 해결)

Git 저장소 루트에는 `web/`만 올라가 있습니다. **Vercel이 앱을 찾으려면 Root Directory를 반드시 `web`으로 설정**해야 합니다.

1. [Vercel Dashboard](https://vercel.com) → 프로젝트 → **Settings** → **General**
2. **Root Directory** → `web` 입력 → Save
3. **Redeploy** (Deployments → 최신 배포 → Redeploy)
4. **Environment Variables** — `MissingSecret` / server configuration 오류는 **99% `AUTH_SECRET` 미설정**:
   - Vercel → 프로젝트 → **Settings** → **Environment Variables** → **Add**
   - Name: `AUTH_SECRET` / Value: 로컬과 동일하거나 `openssl rand -base64 32` 로 새로 생성
   - Environment: **Production** (Preview도 쓰면 Preview에도 추가)
   - 저장 후 **Deployments → Redeploy** (변수만 추가하고 재배포 안 하면 반영 안 됨)
   - (구버전 호환) `NEXTAUTH_SECRET` 도 읽음 — 새 프로젝트는 `AUTH_SECRET`만 쓰면 됨
   - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` — **필수** (로컬 `.env` 값을 Vercel에도 동일하게 등록)
   - `AUTH_URL` — 선택 (`trustHost` 사용 중이면 생략 가능, 있으면 `https://your-app.vercel.app`)
   - `ADMIN_NAVER_IDS` — 관리자 네이버 ID
   - `DATABASE_URL` — SQLite는 Vercel에서 불가 → Postgres URL + `schema.prisma` provider 변경

Root Directory를 비워 두면 저장소 루트에 `package.json`이 없어 빌드가 실패하거나, 배포 URL이 **Vercel NOT_FOUND**를 냅니다.

`npm run start`(`server.ts` 커스텀 서버)는 Vercel이 사용하지 않습니다. Vercel은 `next build` 결과만 서빙합니다. Socket.io 실시간 보드는 Vercel 서버리스에서 동작하지 않습니다 (페이지/API는 가능).

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
| `npm run db:seed` | 로컬 초기 데이터 (배포/Vercel+Neon은 API가 자동 생성) |

## 구조

- `src/features/official-site/` — 기능 코드
- `prisma/` — 스키마·시드
- `server.ts` — Next + Socket.io
