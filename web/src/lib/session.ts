import type { Session } from "next-auth";
import { auth } from "@/auth";
import { getAdminNaverIds } from "@/lib/env";
import { prisma } from "@/lib/prisma";

/** JWT에 DB userId가 없어도 naverId로 Prisma User를 찾거나 생성 */
export async function resolveAuthSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;

  const naverId = session.user.naverId || session.user.id;
  if (!naverId) return null;

  if (session.user.id && session.user.id !== naverId) {
    const byId = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (byId) return session;
  }

  try {
    const dbUser = await prisma.user.upsert({
      where: { naverId },
      create: {
        naverId,
        nickname: session.user.name ?? "팬",
        profileImage: session.user.image ?? null,
        role: getAdminNaverIds().includes(naverId) ? "admin" : "user",
      },
      update: {
        nickname: session.user.name ?? "팬",
        profileImage: session.user.image ?? null,
      },
    });
    return {
      ...session,
      user: {
        ...session.user,
        id: dbUser.id,
        role: dbUser.role,
        naverId: dbUser.naverId,
      },
    };
  } catch (err) {
    console.error("[auth] resolveAuthSession: DB failed", err);
    return null;
  }
}

export async function requireAuth() {
  return resolveAuthSession();
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}
