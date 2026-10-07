import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { LEAD_RETENTION_DAYS, purgeExpiredLeads } from "@/lib/leads/retention";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // bez nastaveného tajemství je endpoint vypnutý
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Denní úklid: smaže poptávky bez obchodu starší než 30 dní od posledního kontaktu.
 * Volá ho plánovač (Vercel Cron posílá hlavičku Authorization: Bearer $CRON_SECRET).
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return jsonError(401, "Neautorizováno.");
  const deleted = await purgeExpiredLeads();
  console.info(`[úklid poptávek] smazáno: ${deleted} (starší než ${LEAD_RETENTION_DAYS} dní)`);
  return NextResponse.json({ deleted });
}
