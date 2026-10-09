import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, readJson, validationError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { adminCreateSchema } from "@/lib/validation/admin";

/**
 * Přidání dalšího admina. Kromě přihlášení vyžaduje i heslo přihlášeného admina,
 * takže ukradená cookie nestačí k založení vlastního účtu.
 */
export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const session = await getSession();
  if (!session) return jsonError(401, "Nejste přihlášeni.");

  const limit = rateLimit(`admins:${clientIp(req)}`, 5, 15 * 60_000);
  if (!limit.ok) return jsonError(429, `Příliš mnoho pokusů. Zkuste to znovu za ${Math.ceil(limit.retryAfter / 60)} min.`);

  const parsed = adminCreateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const me = await db.admin.findUnique({ where: { id: session.id }, select: { passwordHash: true } });
  if (!me || !(await verifyPassword(me.passwordHash, parsed.data.currentPassword))) {
    return jsonError(422, "Vaše heslo není správné.", { currentPassword: "Vaše heslo není správné" });
  }

  const { email, password } = parsed.data;
  if (await db.admin.findUnique({ where: { email }, select: { id: true } })) {
    return jsonError(409, "Admin s tímto e-mailem už existuje.", { email: "Tento e-mail už má účet" });
  }

  const admin = await db.admin.create({
    data: { email, passwordHash: await hashPassword(password) },
    select: { id: true, email: true, createdAt: true },
  });
  return NextResponse.json(admin, { status: 201 });
}
