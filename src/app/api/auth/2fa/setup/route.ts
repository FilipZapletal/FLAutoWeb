import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";
import { guardAdmin, jsonError } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { encryptSecret, generateTotpSecret, totpUri } from "@/lib/auth/totp";
import { db } from "@/lib/db";

/** Začátek zapnutí 2FA: nový tajný klíč a QR kód pro aplikaci. Platit začne až po ověření kódu. */
export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const session = await getSession();
  if (!session) return jsonError(401, "Nejste přihlášeni.");

  const secret = generateTotpSecret();
  const { count } = await db.admin.updateMany({
    where: { id: session.id, totpEnabledAt: null },
    data: { totpSecret: encryptSecret(secret), totpLastStep: null },
  });
  if (!count) return jsonError(409, "Dvoufázové ověření už máte zapnuté.");

  const uri = totpUri(secret, session.email);
  const svg = await QRCode.toString(uri, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  return NextResponse.json(
    { secret, qr: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}` },
    { headers: { "Cache-Control": "no-store" } },
  );
}
