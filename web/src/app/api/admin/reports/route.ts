import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const reports = await prisma.report.findMany({
    include: {
      boardItem: { include: { user: true, sticker: true } },
      reporter: { select: { nickname: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const report = await prisma.report.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json(report);
}
