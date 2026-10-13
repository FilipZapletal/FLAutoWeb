import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { updateLeadBooking, updateLeadStatus } from "@/lib/leads/service";
import { leadUpdateSchema } from "@/lib/validation/lead";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  const parsed = leadUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  if (!id) return jsonError(404, "Poptávka nenalezena.");
  const data = parsed.data;
  const lead = "status" in data ? await updateLeadStatus(id, data.status) : await updateLeadBooking(id, { date: data.confirmedDate, slot: data.confirmedSlot });
  return lead ? NextResponse.json({ id: lead.id, status: lead.status }) : jsonError(404, "Poptávka nenalezena (nebo to není servisní objednávka).");
}
