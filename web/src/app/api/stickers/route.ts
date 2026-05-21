import { NextResponse } from "next/server";
import { ensureDefaultData } from "@/lib/ensure-default-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await ensureDefaultData(prisma);
  } catch (err) {
    console.error("[api/stickers] ensureDefaultData failed", err);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  const packs = await prisma.stickerPack.findMany({
    where: { isActive: true },
    include: {
      stickers: { orderBy: { sortOrder: "asc" } },
    },
  });
  return NextResponse.json(packs);
}
