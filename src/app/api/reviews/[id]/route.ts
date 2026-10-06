import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId, readJson, validationError } from "@/lib/api";
import { deleteReview, updateReview } from "@/lib/reviews/service";
import { reviewSchema } from "@/lib/validation/review";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/reviews/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const id = parseId((await ctx.params).id);
  const parsed = reviewSchema.safeParse(await readJson(req));
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
