import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  let info = await prisma.broadcastInfo.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!info) {
    info = await prisma.broadcastInfo.create({
      data: {
        status: body.status ?? "offline",
        title: body.title ?? "별으잉",
        platformUrl: body.platformUrl ?? null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
    });
  } else {
    info = await prisma.broadcastInfo.update({
      where: { id: info.id },
      data: {
        status: body.status ?? info.status,
        title: body.title ?? info.title,
        platformUrl: body.platformUrl ?? info.platformUrl,
        scheduledAt:
          body.scheduledAt !== undefined
            ? body.scheduledAt
              ? new Date(body.scheduledAt)
              : null
            : info.scheduledAt,
      },
    });
  }
  return NextResponse.json(info);
}
