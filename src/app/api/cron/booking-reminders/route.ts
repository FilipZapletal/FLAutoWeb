import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { cronAuthorized } from "@/lib/cron-auth";
import { sendBookingReminders } from "@/lib/notifications/reminders";

/** Ranní připomenutí dnešních servisních termínů majitelům. Volá ho plánovač (viz vercel.json). */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return jsonError(401, "Neautorizováno.");
  const bookings = await sendBookingReminders();
  console.info(`[připomenutí termínů] dnešních objednávek: ${bookings}`);
  return NextResponse.json({ bookings });
}
