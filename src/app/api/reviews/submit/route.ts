import { after, NextResponse, type NextRequest } from "next/server";
import { jsonError, readJson, validationError } from "@/lib/api";
import { notifyNewReview } from "@/lib/notifications";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { submitReview } from "@/lib/reviews/service";
import { reviewSubmitSchema } from "@/lib/validation/review";

/** Veřejné: recenze od návštěvníka. Uloží se jako neschválená, majitelé dostanou upozornění. */
export async function POST(req: NextRequest) {
  const parsed = reviewSubmitSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    // Vyplněný honeypot = robot. Tváříme se, že je vše v pořádku.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return NextResponse.json({ ok: true }, { status: 201 });
    return validationError(parsed.error);
  }
  // Limit se počítá jen u platných recenzí, aby překlepy ve formuláři nikoho nezablokovaly.
  if (!rateLimit(`review:${clientIp(req)}`, 3, 60 * 60_000).ok) {
    return jsonError(429, "Odeslali jste příliš mnoho recenzí. Zkuste to prosím později.");
  }
  const review = await submitReview(parsed.data);
  after(() => notifyNewReview(review));
  return NextResponse.json({ ok: true }, { status: 201 });
}
