import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, readJson, validationError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { passwordChangeSchema } from "@/lib/validation/password";

/** Změna hesla přihlášeného admina (vyžaduje současné heslo). */
export async function PUT(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const session = await getSession();
  if (!session) return jsonError(401, "Nejste přihlášeni.");

  const limit = rateLimit(`password:${clientIp(req)}`, 5, 15 * 60_000);
  if (!limit.ok) return jsonError(429, `Příliš mnoho pokusů. Zkuste to znovu za ${Math.ceil(limit.retryAfter / 60)} min.`);

  const parsed = passwordChangeSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const admin = await db.admin.findUnique({ where: { id: session.id }, select: { passwordHash: true } });
  if (!admin || !(await verifyPassword(admin.passwordHash, parsed.data.currentPassword))) {
    return jsonError(422, "Současné heslo není správné.", { currentPassword: "Současné heslo není správné" });
  }

  await db.admin.update({ where: { id: session.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return NextResponse.json({ ok: true });
}
