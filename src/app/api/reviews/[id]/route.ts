import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { deleteReview, setReviewApproved, updateReview } from "@/lib/reviews/service";
import { reviewApproveSchema, reviewSchema } from "@/lib/validation/review";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/reviews/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  const body = await readJson(req);
  // Rychlé schválení / stažení z tabulky: { approved }
  if (body && typeof body === "object" && !("author" in body)) {
    const quick = reviewApproveSchema.safeParse(body);
    if (!quick.success) return validationError(quick.error);
    const r = id ? await setReviewApproved(id, quick.data.approved) : null;
    return r ? NextResponse.json({ id: r.id, approved: r.approved }) : jsonError(404, "Recenze nenalezena.");
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  const review = id ? await updateReview(id, parsed.data) : null;
  return review ? NextResponse.json(review) : jsonError(404, "Recenze nenalezena.");
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/reviews/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  return id && (await deleteReview(id)) ? NextResponse.json({ ok: true }) : jsonError(404, "Recenze nenalezena.");
}
