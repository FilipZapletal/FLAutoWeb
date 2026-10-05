import type { NextRequest } from "next/server";
import { readLocalFile } from "@/lib/images/storage";

/** Servíruje nahrané fotky při STORAGE_DRIVER=local. V produkci jdou fotky přímo z S3/CDN. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/media/[...path]">) {
  const { path } = await ctx.params;
  const key = path.join("/");
  const type = key.endsWith(".webp") ? "image/webp" : key.endsWith(".jpg") ? "image/jpeg" : null;
  if (process.env.STORAGE_DRIVER === "s3" || !type) return new Response("Nenalezeno", { status: 404 });
  try {
    const file = await readLocalFile(key);
    return new Response(new Uint8Array(file), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Nenalezeno", { status: 404 });
  }
}
