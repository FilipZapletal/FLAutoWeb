// Podepsaný session token (JWT, HS256). Bez závislosti na next/headers – používá ho i proxy.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "fl_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dní

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET musí mít alespoň 32 znaků");
  return new TextEncoder().encode(secret);
}

/** `ver` = verze přihlášení admina v DB; po změně hesla starší cookies neplatí. */
export type SessionPayload = { adminId: number; email: string; ver: number };

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, ver: payload.ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.adminId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const adminId = Number(payload.sub);
    if (!Number.isInteger(adminId) || typeof payload.email !== "string") return null;
    // Cookies vydané před zavedením verze se berou jako verze 0.
    const ver = payload.ver === undefined ? 0 : payload.ver;
    if (!Number.isInteger(ver)) return null;
    return { adminId, email: payload.email, ver: ver as number };
  } catch {
    return null;
  }
}
