import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAdmin, jsonError, readJson, validationError } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const subscriptionSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }).max(2048),
  keys: z.object({ p256dh: z.string().min(1).max(256), auth: z.string().min(1).max(256) }),
});

/** Přihlášení tohoto zařízení k upozorněním na nové poptávky. */
export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const admin = await getSession();
  if (!admin) return jsonError(401, "Nejste přihlášeni.");
  const parsed = subscriptionSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { endpoint, keys } = parsed.data;
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { adminId: admin.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { adminId: admin.id, p256dh: keys.p256dh, auth: keys.auth },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Odhlášení zařízení od upozornění. */
export async function DELETE(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const parsed = z.object({ endpoint: z.string().max(2048) }).safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  await db.pushSubscription.deleteMany({ where: { endpoint: parsed.data.endpoint } });
  return NextResponse.json({ ok: true });
}
