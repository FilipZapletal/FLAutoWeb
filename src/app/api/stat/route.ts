import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CLIENT_ACTIONS, recordEvent } from "@/lib/analytics/record";
import { readJson } from "@/lib/api";

const bodySchema = z.object({
  type: z.enum(["view", "action"]),
  name: z.enum(CLIENT_ACTIONS).optional(),
  path: z.string().max(300),
  entry: z.boolean().optional(),
  ref: z.string().max(120).optional(),
  device: z.enum(["mobile", "desktop"]).optional(),
});

/** Veřejné: anonymní měření návštěvnosti (zobrazení stránky, klik na telefon…). Vždy odpoví 204. */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await readJson(req));
  if (parsed.success) {
    const b = parsed.data;
    if (b.type === "view" || b.name) {
      await recordEvent(req, { kind: b.type, name: b.name ?? "", path: b.path, entry: b.entry, referrerHost: b.ref, device: b.device }).catch((e) => console.error("Statistika selhala:", e));
    }
  }
  return new NextResponse(null, { status: 204 });
}
