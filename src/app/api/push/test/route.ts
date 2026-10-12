import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { pushConfigured, sendPush } from "@/lib/notifications/push";

/** Zkušební upozornění do zařízení přihlášeného admina. */
export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const admin = await getSession();
  if (!admin) return jsonError(401, "Nejste přihlášeni.");
  if (!pushConfigured()) return jsonError(503, "Upozornění zatím nejsou na serveru nastavená.");
  const sent = await sendPush({ title: "FL Auto – zkušební upozornění", body: "Upozornění fungují. Takhle uvidíte nové poptávky.", url: "/admin/poptavky", tag: "test" }, { adminId: admin.id });
  return NextResponse.json({ sent });
}
