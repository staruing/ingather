import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function checkPlacementLimits(userId: string): Promise<string | null> {
  const env = getEnv();
  const count = await prisma.boardItem.count({
    where: { userId, boardId: "main" },
  });
  if (count >= env.MAX_BOARD_ITEMS_PER_USER) {
    return `보드에 최대 ${env.MAX_BOARD_ITEMS_PER_USER}개까지 배치할 수 있습니다.`;
  }

  const latest = await prisma.boardItem.findFirst({
    where: { userId, boardId: "main" },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    const elapsed = Date.now() - latest.createdAt.getTime();
    if (elapsed < env.PLACEMENT_COOLDOWN_MS) {
      const waitSec = Math.ceil((env.PLACEMENT_COOLDOWN_MS - elapsed) / 1000);
      return `${waitSec}초 후에 다시 배치할 수 있습니다.`;
    }
  }
  return null;
}
