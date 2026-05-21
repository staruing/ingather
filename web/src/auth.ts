import NextAuth from "next-auth";
import { NaverProvider } from "@/features/official-site/auth/naver-provider";
import { prisma } from "@/lib/prisma";
import { getAdminNaverIds } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [NaverProvider()],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "naver" || !user.id) return false;
      const naverId = user.id;
      const adminIds = getAdminNaverIds();
      const role = adminIds.includes(naverId) ? "admin" : "user";
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
      return true;
    },
    async jwt({ token, account, profile, user }) {
      const profileNaverId =
        (profile as { response?: { id: string } } | undefined)?.response?.id ??
        (profile as { id?: string } | undefined)?.id;

      const naverId = profileNaverId ?? user?.id ?? token.naverId ?? token.sub;

      if (naverId) {
        const dbUser = await prisma.user.findUnique({
          where: { naverId: String(naverId) },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.naverId = dbUser.naverId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.naverId = token.naverId as string;
      }
      return session;
    },
  },
});
