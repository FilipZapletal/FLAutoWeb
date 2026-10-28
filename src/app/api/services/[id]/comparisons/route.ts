import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId } from "@/lib/api";
import { db } from "@/lib/db";
import { describeError, ImageUploadError, MAX_UPLOAD_BYTES, UploadStageError } from "@/lib/images/process";
import { getStorage } from "@/lib/images/storage";
import { addServiceComparison, getServiceComparisons } from "@/lib/services/comparisons";

// Zpracování dvou fotek a nahrání do úložiště na serverless nesmí skončit předčasným časovým limitem.
export const maxDuration = 60;

const MAX_CAPTION = 120;

/** Přidání dvojice fotek (multipart, pole "before", "after" a volitelně "caption"). */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/services/[id]/comparisons">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  const service = id ? await db.service.findUnique({ where: { id }, select: { id: true } }) : null;
  if (!service) return jsonError(404, "Služba nenalezena.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, "Neplatný upload.");
  }
  const before = form.get("before");
  const after = form.get("after");
  if (!(before instanceof File) || !(after instanceof File)) return jsonError(400, "Nahrajte obě fotky – „před“ i „po“.");
  if (before.size > MAX_UPLOAD_BYTES || after.size > MAX_UPLOAD_BYTES) return jsonError(400, "Soubor je větší než 15 MB.");
  const rawCaption = form.get("caption");
  const caption = typeof rawCaption === "string" ? rawCaption.trim().slice(0, MAX_CAPTION) : "";

  try {
    await addServiceComparison(service.id, Buffer.from(await before.arrayBuffer()), Buffer.from(await after.arrayBuffer()), caption || null);
  } catch (e) {
    if (e instanceof ImageUploadError) return jsonError(400, e.message);
    if (e instanceof UploadStageError) {
      console.error(`Upload fotek před/po – ${e.stage}:`, e.cause);
      let diagnostics: string | undefined;
      if (e.stage === "uložení do úložiště") {
        try {
          diagnostics = await getStorage().diagnose?.();
        } catch {}
      }
      return NextResponse.json({ error: `${e.stage} selhalo – ${describeError(e.cause)}`, ...(diagnostics && { diagnostics }) }, { status: 500 });
    }
    console.error("Upload fotek před/po selhal:", e);
    return jsonError(500, `Nahrání selhalo – ${describeError(e)}`);
  }
  return NextResponse.json({ items: await getServiceComparisons(service.id) });
}
