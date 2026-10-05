import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStorage } from "./storage";
import { IMAGE_WIDTHS, ogKey, variantKey } from "./variants";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "heif"]);
const MAX_PIXELS = 60_000_000;

export class ImageUploadError extends Error {}

/**
 * Ověří, že soubor je skutečně obrázek (podle obsahu, ne podle přípony),
 * otočí ho podle EXIF, odstraní metadata a uloží varianty 400/1024/1920 px ve WebP.
 */
export async function processVehicleImage(vehicleId: number, input: Buffer) {
  if (input.byteLength > MAX_UPLOAD_BYTES) {
    throw new ImageUploadError("Soubor je větší než 15 MB.");
  }
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw new ImageUploadError("Soubor není platný obrázek.");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new ImageUploadError("Podporované formáty: JPG, PNG, WebP, AVIF.");
  }

  const base = sharp(input, { limitInputPixels: MAX_PIXELS }).rotate();
  const storageKey = `vehicles/${vehicleId}/${randomUUID()}`;
  const storage = getStorage();
  let width = 0;
  let height = 0;

  for (const w of IMAGE_WIDTHS) {
    const { data, info } = await base
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: w === 400 ? 72 : 80 })
      .toBuffer({ resolveWithObject: true });
    await storage.put(variantKey(storageKey, w), data, "image/webp");
    width = info.width;
    height = info.height;
  }
  const og = await base.clone().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  await storage.put(ogKey(storageKey), og, "image/jpeg");

  return {
    storageKey,
    url: storage.publicUrl(variantKey(storageKey, 1920)),
    width,
    height,
  };
}

export async function removeVehicleImageFiles(storageKey: string) {
  await getStorage().remove([...IMAGE_WIDTHS.map((w) => variantKey(storageKey, w)), ogKey(storageKey)]);
}
