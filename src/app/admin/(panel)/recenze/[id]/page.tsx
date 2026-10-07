import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { PageHead } from "@/components/admin/ui";
import { parseId } from "@/lib/api";
import { getAdminReview } from "@/lib/reviews/service";

export const metadata = { title: "Upravit recenzi" };

export default async function EditReviewPage({ params }: PageProps<"/admin/recenze/[id]">) {
  const id = parseId((await params).id);
  const review = id ? await getAdminReview(id) : null;
  if (!review) notFound();

  return (
    <>
      <PageHead title="Upravit recenzi" />
      <ReviewForm reviewId={review.id} initial={{ ...review, source: review.source ?? "" }} />
    </>
  );
}
