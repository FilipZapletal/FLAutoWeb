const MAX_EDGE = 2560;

/**
 * Zmenší fotku v prohlížeči před uploadem (rychlejší nahrávání z mobilu a
 * dodržení limitu velikosti požadavku na serverless hostingu – Vercel přijme tělo
 * nejvýše 4,5 MB, proto výchozí strop 4 MB). Finální optimalizaci (WebP varianty) dělá server.
 */
export async function downscaleImage(file: File, maxBytes = 4 * 1024 * 1024): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_EDGE && file.size < maxBytes && file.type !== "image/heic") {
      bitmap.close();
      return file;
    }
    // Zmenší na MAX_EDGE; když je výsledek stále velký, zkusí menší rozměr a nižší kvalitu.
    let edge = Math.min(longest, MAX_EDGE);
    let quality = 0.9;
    let blob: Blob = file;
    for (let attempt = 0; attempt < 3; attempt++) {
      const scale = edge / longest;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality));
      if (blob.size < maxBytes) break;
      edge = Math.round(edge * 0.8);
      quality -= 0.1;
    }
    bitmap.close();
    return blob;
  } catch {
    return file;
  }
}
