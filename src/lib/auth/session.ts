import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MFA_COOKIE, MFA_MAX_AGE, SESSION_COOKIE, SESSION_MAX_AGE, signMfaToken, signSession, verifyMfaToken, verifySession, type SessionPayload } from "./token";

export async function createSession(payload: Omit<SessionPayload, "jti" | "exp">) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Odhlášení: token se zneplatní i na serveru (ukradená kopie cookie už nebude fungovat). */
export async function destroySession() {
  const store = await cookies();
  const payload = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (payload?.jti && payload.exp) {
    await db.revokedSession.upsert({
      where: { jti: payload.jti },
      create: { jti: payload.jti, expiresAt: new Date(payload.exp * 1000) },
      update: {},
    });
  }
  store.delete(SESSION_COOKIE);
}

/** Úklid zneplatněných přihlášení, která by už stejně vypršela (denní úloha). */
export const purgeRevokedSessions = () => db.revokedSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });

/** Mezikrok 2FA – heslo ověřené, čeká se na kód. Cookie platí jen pro API přihlášení. */
export async function createMfaChallenge(adminId: number, ver: number) {
  (await cookies()).set(MFA_COOKIE, await signMfaToken(adminId, ver), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: MFA_MAX_AGE,
  });
}

export async function readMfaChallenge() {
  return verifyMfaToken((await cookies()).get(MFA_COOKIE)?.value);
}

export async function clearMfaChallenge() {
  (await cookies()).delete({ name: MFA_COOKIE, path: "/api/auth" });
}

/** Přihlášený admin, nebo null. Ověřuje i to, že účet v DB stále existuje a cookie nebyla zneplatněna změnou hesla. */
export async function getSession() {
  const payload = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const [admin, revoked] = await Promise.all([
    db.admin.findUnique({ where: { id: payload.adminId }, select: { id: true, email: true, sessionVersion: true } }),
    payload.jti ? db.revokedSession.findUnique({ where: { jti: payload.jti }, select: { jti: true } }) : null,
  ]);
  if (!admin || admin.sessionVersion !== payload.ver || revoked) return null;
  return { id: admin.id, email: admin.email };
}

/** Pro stránky administrace – nepřihlášeného přesměruje na login. */
export async function requireAdminPage() {
  const admin = await getSession();
  if (!admin) redirect("/admin/prihlaseni");
  return admin;
}
