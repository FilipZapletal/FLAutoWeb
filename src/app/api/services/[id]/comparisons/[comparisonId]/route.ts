import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId } from "@/lib/api";
import { deleteServiceComparison, getServiceComparisons } from "@/lib/services/comparisons";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/services/[id]/comparisons/[comparisonId]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { id, comparisonId } = await ctx.params;
  const serviceId = parseId(id);
  const cid = parseId(comparisonId);
  if (!serviceId || !cid || !(await deleteServiceComparison(serviceId, cid))) return jsonError(404, "Dvojice fotek nenalezena.");
  return NextResponse.json({ items: await getServiceComparisons(serviceId) });
}
