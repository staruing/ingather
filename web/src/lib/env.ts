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

/** Runtime read — avoids bundling `undefined` at build when env is only on Vercel. */
export function resolveAuthSecret(): string | undefined {
  return (
    process.env["AUTH_SECRET"] ??
    process.env["NEXTAUTH_SECRET"]
  );
}

export function resolveNaverOAuth(): {
  clientId: string;
  clientSecret: string;
} {
  return {
    clientId: process.env["NAVER_CLIENT_ID"] ?? "",
    clientSecret: process.env["NAVER_CLIENT_SECRET"] ?? "",
  };
}

/** Auth.js — production requires AUTH_SECRET + Naver OAuth credentials */
export function assertAuthEnvForProduction(): void {
  if (process.env.NODE_ENV !== "production") return;

  const secret = resolveAuthSecret();
  const { clientId, clientSecret } = resolveNaverOAuth();

  if (!secret || secret.length < 8) {
    throw new Error(
      "AUTH_SECRET is missing. Vercel → Project → Settings → Environment Variables → add AUTH_SECRET (Production), then Redeploy.",
    );
  }
  if (!clientId || !clientSecret) {
    throw new Error(
      "NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set in Vercel environment variables.",
    );
  }
}
