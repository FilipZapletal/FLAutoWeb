// Podepsaný session token (JWT, HS256). Bez závislosti na next/headers – používá ho i proxy.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "fl_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dní
/** Mezikrok přihlášení: heslo je ověřené, čeká se na kód z aplikace (2FA). */
export const MFA_COOKIE = "fl_admin_mfa";
export const MFA_MAX_AGE = 5 * 60; // 5 minut

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET musí mít alespoň 32 znaků");
  return new TextEncoder().encode(secret);
}

/**
 * `ver` = verze přihlášení admina v DB; po změně hesla starší cookies neplatí.
 * `jti` = ID přihlášení, po odhlášení se zapíše mezi zneplatněné (starší cookies ho nemají).
 */
export type SessionPayload = { adminId: number; email: string; ver: number; jti?: string; exp?: number };

export async function signSession(payload: Omit<SessionPayload, "jti" | "exp">) {
  return new SignJWT({ email: payload.email, ver: payload.ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.adminId))
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const adminId = Number(payload.sub);
    // Token mezikroku 2FA nesmí nikdy fungovat jako přihlášení.
    if (payload.mfa !== undefined) return null;
    if (!Number.isInteger(adminId) || typeof payload.email !== "string") return null;
    // Cookies vydané před zavedením verze se berou jako verze 0.
    const ver = payload.ver === undefined ? 0 : payload.ver;
    if (!Number.isInteger(ver)) return null;
    return { adminId, email: payload.email, ver: ver as number, jti: payload.jti, exp: payload.exp };
  } catch {
    return null;
  }
}

/** Token mezikroku 2FA: kdo zadal správné heslo. Sám o sobě k ničemu nepřihlašuje. */
export async function signMfaToken(adminId: number, ver: number) {
  return new SignJWT({ mfa: true, ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(`${MFA_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifyMfaToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const adminId = Number(payload.sub);
    if (payload.mfa !== true || !Number.isInteger(adminId) || !Number.isInteger(payload.ver)) return null;
    return { adminId, ver: payload.ver as number };
  } catch {
    return null;
  }
}
