import "server-only";
import { db } from "@/lib/db";
import { decryptSecret, hashRecoveryCode, normalizeRecoveryCode, verifyTotp } from "./totp";

export type SecondFactorResult = { ok: true; usedRecoveryCode: boolean; recoveryLeft: number } | { ok: false; reason: "invalid" | "broken" };

/**
 * Ověří druhý faktor admina se zapnutým 2FA: 6místný kód z aplikace, nebo jednorázový
 * záložní kód. Použitý kód se atomicky „spotřebuje“, takže nejde použít podruhé.
 */
export async function verifySecondFactor(adminId: number, input: string): Promise<SecondFactorResult> {
  const admin = await db.admin.findUnique({
    where: { id: adminId },
    select: { totpSecret: true, totpEnabledAt: true, totpLastStep: true, recoveryCodes: true },
  });
  if (!admin?.totpEnabledAt || !admin.totpSecret) return { ok: false, reason: "invalid" };
  const code = input.replace(/\s/g, "");

  if (/^\d{6}$/.test(code)) {
    const secret = decryptSecret(admin.totpSecret);
    if (!secret) return { ok: false, reason: "broken" };
    const step = verifyTotp(secret, code, admin.totpLastStep);
    if (step === null) return { ok: false, reason: "invalid" };
    // Podmínka v UPDATE: souběžný požadavek se stejným kódem neprojde.
    const { count } = await db.admin.updateMany({
      where: { id: adminId, OR: [{ totpLastStep: null }, { totpLastStep: { lt: step } }] },
      data: { totpLastStep: step },
    });
    return count ? { ok: true, usedRecoveryCode: false, recoveryLeft: admin.recoveryCodes.length } : { ok: false, reason: "invalid" };
  }

  if (normalizeRecoveryCode(code).length !== 10) return { ok: false, reason: "invalid" };
  const hash = hashRecoveryCode(code);
  if (!admin.recoveryCodes.includes(hash)) return { ok: false, reason: "invalid" };
  const remaining = admin.recoveryCodes.filter((h) => h !== hash);
  const { count } = await db.admin.updateMany({
    where: { id: adminId, recoveryCodes: { has: hash } },
    data: { recoveryCodes: remaining },
  });
  return count ? { ok: true, usedRecoveryCode: true, recoveryLeft: remaining.length } : { ok: false, reason: "invalid" };
}
