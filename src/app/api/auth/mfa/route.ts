import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, readJson, sameOrigin } from "@/lib/api";
import { verifySecondFactor } from "@/lib/auth/second-factor";
import { clearMfaChallenge, createSession, readMfaChallenge } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clientIp, rateLimitDb } from "@/lib/rate-limit";

const schema = z.object({ code: z.string().trim().max(40) });

/** Druhý krok přihlášení: kód z aplikace nebo záložní kód. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError(403, "Neplatný původ požadavku.");
  const challenge = await readMfaChallenge();
  if (!challenge) return jsonError(401, "Přihlášení vypršelo. Zadejte prosím znovu e-mail a heslo.");

  const tooMany = (retryAfter: number) => jsonError(429, `Příliš mnoho pokusů. Zkuste to znovu za ${Math.ceil(retryAfter / 60)} min.`);
  const ipLimit = await rateLimitDb(`mfa-ip:${clientIp(req)}`, 10, 15 * 60_000);
  if (!ipLimit.ok) return tooMany(ipLimit.retryAfter);
  // 5 pokusů na účet za 15 min: uhodnout 6místný kód je tak prakticky nemožné.
  const limit = await rateLimitDb(`mfa:${challenge.adminId}`, 5, 15 * 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success || !parsed.data.code) return jsonError(400, "Zadejte kód z aplikace.");

  const admin = await db.admin.findUnique({ where: { id: challenge.adminId }, select: { id: true, email: true, sessionVersion: true } });
  // Mezitím změněné heslo nebo smazaný účet = začít znovu.
  if (!admin || admin.sessionVersion !== challenge.ver) {
    await clearMfaChallenge();
    return jsonError(401, "Přihlášení vypršelo. Zadejte prosím znovu e-mail a heslo.");
  }

  const result = await verifySecondFactor(admin.id, parsed.data.code);
  if (!result.ok) {
    if (result.reason === "broken") {
      return jsonError(500, "Ověřovací klíč nejde přečíst (změnil se SESSION_SECRET?). Přihlaste se záložním kódem.");
    }
    return jsonError(401, "Kód není správný nebo už byl použit.");
  }

  await clearMfaChallenge();
  await createSession({ adminId: admin.id, email: admin.email, ver: admin.sessionVersion });
  return NextResponse.json({ ok: true, ...(result.usedRecoveryCode && { recoveryLeft: result.recoveryLeft }) });
}
