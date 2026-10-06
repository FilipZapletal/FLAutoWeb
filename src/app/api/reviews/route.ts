import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, readJson, validationError } from "@/lib/api";
import { createReview, getAdminReviews } from "@/lib/reviews/service";
import { reviewSchema } from "@/lib/validation/review";

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  return NextResponse.json(await getAdminReviews());
}

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const parsed = reviewSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  return NextResponse.json(await createReview(parsed.data), { status: 201 });
}
