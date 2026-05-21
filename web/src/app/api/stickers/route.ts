import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const packs = await prisma.stickerPack.findMany({
    where: { isActive: true },
    include: {
      stickers: { orderBy: { sortOrder: "asc" } },
    },
  });
  return NextResponse.json(packs);
}
