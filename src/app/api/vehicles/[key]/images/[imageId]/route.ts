import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId } from "@/lib/api";
import { deleteVehicleImage, getVehicleImages } from "@/lib/vehicles/images";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/vehicles/[key]/images/[imageId]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { key, imageId } = await ctx.params;
  const vehicleId = parseId(key);
  const id = parseId(imageId);
  if (!vehicleId || !id || !(await deleteVehicleImage(vehicleId, id))) return jsonError(404, "Fotka nenalezena.");
  return NextResponse.json({ images: await getVehicleImages(vehicleId) });
}
