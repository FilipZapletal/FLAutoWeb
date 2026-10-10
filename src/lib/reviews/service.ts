import "server-only";
import { db } from "@/lib/db";
import type { ReviewInput, ReviewSubmitInput } from "@/lib/validation/review";

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export type ReviewPlacement = "home" | "service";

/** Veřejné recenze pro danou stránku (jen text, jméno, hvězdy a zdroj). */
export function getPublicReviews(placement: ReviewPlacement, take = 6) {
  return db.review.findMany({
    where: { approved: true, ...(placement === "home" ? { showOnHome: true } : { showOnService: true }) },
    orderBy: ORDER,
    take,
    select: { id: true, author: true, text: true, rating: true, source: true },
  });
}

/** Zdroj, který se u recenze z formuláře na webu zobrazí. */
export const WEB_REVIEW_SOURCE = "Web FL Auto";

/** Nejdřív recenze čekající na schválení, potom ostatní. */
export const getAdminReviews = () => db.review.findMany({ orderBy: [{ approved: "asc" }, ...ORDER] });
export const countPendingReviews = () => db.review.count({ where: { approved: false } });

/** Recenze od návštěvníka: uloží se jako neschválená, na webu se zobrazí až po schválení. */
export const submitReview = (data: ReviewSubmitInput) =>
  db.review.create({
    data: {
      author: data.author,
      text: data.text,
      rating: data.rating,
      source: WEB_REVIEW_SOURCE,
      showOnHome: true,
      showOnService: false,
      approved: false,
      fromCustomer: true,
    },
  });

export async function setReviewApproved(id: number, approved: boolean) {
  return db.review.update({ where: { id }, data: { approved } }).catch(() => null);
}
export const getAdminReview = (id: number) => db.review.findUnique({ where: { id } });
export const createReview = (data: ReviewInput) => db.review.create({ data });

export async function updateReview(id: number, data: ReviewInput) {
  const exists = await db.review.findUnique({ where: { id }, select: { id: true } });
  return exists ? db.review.update({ where: { id }, data }) : null;
}

export async function deleteReview(id: number) {
  const { count } = await db.review.deleteMany({ where: { id } });
  return count > 0;
}
