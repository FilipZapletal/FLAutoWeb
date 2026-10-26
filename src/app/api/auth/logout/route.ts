import { NextResponse } from "next/server";
import { jsonError, sameOrigin } from "@/lib/api";
import { destroySession } from "@/lib/auth/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError(403, "Neplatný původ požadavku.");
  await destroySession();
  return NextResponse.json({ ok: true });
}
