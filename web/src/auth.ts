import NextAuth from "next-auth";
import { NaverProvider } from "@/features/official-site/auth/naver-provider";
import { prisma } from "@/lib/prisma";
import {
  assertAuthEnvForProduction,
  getAdminNaverIds,
  resolveAuthSecret,
  resolveNaverOAuth,
} from "@/lib/env";

assertAuthEnvForProduction();

const authSecret = resolveAuthSecret();
const { clientId, clientSecret } = resolveNaverOAuth();

export const { handlers, auth, signIn, signOut } = NextAuth({
  // undefined면 Auth.js가 런타임 process.env.AUTH_SECRET를 읽음 (Vercel용)
  ...(authSecret ? { secret: authSecret } : {}),
  trustHost: true,
  providers: [
    NaverProvider({
      clientId,
      clientSecret,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "naver") return false;

      const naverProfile = profile as
        | { response?: { id: string }; id?: string }
        | undefined;
      const naverId = String(
        user.id ?? naverProfile?.response?.id ?? naverProfile?.id ?? "",
      );
      if (!naverId) {
        console.error("[auth] signIn: Naver profile missing id", { user, profile });
        return false;
      }

      const adminIds = getAdminNaverIds();
      const role = adminIds.includes(naverId) ? "admin" : "user";

      try {
        await prisma.user.upsert({
          where: { naverId },
          create: {
            naverId,
            nickname: user.name ?? "팬",
            profileImage: user.image ?? null,
            role,
          },
          update: {
            nickname: user.name ?? "팬",
            profileImage: user.image ?? null,
            role,
          },
        });
      } catch (err) {
        // Vercel + SQLite 등 DB 실패 시에도 네이버 OAuth는 성공 → 누구나 로그인 허용
        console.error("[auth] signIn: DB upsert failed (check DATABASE_URL)", err);
      }

      return true;
    },
    async jwt({ token, account, profile, user }) {
      const profileNaverId =
        (profile as { response?: { id: string } } | undefined)?.response?.id ??
        (profile as { id?: string } | undefined)?.id;

      const naverId = profileNaverId ?? user?.id ?? token.naverId ?? token.sub;
      if (!naverId) return token;

      const id = String(naverId);
      token.naverId = id;
      token.role =
        token.role ??
        (getAdminNaverIds().includes(id) ? "admin" : "user");

      try {
        let dbUser = await prisma.user.findUnique({ where: { naverId: id } });
        if (!dbUser && account?.provider === "naver") {
          dbUser = await prisma.user.upsert({
            where: { naverId: id },
            create: {
              naverId: id,
              nickname: user?.name ?? "팬",
              profileImage: user?.image ?? null,
              role: getAdminNaverIds().includes(id) ? "admin" : "user",
            },
            update: {
              nickname: user?.name ?? "팬",
              profileImage: user?.image ?? null,
            },
          });
        }
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.naverId = dbUser.naverId;
        }
      } catch (err) {
        console.error("[auth] jwt: DB lookup failed", err);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const naverId = (token.naverId as string) ?? "";
        session.user.naverId = naverId;
        // DB userId 없을 때(Vercel SQLite 등) naverId로 세션 id 채움 → API에서 upsert
        session.user.id = (token.userId as string) ?? naverId;
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
});
