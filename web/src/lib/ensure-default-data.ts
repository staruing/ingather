import type { PrismaClient } from "@prisma/client";

/** Idempotent defaults for Neon/production — no local `npm run db:seed` required. */
export async function ensureDefaultData(db: PrismaClient): Promise<void> {
  const broadcastCount = await db.broadcastInfo.count();
  if (broadcastCount === 0) {
    await db.broadcastInfo.create({
      data: {
        status: "offline",
        title: "잉게더 · 별으잉",
        platformUrl: "https://www.youtube.com",
      },
    });
  }

  const linkCount = await db.siteLink.count();
  if (linkCount === 0) {
    await db.siteLink.createMany({
      data: [
        {
          label: "YouTube",
          url: "https://www.youtube.com",
          icon: "youtube",
          sortOrder: 0,
        },
        {
          label: "굿즈",
          url: "https://example.com/goods",
          icon: "gift",
          sortOrder: 1,
        },
      ],
    });
  }

  const assetCount = await db.homeAsset.count();
  if (assetCount === 0) {
    await db.homeAsset.create({
      data: {
        type: "hero",
        url: "/stickers/moon.svg",
        alt: "별으잉",
      },
    });
  }

  let defaultPack = await db.stickerPack.findFirst({
    where: { type: "default" },
  });
  if (!defaultPack) {
    defaultPack = await db.stickerPack.create({
      data: { type: "default", name: "기본 스티커", isActive: true },
    });
  }

  const stickerCount = await db.sticker.count({
    where: { packId: defaultPack.id },
  });
  if (stickerCount === 0) {
    await db.sticker.createMany({
      data: [
        {
          packId: defaultPack.id,
          imageUrl: "/stickers/star.svg",
          name: "별",
          sortOrder: 0,
        },
        {
          packId: defaultPack.id,
          imageUrl: "/stickers/heart.svg",
          name: "하트",
          sortOrder: 1,
        },
        {
          packId: defaultPack.id,
          imageUrl: "/stickers/moon.svg",
          name: "달",
          sortOrder: 2,
        },
      ],
    });
  }
}
