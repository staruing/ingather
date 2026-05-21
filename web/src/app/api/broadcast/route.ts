import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let info = await prisma.broadcastInfo.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!info) {
    info = await prisma.broadcastInfo.create({
      data: {
        status: "offline",
        title: "별으잉",
        platformUrl: null,
      },
    });
  }
  return NextResponse.json(info);
}
