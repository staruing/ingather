# Ingather (잉게더) — Project Spec

**프로젝트**: ingather  
**관련 Plan**: PLAN-000001, PLAN-000002  
**최종 업데이트**: 2026-05-21

## 개요

**잉게더(Ingather)** — 시청자가 한 장의 롤링페이퍼에 스티커·글·그림을 남기는 서비스.  
1단계 대상: 버튜버 **별으잉**. Next.js 앱은 `web/` 디렉터리에서 운영한다.

## 목표

- 방송 정보·링크를 보여 주는 허브
- 네이버 로그인 후 팬이 롤링페이퍼(보드)를 함께 꾸미기
- 방송인(관리자)의 콘텐츠·스티커·보드 운영

## 기술 스택

| 영역 | 기술 |
|------|------|
| 앱 | Next.js (App Router), TypeScript, Tailwind |
| 인증 | Auth.js + 네이버 OAuth |
| DB | SQLite(dev) / PostgreSQL(prod) + Prisma |
| 실시간 | Socket.io |
| 스토리지 | S3 호환 또는 Vercel Blob |

## Feature 목록

| Feature | 경로 | 설명 |
|---------|------|------|
| official-site | `spec/features/official-site/official-site.md` | 홈·인증·롤링페이퍼·관리자 |

## 디렉터리 규칙

- 기능 코드: `web/src/features/official-site/`
- 공용 UI/유틸: `web/src/components/`, `web/src/lib/`
