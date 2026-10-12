import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin } from "@/lib/api";
import { pushPublicKey } from "@/lib/notifications/push";

/** Veřejný klíč pro přihlášení zařízení k upozorněním; null = upozornění nejsou na serveru nastavená. */
export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ publicKey: pushPublicKey() });
}
