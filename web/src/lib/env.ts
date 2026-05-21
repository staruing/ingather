import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  AUTH_SECRET: z.string().min(8).optional(),
  AUTH_URL: z.string().url().optional(),
  NAVER_CLIENT_ID: z.string().optional(),
  NAVER_CLIENT_SECRET: z.string().optional(),
  ADMIN_NAVER_IDS: z.string().default(""),
  MAX_BOARD_ITEMS_PER_USER: z.coerce.number().default(30),
  PLACEMENT_COOLDOWN_MS: z.coerce.number().default(3000),
  UPLOAD_DIR: z.string().default("public/uploads"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    cached = envSchema.parse(process.env);
  }
  return cached;
}

export function getAdminNaverIds(): string[] {
  return getEnv()
    .ADMIN_NAVER_IDS.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}
