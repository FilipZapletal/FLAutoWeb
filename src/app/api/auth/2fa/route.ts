import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAdmin, jsonError, readJson } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { verifySecondFactor } from "@/lib/auth/second-factor";
import { createSession, getSession } from "@/lib/auth/session";
import { decryptSecret, generateRecoveryCodes, hashRecoveryCode, verifyTotp } from "@/lib/auth/totp";
import { db } from "@/lib/db";
import { rateLimitDb } from "@/lib/rate-limit";

const codeSchema = z.object({ code: z.string().trim().max(40) });
const passwordAndCode = z.object({ code: z.string().trim().max(40), password: z.string().max(200) });

async function start(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return { error: denied };
  const session = await getSession();
  if (!session) return { error: jsonError(401, "Nejste přihlášeni.") };
  const limit = await rateLimitDb(`2fa:${session.id}`, 5, 15 * 60_000);
  if (!limit.ok) return { error: jsonError(429, `Příliš mnoho pokusů. Zkuste to znovu za ${Math.ceil(limit.retryAfter / 60)} min.`) };
  return { session };
}

const wrongPassword = () => jsonError(422, "Heslo není správné.", { password: "Heslo není správné" });
const wrongCode = () => jsonError(422, "Kód není správný. Zkontrolujte čas v telefonu a zkuste aktuální kód.", { code: "Kód není správný" });

/**
 * Dokončení zapnutí 2FA: heslo (aby 2FA nešlo zapnout jen s ukradenou cookie) a první kód
 * z aplikace. Vrátí záložní kódy – zobrazí se jen jednou.
 */
export async function POST(req: NextRequest) {
  const { session, error } = await start(req);
  if (error) return error;
  const parsed = passwordAndCode.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(422, "Vyplňte heslo a kód.");

  const admin = await db.admin.findUnique({ where: { id: session.id }, select: { passwordHash: true, totpSecret: true, totpEnabledAt: true } });
  if (!admin || !(await verifyPassword(admin.passwordHash, parsed.data.password))) return wrongPassword();
  if (admin.totpEnabledAt) return jsonError(409, "Dvoufázové ověření už máte zapnuté.");
  const secret = admin.totpSecret && decryptSecret(admin.totpSecret);
  if (!secret) return jsonError(409, "Nejdřív si nechte zobrazit QR kód.");
  const step = verifyTotp(secret, parsed.data.code.replace(/\s/g, ""), null);
  if (step === null) return wrongCode();

  const codes = generateRecoveryCodes();
  // Zapnutí 2FA odhlásí ostatní zařízení (přihlášená jen heslem); tomuto vydáme novou cookie.
  const updated = await db.admin.update({
    where: { id: session.id },
    data: { totpEnabledAt: new Date(), totpLastStep: step, recoveryCodes: codes.map(hashRecoveryCode), sessionVersion: { increment: 1 } },
    select: { id: true, email: true, sessionVersion: true },
  });
  await createSession({ adminId: updated.id, email: updated.email, ver: updated.sessionVersion });
  return NextResponse.json({ recoveryCodes: codes }, { headers: { "Cache-Control": "no-store" } });
}

/** Nové záložní kódy (staré přestanou platit). Vyžaduje aktuální kód z aplikace. */
export async function PUT(req: NextRequest) {
  const { session, error } = await start(req);
  if (error) return error;
  const parsed = codeSchema.safeParse(await readJson(req));
  if (!parsed.success) return wrongCode();
  const result = await verifySecondFactor(session.id, parsed.data.code);
  if (!result.ok) return wrongCode();

  const codes = generateRecoveryCodes();
  await db.admin.update({ where: { id: session.id }, data: { recoveryCodes: codes.map(hashRecoveryCode) } });
  return NextResponse.json({ recoveryCodes: codes }, { headers: { "Cache-Control": "no-store" } });
}

/** Vypnutí 2FA: heslo + kód z aplikace (nebo záložní kód). */
export async function DELETE(req: NextRequest) {
  const { session, error } = await start(req);
  if (error) return error;
  const parsed = passwordAndCode.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(422, "Vyplňte heslo a kód.");

  const admin = await db.admin.findUnique({ where: { id: session.id }, select: { passwordHash: true } });
  if (!admin || !(await verifyPassword(admin.passwordHash, parsed.data.password))) return wrongPassword();
  const result = await verifySecondFactor(session.id, parsed.data.code);
  if (!result.ok) return wrongCode();

  await db.admin.update({
    where: { id: session.id },
    data: { totpSecret: null, totpEnabledAt: null, totpLastStep: null, recoveryCodes: [] },
  });
  return NextResponse.json({ ok: true });
}
