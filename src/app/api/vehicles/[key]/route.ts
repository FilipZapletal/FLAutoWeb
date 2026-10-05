import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { vehicleQuickUpdateSchema, vehicleSchema } from "@/lib/validation/vehicle";
import { deleteVehicle, quickUpdateVehicle, SlugTakenError, updateVehicle } from "@/lib/vehicles/admin";
import { getVehicleBySlug } from "@/lib/vehicles/queries";

/** GET /api/vehicles/:slug – veřejný detail (VIN maskovaný). */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/vehicles/[key]">) {
  const { key } = await ctx.params;
  const vehicle = await getVehicleBySlug(key);
  return vehicle ? NextResponse.json(vehicle) : jsonError(404, "Vůz nenalezen.");
}

/**
 * PUT /api/vehicles/:id – úplná úprava (formulář), nebo rychlá změna
 * { status | archived | featured } z tabulky v adminu.
 */
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/vehicles/[key]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).key);
  if (!id) return jsonError(404, "Vůz nenalezen.");

  const body = await readJson(req);
  const isFull = body && typeof body === "object" && "brand" in body;
  try {
    if (isFull) {
      const parsed = vehicleSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      const v = await updateVehicle(id, parsed.data);
      return v ? NextResponse.json({ id: v.id, slug: v.slug }) : jsonError(404, "Vůz nenalezen.");
    }
    const parsed = vehicleQuickUpdateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const v = await quickUpdateVehicle(id, parsed.data);
    return v ? NextResponse.json({ id: v.id, status: v.status, archivedAt: v.archivedAt, featured: v.featured }) : jsonError(404, "Vůz nenalezen.");
  } catch (e) {
    if (e instanceof SlugTakenError) return jsonError(409, "Tato URL adresa už je použitá.", { slug: "URL je obsazená" });
    throw e;
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/vehicles/[key]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).key);
  const deleted = id ? await deleteVehicle(id) : null;
  return deleted ? new NextResponse(null, { status: 204 }) : jsonError(404, "Vůz nenalezen.");
}
