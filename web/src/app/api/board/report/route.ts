import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const report = await prisma.report.create({
    data: {
      boardItemId: body.boardItemId,
      reporterId: session.user.id,
      reason: body.reason ?? null,
    },
  });
  return NextResponse.json(report);
}
