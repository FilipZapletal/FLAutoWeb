import "server-only";
import { db } from "@/lib/db";

type LimitResult = { ok: boolean; retryAfter: number };

/**
 * Rychlý rate limit v paměti procesu. Na serverless (Vercel) platí jen pro jednu
 * instanci – vhodný pro časté a málo citlivé věci (statistika, oblíbené).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count++;
  return { ok: bucket.count <= limit, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

/**
 * Rate limit uložený v databázi – platí pro všechny instance serveru. Pro přihlášení
 * a veřejné formuláře. Když DB selže, použije se aspoň limit v paměti.
 */
export async function rateLimitDb(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  try {
    const [row] = await db.$queryRaw<{ count: number; reset_at: Date }[]>`
      INSERT INTO "rate_limits" ("key", "count", "reset_at")
      VALUES (${key}, 1, now() + ${windowMs} * interval '1 millisecond')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "rate_limits"."reset_at" < now() THEN 1 ELSE "rate_limits"."count" + 1 END,
        "reset_at" = CASE WHEN "rate_limits"."reset_at" < now() THEN EXCLUDED."reset_at" ELSE "rate_limits"."reset_at" END
      RETURNING "count", "reset_at"`;
    return { ok: row.count <= limit, retryAfter: Math.max(0, Math.ceil((row.reset_at.getTime() - Date.now()) / 1000)) };
  } catch (e) {
    console.error("Rate limit v DB selhal, používám limit v paměti:", e);
    return rateLimit(key, limit, windowMs);
  }
}

/** Úklid prošlých počítadel (denní úloha). */
export const purgeRateLimits = () => db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } });

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
