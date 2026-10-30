import { after, NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { deleteLead, updateLeadBooking, updateLeadStatus } from "@/lib/leads/service";
import { notifyBookingChange } from "@/lib/notifications";
import { leadUpdateSchema } from "@/lib/validation/lead";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  const parsed = leadUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  if (!id) return jsonError(404, "Poptávka nenalezena.");
  const data = parsed.data;
  const lead = "status" in data ? await updateLeadStatus(id, data.status) : await updateLeadBooking(id, { date: data.confirmedDate, time: data.confirmedTime });
  if (!lead) return jsonError(404, "Poptávka nenalezena (nebo u hledaného auta termín nejde nastavit).");
  if ("bookingChange" in lead && lead.bookingChange) {
    const { bookingChange, previousBooking } = lead;
    after(() => notifyBookingChange(lead, bookingChange, previousBooking));
  }
  return NextResponse.json({ id: lead.id, status: lead.status, vehicleStatus: "vehicleStatus" in lead ? lead.vehicleStatus : null });
}

/** Ruční smazání poptávky (vedle automatického mazání po 30 dnech). */
export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  return id && (await deleteLead(id)) ? NextResponse.json({ ok: true }) : jsonError(404, "Poptávka nenalezena.");
}
