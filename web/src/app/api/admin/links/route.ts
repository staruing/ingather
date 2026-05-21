import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [links, assets] = await Promise.all([
    prisma.siteLink.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.homeAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ links, assets });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.type === "asset") {
    const asset = await prisma.homeAsset.create({
      data: {
        type: body.assetType ?? "hero",
        url: body.url,
        alt: body.alt ?? null,
      },
    });
    return NextResponse.json(asset);
  }
  const link = await prisma.siteLink.create({
    data: {
      label: body.label,
      url: body.url,
      icon: body.icon ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(link);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.type === "asset") {
    const asset = await prisma.homeAsset.update({
      where: { id: body.id },
      data: {
        type: body.assetType,
        url: body.url,
        alt: body.alt,
      },
    });
    return NextResponse.json(asset);
  }
  const link = await prisma.siteLink.update({
    where: { id: body.id },
    data: {
      label: body.label,
      url: body.url,
      icon: body.icon,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  if (type === "asset") {
    await prisma.homeAsset.delete({ where: { id } });
  } else {
    await prisma.siteLink.delete({ where: { id } });
  }
  return NextResponse.json({ ok: true });
}
