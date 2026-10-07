import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { deleteService, ServiceSlugTakenError, setServicePublished, updateService } from "@/lib/services/admin";
import { serviceQuickUpdateSchema, serviceSchema } from "@/lib/validation/service";

/** PUT /api/services/:id – úplná úprava (formulář), nebo rychlá změna { published } z tabulky. */
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/services/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  if (!id) return jsonError(404, "Služba nenalezena.");

  const body = await readJson(req);
  const isFull = body && typeof body === "object" && "title" in body;
  if (!isFull) {
    const parsed = serviceQuickUpdateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const s = await setServicePublished(id, parsed.data.published);
    return s ? NextResponse.json({ id: s.id, published: s.published }) : jsonError(404, "Služba nenalezena.");
  }
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const s = await updateService(id, parsed.data);
    return s ? NextResponse.json({ id: s.id, slug: s.slug }) : jsonError(404, "Služba nenalezena.");
  } catch (e) {
    if (e instanceof ServiceSlugTakenError) return jsonError(409, "Tato URL adresa už je použitá.", { slug: "URL je obsazená" });
    throw e;
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/services/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  const deleted = id ? await deleteService(id) : null;
  return deleted ? new NextResponse(null, { status: 204 }) : jsonError(404, "Služba nenalezena.");
}
