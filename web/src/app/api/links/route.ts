import { NextResponse } from "next/server";
import { ensureDefaultData } from "@/lib/ensure-default-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await ensureDefaultData(prisma);
  } catch (err) {
    console.error("[api/links] ensureDefaultData failed", err);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  const [links, assets] = await Promise.all([
    prisma.siteLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homeAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ links, assets });
}
