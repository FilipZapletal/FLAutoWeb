import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, readJson, validationError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { rateLimitDb } from "@/lib/rate-limit";
import { passwordChangeSchema } from "@/lib/validation/password";

/** Změna hesla přihlášeného admina (vyžaduje současné heslo). Odhlásí ostatní zařízení. */
export async function PUT(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const session = await getSession();
  if (!session) return jsonError(401, "Nejste přihlášeni.");

  const limit = await rateLimitDb(`password:${session.id}`, 5, 15 * 60_000);
  if (!limit.ok) return jsonError(429, `Příliš mnoho pokusů. Zkuste to znovu za ${Math.ceil(limit.retryAfter / 60)} min.`);

  const parsed = passwordChangeSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const admin = await db.admin.findUnique({ where: { id: session.id }, select: { passwordHash: true } });
  if (!admin || !(await verifyPassword(admin.passwordHash, parsed.data.currentPassword))) {
    return jsonError(422, "Současné heslo není správné.", { currentPassword: "Současné heslo není správné" });
  }

  // Nová verze přihlášení odhlásí všechna ostatní zařízení; tomuto vydáme novou cookie.
  const updated = await db.admin.update({
    where: { id: session.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword), sessionVersion: { increment: 1 } },
    select: { id: true, email: true, sessionVersion: true },
  });
  await createSession({ adminId: updated.id, email: updated.email, ver: updated.sessionVersion });
  return NextResponse.json({ ok: true });
}
