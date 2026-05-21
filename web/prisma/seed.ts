import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const broadcastCount = await prisma.broadcastInfo.count();
  if (broadcastCount === 0) {
    await prisma.broadcastInfo.create({
      data: {
        status: "offline",
        title: "잉게더 · 별으잉",
        platformUrl: "https://www.youtube.com",
      },
    });
  }

  const linkCount = await prisma.siteLink.count();
  if (linkCount === 0) {
    await prisma.siteLink.createMany({
      data: [
        { label: "YouTube", url: "https://www.youtube.com", icon: "youtube", sortOrder: 0 },
        { label: "굿즈", url: "https://example.com/goods", icon: "gift", sortOrder: 1 },
      ],
    });
  }

  const assetCount = await prisma.homeAsset.count();
  if (assetCount === 0) {
    await prisma.homeAsset.create({
      data: {
        type: "hero",
        url: "/stickers/moon.svg",
        alt: "별으잉",
      },
    });
  }

  let defaultPack = await prisma.stickerPack.findFirst({
    where: { type: "default" },
  });
  if (!defaultPack) {
    defaultPack = await prisma.stickerPack.create({
      data: { type: "default", name: "기본 스티커", isActive: true },
    });
    await prisma.sticker.createMany({
      data: [
        { packId: defaultPack.id, imageUrl: "/stickers/star.svg", name: "별", sortOrder: 0 },
        { packId: defaultPack.id, imageUrl: "/stickers/heart.svg", name: "하트", sortOrder: 1 },
        { packId: defaultPack.id, imageUrl: "/stickers/moon.svg", name: "달", sortOrder: 2 },
      ],
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
