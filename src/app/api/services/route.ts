import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, readJson, validationError } from "@/lib/api";
import { createService, ServiceSlugTakenError } from "@/lib/services/admin";
import { serviceSchema } from "@/lib/validation/service";

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const parsed = serviceSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const s = await createService(parsed.data);
    return NextResponse.json({ id: s.id, slug: s.slug }, { status: 201 });
  } catch (e) {
    if (e instanceof ServiceSlugTakenError) return jsonError(409, "Tato URL adresa už je použitá.", { slug: "URL je obsazená" });
    throw e;
  }
}
