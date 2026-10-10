import { InfoIcon } from "@/components/ui/icons";
import { getPublicReviews, type ReviewPlacement } from "@/lib/reviews/service";
import { getSettings } from "@/lib/settings";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { WriteReview } from "./WriteReview";
import { Stars } from "./Stars";

/** Recenze zákazníků + volitelně hodnocení z Googlu. Když není co ukázat, nevykreslí nic. */
export async function ReviewsSection({ placement, className = "" }: { placement: ReviewPlacement; className?: string }) {
  const [reviews, settings] = await Promise.all([getPublicReviews(placement), getSettings()]);
  const { googleRating, googleReviewCount, googleReviewsUrl } = settings;
  const empty = reviews.length === 0 && googleRating === null;

  return (
    <section className={className} aria-labelledby={`reviews-title-${placement}`}>
      <div className="mb-8 flex flex-col items-center text-center">
        <h2 id={`reviews-title-${placement}`} className="text-3xl md:text-5xl">
          Spokojení zákazníci
        </h2>
        <p className="mt-3 text-muted">{empty ? "Zatím tu nejsou žádné recenze. Buďte první, kdo se podělí o svou zkušenost." : "Co o nás říkají naši zákazníci."}</p>

        {/* Zákon vyžaduje uvést, zda se recenze ověřují. Provozovatel recenze přepisuje ručně, bez ověření. */}
        {!empty && (
        <details className="group relative mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 text-sm [&::-webkit-details-marker]:hidden">
            Recenze nejsou ověřené <InfoIcon size={15} className="text-muted" />
          </summary>
          <p className="absolute left-1/2 top-full z-20 mt-2 w-72 max-w-[85vw] -translate-x-1/2 rounded-inner border border-line bg-card p-3 text-left text-xs leading-relaxed text-muted shadow-xl">
            Recenze napsali zákazníci přes formulář na webu (zveřejňujeme je po schválení) nebo je provozovatel přepsal ručně (např. z Googlu). Neověřujeme, zda je napsal skutečný zákazník.
          </p>
        </details>
        )}

        {googleRating !== null && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
            <span className="font-display text-2xl font-bold">{googleRating.toLocaleString("cs-CZ", { minimumFractionDigits: 1 })}</span>
            <Stars rating={googleRating} tone="accent" />
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
      {reviews.length > 0 && <ReviewsCarousel reviews={reviews} />}
      <div className="mt-6 flex justify-center">
        <WriteReview />
      </div>
    </section>
  );
}

const reviewWord = (n: number) => (n >= 1 && n <= 4 ? "recenze" : "recenzí");
