import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Volání plánovače (Vercel Cron posílá Authorization: Bearer $CRON_SECRET). Bez nastaveného tajemství jsou endpointy vypnuté. */
export function cronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
