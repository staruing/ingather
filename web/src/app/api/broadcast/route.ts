import { NextResponse } from "next/server";
import { ensureDefaultData } from "@/lib/ensure-default-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await ensureDefaultData(prisma);
  } catch (err) {
    console.error("[api/broadcast] ensureDefaultData failed", err);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  const info = await prisma.broadcastInfo.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(info);
}
