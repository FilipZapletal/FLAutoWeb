import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { cronAuthorized } from "@/lib/cron-auth";
import { purgeOldEvents } from "@/lib/analytics/record";
import { LEAD_RETENTION_DAYS, purgeExpiredLeads } from "@/lib/leads/retention";
import { purgeRateLimits } from "@/lib/rate-limit";

/**
 * Denní úklid: smaže poptávky bez obchodu starší než 30 dní od posledního kontaktu.
 * Volá ho plánovač (Vercel Cron posílá hlavičku Authorization: Bearer $CRON_SECRET).
 */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return jsonError(401, "Neautorizováno.");
  const deleted = await purgeExpiredLeads();
  const events = await purgeOldEvents();
  await purgeRateLimits();
  console.info(`[úklid poptávek] smazáno: ${deleted} (starší než ${LEAD_RETENTION_DAYS} dní)`);
  return NextResponse.json({ deleted, analyticsEventsDeleted: events });
}
