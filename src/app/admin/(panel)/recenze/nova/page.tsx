import { ReviewForm } from "@/components/admin/ReviewForm";
import { PageHead } from "@/components/admin/ui";

export const metadata = { title: "Přidat recenzi" };

export default function NewReviewPage() {
  return (
    <>
      <PageHead title="Přidat recenzi" />
      <ReviewForm initial={{ author: "", text: "", rating: 5, source: "Google", showOnHome: true, showOnService: false, sortOrder: 0, approved: true }} />
    </>
  );
}
