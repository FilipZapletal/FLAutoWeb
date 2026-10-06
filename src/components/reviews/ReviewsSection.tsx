import { SectionTitle } from "@/components/ui/SectionTitle";
import { getPublicReviews, type ReviewPlacement } from "@/lib/reviews/service";
import { getSettings } from "@/lib/settings";
import { Stars } from "./Stars";

/** Recenze zákazníků + volitelně hodnocení z Googlu. Když není co ukázat, nevykreslí nic. */
export async function ReviewsSection({ placement, className = "" }: { placement: ReviewPlacement; className?: string }) {
  const [reviews, settings] = await Promise.all([getPublicReviews(placement), getSettings()]);
  const { googleRating, googleReviewCount, googleReviewsUrl } = settings;
  if (reviews.length === 0 && googleRating === null) return null;

  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <SectionTitle>Hodnocení zákazníků</SectionTitle>
        {googleRating !== null && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-display text-2xl font-bold">{googleRating.toLocaleString("cs-CZ", { minimumFractionDigits: 1 })}</span>
            <Stars rating={googleRating} />
            <span className="whitespace-nowrap text-muted">
              na Googlu{googleReviewCount ? ` (${googleReviewCount.toLocaleString("cs-CZ")} ${reviewWord(googleReviewCount)})` : ""}
            </span>
            {googleReviewsUrl && (
              <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-muted underline-offset-4 hover:underline">
                Zobrazit →
              </a>
            )}
          </div>
        )}
      </div>
      {reviews.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="card flex flex-col p-5">
              <Stars rating={r.rating} className="mb-3" />
              <blockquote className="mb-4 flex-1 whitespace-pre-line text-sm">„{r.text}“</blockquote>
              <figcaption className="text-sm">
                <span className="font-semibold">{r.author}</span>
                {r.source && <span className="text-muted"> · {r.source}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

const reviewWord = (n: number) => (n >= 1 && n <= 4 ? "recenze" : "recenzí");
