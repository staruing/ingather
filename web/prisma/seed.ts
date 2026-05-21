import { PrismaClient } from "@prisma/client";
import { ensureDefaultData } from "../src/lib/ensure-default-data";

const prisma = new PrismaClient();

async function main() {
  await ensureDefaultData(prisma);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
