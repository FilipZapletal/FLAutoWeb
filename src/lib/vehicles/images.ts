import "server-only";
import { db } from "@/lib/db";
import { processVehicleImage, removeVehicleImageFiles } from "@/lib/images/process";
import { imageUrls } from "@/lib/images/variants";

export async function getVehicleImages(vehicleId: number) {
  const rows = await db.vehicleImage.findMany({
    where: { vehicleId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return rows.map((r) => ({ id: r.id, isMain: r.isMain, width: r.width, height: r.height, ...imageUrls(r.storageKey) }));
}
export type AdminImage = Awaited<ReturnType<typeof getVehicleImages>>[number];

export async function addVehicleImage(vehicleId: number, file: Buffer) {
  const processed = await processVehicleImage(vehicleId, file);
  const agg = await db.vehicleImage.aggregate({ where: { vehicleId }, _max: { sortOrder: true }, _count: true });
  try {
    return await db.vehicleImage.create({
      data: {
        vehicleId,
        ...processed,
        sortOrder: (agg._max.sortOrder ?? -1) + 1,
        isMain: agg._count === 0,
      },
    });
  } catch (e) {
    await removeVehicleImageFiles(processed.storageKey);
    throw e;
  }
}

/** Nové pořadí podle pole id; volitelně nastaví hlavní fotku. */
export async function arrangeVehicleImages(vehicleId: number, order: number[], mainId?: number) {
  const existing = await db.vehicleImage.findMany({ where: { vehicleId }, select: { id: true } });
  const ids = new Set(existing.map((e) => e.id));
  if (order.length !== ids.size || order.some((id) => !ids.has(id))) return false;
  if (mainId !== undefined && !ids.has(mainId)) return false;

  await db.$transaction([
    ...order.map((id, i) => db.vehicleImage.update({ where: { id }, data: { sortOrder: i } })),
    ...(mainId !== undefined
      ? [
          db.vehicleImage.updateMany({ where: { vehicleId }, data: { isMain: false } }),
          db.vehicleImage.update({ where: { id: mainId }, data: { isMain: true } }),
        ]
      : []),
  ]);
  return true;
}

export async function deleteVehicleImage(vehicleId: number, imageId: number) {
  const img = await db.vehicleImage.findFirst({ where: { id: imageId, vehicleId } });
  if (!img) return false;
  await db.vehicleImage.delete({ where: { id: imageId } });
  if (img.isMain) {
    const first = await db.vehicleImage.findFirst({ where: { vehicleId }, orderBy: { sortOrder: "asc" } });
    if (first) await db.vehicleImage.update({ where: { id: first.id }, data: { isMain: true } });
  }
  await removeVehicleImageFiles(img.storageKey);
  return true;
}
