import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [links, assets] = await Promise.all([
    prisma.siteLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homeAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ links, assets });
}
