import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { checkPlacementLimits } from "@/lib/board-limits";
import { validateBoardText } from "@/lib/moderation";
import { emitBoardEvent } from "@/lib/board-events";

export async function GET() {
  const items = await prisma.boardItem.findMany({
    where: { boardId: "main" },
    include: {
      user: { select: { id: true, nickname: true, profileImage: true } },
      sticker: true,
    },
    orderBy: { zIndex: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limitError = await checkPlacementLimits(session.user.id);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 429 });
  }

  const body = await req.json();
  if (body.type === "text") {
    const textError = validateBoardText(body.text ?? "");
    if (textError) {
      return NextResponse.json({ error: textError }, { status: 400 });
    }
  }

  const item = await prisma.boardItem.create({
    data: {
      boardId: "main",
      userId: session.user.id,
      type: body.type,
      stickerId: body.stickerId ?? null,
      text: body.text ?? null,
      textColor: body.textColor ?? "#ffffff",
      fontSize: body.fontSize ?? 16,
      x: body.x ?? 100,
      y: body.y ?? 100,
      rotation: body.rotation ?? 0,
      scale: body.scale ?? 1,
      zIndex: body.zIndex ?? Date.now() % 100000,
    },
    include: {
      user: { select: { id: true, nickname: true, profileImage: true } },
      sticker: true,
    },
  });

  emitBoardEvent({ type: "create", item: item as unknown as Record<string, unknown> });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const existing = await prisma.boardItem.findUnique({ where: { id: body.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isOwner = existing.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.text !== undefined) {
    const textError = validateBoardText(body.text);
    if (textError) {
      return NextResponse.json({ error: textError }, { status: 400 });
    }
  }

  const item = await prisma.boardItem.update({
    where: { id: body.id },
    data: {
      x: body.x,
      y: body.y,
      rotation: body.rotation,
      scale: body.scale,
      zIndex: body.zIndex,
      text: body.text,
      textColor: body.textColor,
      fontSize: body.fontSize,
    },
    include: {
      user: { select: { id: true, nickname: true, profileImage: true } },
      sticker: true,
    },
  });

  emitBoardEvent({ type: "update", item: item as unknown as Record<string, unknown> });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const existing = await prisma.boardItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isOwner = existing.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.boardItem.delete({ where: { id } });
  emitBoardEvent({ type: "delete", item: { id } as Record<string, unknown> });
  return NextResponse.json({ ok: true });
}
