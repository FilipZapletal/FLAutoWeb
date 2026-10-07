import "server-only";
import { db } from "@/lib/db";
import type { ReviewInput } from "@/lib/validation/review";

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export type ReviewPlacement = "home" | "service";

/** Veřejné recenze pro danou stránku (jen text, jméno, hvězdy a zdroj). */
export function getPublicReviews(placement: ReviewPlacement, take = 6) {
  return db.review.findMany({
    where: placement === "home" ? { showOnHome: true } : { showOnService: true },
    orderBy: ORDER,
    take,
    select: { id: true, author: true, text: true, rating: true, source: true },
  });
}

export const getAdminReviews = () => db.review.findMany({ orderBy: ORDER });
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
