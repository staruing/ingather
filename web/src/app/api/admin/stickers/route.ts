import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { getEnv } from "@/lib/env";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const packs = await prisma.stickerPack.findMany({
    include: { stickers: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(packs);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const name = (formData.get("name") as string) || "커스텀";
  const file = formData.get("file") as File | null;

  let pack = await prisma.stickerPack.findFirst({
    where: { type: "custom" },
  });
  if (!pack) {
    pack = await prisma.stickerPack.create({
      data: { type: "custom", name: "별으잉 커스텀", isActive: true },
    });
  }

  let imageUrl = (formData.get("imageUrl") as string) || "/stickers/star.svg";
  if (file && file.size > 0) {
    if (file.size > 512_000) {
      return NextResponse.json({ error: "파일은 512KB 이하여야 합니다." }, { status: 400 });
    }
    const ext = path.extname(file.name) || ".png";
    if (![".png", ".webp", ".svg"].includes(ext.toLowerCase())) {
      return NextResponse.json({ error: "PNG, WebP, SVG만 허용됩니다." }, { status: 400 });
    }
    const uploadDir = path.join(/* turbopackIgnore: true */ process.cwd(), getEnv().UPLOAD_DIR);
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    imageUrl = `/uploads/${filename}`;
  }

  const count = await prisma.sticker.count({ where: { packId: pack.id } });
  const sticker = await prisma.sticker.create({
    data: {
      packId: pack.id,
      imageUrl,
      name,
      sortOrder: count,
    },
  });
  return NextResponse.json(sticker);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.packId) {
    const pack = await prisma.stickerPack.update({
      where: { id: body.packId },
      data: { isActive: body.isActive, name: body.name },
    });
    return NextResponse.json(pack);
  }
  const sticker = await prisma.sticker.update({
    where: { id: body.id },
    data: { name: body.name, sortOrder: body.sortOrder },
  });
  return NextResponse.json(sticker);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.sticker.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
