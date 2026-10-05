import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./token";

export async function createSession(payload: SessionPayload) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Přihlášený admin, nebo null. Ověřuje i to, že účet v DB stále existuje. */
export async function getSession() {
  const payload = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const admin = await db.admin.findUnique({ where: { id: payload.adminId }, select: { id: true, email: true } });
  return admin;
}

/** Pro stránky administrace – nepřihlášeného přesměruje na login. */
export async function requireAdminPage() {
  const admin = await getSession();
  if (!admin) redirect("/admin/prihlaseni");
  return admin;
}
