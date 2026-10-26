import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, readJson, sameOrigin } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clientIp, rateLimitDb } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().toLowerCase().max(160), password: z.string().max(200) });

// Hash pro neexistující účet – ověření trvá stejně dlouho a neprozradí, zda e-mail existuje.
let dummyHash: Promise<string> | undefined;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError(403, "Neplatný původ požadavku.");
  const tooMany = (retryAfter: number) => jsonError(429, `Příliš mnoho pokusů. Zkuste to znovu za ${Math.ceil(retryAfter / 60)} min.`);

  const limit = await rateLimitDb(`login:${clientIp(req)}`, 5, 15 * 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, "Vyplňte e-mail a heslo.");

  // Limit i na účet – proti hádání hesla z mnoha různých IP adres.
  const accountLimit = await rateLimitDb(`login-account:${parsed.data.email}`, 10, 15 * 60_000);
  if (!accountLimit.ok) return tooMany(accountLimit.retryAfter);

  const admin = await db.admin.findUnique({ where: { email: parsed.data.email } });
  dummyHash ??= hashPassword("neexistujici-ucet");
  const ok = await verifyPassword(admin?.passwordHash ?? (await dummyHash), parsed.data.password);
  if (!admin || !ok) return jsonError(401, "Nesprávný e-mail nebo heslo.");

  await createSession({ adminId: admin.id, email: admin.email, ver: admin.sessionVersion });
  return NextResponse.json({ ok: true });
}
