import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, readJson, validationError } from "@/lib/api";
import { parseFilters } from "@/lib/validation/filters";
import { vehicleSchema } from "@/lib/validation/vehicle";
import { createVehicle, SlugTakenError } from "@/lib/vehicles/admin";
import { searchVehicles } from "@/lib/vehicles/queries";

/** Veřejný katalog: filtry v query parametrech, stránkování. Bez VIN a interních údajů. */
export async function GET(req: NextRequest) {
  const result = await searchVehicles(parseFilters(req.nextUrl.searchParams));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const parsed = vehicleSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const vehicle = await createVehicle(parsed.data);
    return NextResponse.json({ id: vehicle.id, slug: vehicle.slug }, { status: 201 });
  } catch (e) {
    if (e instanceof SlugTakenError) return jsonError(409, "Tato URL adresa už je použitá.", { slug: "URL je obsazená" });
    throw e;
  }
}
