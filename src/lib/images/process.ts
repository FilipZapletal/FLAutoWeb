import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStorage } from "./storage";
import { IMAGE_WIDTHS, ogKey, variantKey } from "./variants";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "heif"]);
const MAX_PIXELS = 60_000_000;

/** Chyba způsobená souborem (špatný formát, velikost) – zpráva se ukáže uživateli. */
export class ImageUploadError extends Error {}

export type UploadStage = "zpracování obrázku" | "uložení do úložiště" | "zápis do databáze";

/** Chyba serveru v konkrétní fázi nahrávání. Příčina se vypíše administrátorovi a zapíše do logu. */
export class UploadStageError extends Error {
  constructor(
    public stage: UploadStage,
    public override cause: unknown,
  ) {
    super(`${stage} selhalo`);
  }
}

/** Stručný popis technické chyby (název, HTTP kód, zpráva) + rada, co zkontrolovat. Bez tajných hodnot. */
export function describeError(e: unknown) {
  const err = e as { name?: string; message?: string; code?: string; $metadata?: { httpStatusCode?: number } };
  const name = err?.name && err.name !== "Error" ? err.name : (err?.code ?? "Error");
  const status = err?.$metadata?.httpStatusCode;
  const message = String(err?.message ?? e).replace(/\s+/g, " ").slice(0, 180);
  const text = `${name}${status ? ` (HTTP ${status})` : ""}: ${message}`;

  const hints: [RegExp, string][] = [
    [/NoSuchBucket/i, "bucket neexistuje – zkontrolujte S3_BUCKET"],
    [/InvalidAccessKeyId|SignatureDoesNotMatch|AccessDenied|InvalidSignature|Forbidden/i, "zkontrolujte S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY a S3_REGION"],
    [/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|fetch failed|getaddrinfo/i, "nelze se připojit k S3_ENDPOINT"],
    [/EROFS|read-only|ENOENT.*mkdir|STORAGE_DRIVER/i, "není zapnuté S3 úložiště – nastavte STORAGE_DRIVER=s3"],
    [/Chybí proměnná prostředí/i, "ve Vercelu chybí proměnná prostředí"],
  ];
  const hint = hints.find(([re]) => re.test(`${name} ${message}`))?.[1];
  return hint ? `${text} → ${hint}` : text;
}

/**
 * Ověří, že soubor je skutečně obrázek (podle obsahu, ne podle přípony),
 * otočí ho podle EXIF, odstraní metadata a uloží varianty 400/1024/1920 px ve WebP
 * a JPEG pro náhledy při sdílení. Varianty se vytvářejí i ukládají souběžně (rychlejší na serverless).
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

  const storageKey = `vehicles/${vehicleId}/${randomUUID()}`;

  let files: { key: string; body: Buffer; type: string }[];
  let width = 0;
  let height = 0;
  try {
    const base = sharp(input, { limitInputPixels: MAX_PIXELS }).rotate();
    const [webps, og] = await Promise.all([
      Promise.all(
        IMAGE_WIDTHS.map((w) =>
          base
            .clone()
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: w === 400 ? 72 : 80 })
            .toBuffer({ resolveWithObject: true }),
        ),
      ),
      base.clone().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer(),
    ]);
    files = [
      ...webps.map(({ data }, i) => ({ key: variantKey(storageKey, IMAGE_WIDTHS[i]), body: data, type: "image/webp" })),
      { key: ogKey(storageKey), body: og, type: "image/jpeg" },
    ];
    const largest = webps[webps.length - 1].info;
    width = largest.width;
    height = largest.height;
  } catch (e) {
    throw new UploadStageError("zpracování obrázku", e);
  }

  const storage = getStorage();
  try {
    await Promise.all(files.map((f) => storage.put(f.key, f.body, f.type)));
  } catch (e) {
    // Co se stihlo uložit, zase uklidíme, ať v úložišti nezůstávají sirotci.
    await storage.remove(files.map((f) => f.key)).catch(() => undefined);
    throw new UploadStageError("uložení do úložiště", e);
  }

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
