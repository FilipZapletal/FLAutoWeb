import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { updateLeadStatus } from "@/lib/leads/service";
import { leadUpdateSchema } from "@/lib/validation/lead";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  const parsed = leadUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const lead = id ? await updateLeadStatus(id, parsed.data.status) : null;
  return lead ? NextResponse.json({ id: lead.id, status: lead.status }) : jsonError(404, "Poptávka nenalezena.");
}
