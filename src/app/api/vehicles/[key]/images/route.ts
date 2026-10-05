import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { db } from "@/lib/db";
import { ImageUploadError, MAX_UPLOAD_BYTES } from "@/lib/images/process";
import { addVehicleImage, arrangeVehicleImages, getVehicleImages } from "@/lib/vehicles/images";

const MAX_FILES_PER_REQUEST = 10;

async function vehicleId(ctx: RouteContext<"/api/vehicles/[key]/images">) {
  const id = parseId((await ctx.params).key);
  if (!id) return null;
  const v = await db.vehicle.findUnique({ where: { id }, select: { id: true } });
  return v?.id ?? null;
}

/** Upload fotek (multipart, pole "files"). Každá se zpracuje na WebP varianty. */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/vehicles/[key]/images">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = await vehicleId(ctx);
  if (!id) return jsonError(404, "Vůz nenalezen.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, "Neplatný upload.");
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return jsonError(400, "Nevybrali jste žádný soubor.");
  if (files.length > MAX_FILES_PER_REQUEST) return jsonError(400, `Najednou lze nahrát max. ${MAX_FILES_PER_REQUEST} souborů.`);

  const errors: string[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      errors.push(`${file.name}: soubor je větší než 15 MB.`);
      continue;
    }
    try {
      await addVehicleImage(id, Buffer.from(await file.arrayBuffer()));
    } catch (e) {
      if (!(e instanceof ImageUploadError)) console.error("Upload fotky selhal:", e);
      errors.push(`${file.name}: ${e instanceof ImageUploadError ? e.message : "zpracování selhalo."}`);
    }
  }
  const images = await getVehicleImages(id);
  return NextResponse.json({ images, errors }, { status: errors.length === files.length ? 400 : 200 });
}

const arrangeSchema = z.object({
  order: z.array(z.number().int().positive()).max(1000),
  mainId: z.number().int().positive().optional(),
});

/** Pořadí fotek a hlavní fotka. */
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/vehicles/[key]/images">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = await vehicleId(ctx);
  if (!id) return jsonError(404, "Vůz nenalezen.");
  const parsed = arrangeSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const ok = await arrangeVehicleImages(id, parsed.data.order, parsed.data.mainId);
  if (!ok) return jsonError(409, "Seznam fotek se mezitím změnil, obnovte stránku.");
  return NextResponse.json({ images: await getVehicleImages(id) });
}
