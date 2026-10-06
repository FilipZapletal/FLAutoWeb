import { StarIcon } from "@/components/ui/icons";

/** Hvězdičky 1–5 (u desetinného hodnocení se zaokrouhlí na celé hvězdy). */
export function Stars({ rating, size = 16, className = "" }: { rating: number; size?: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`inline-flex gap-0.5 text-amber-500 ${className}`} role="img" aria-label={`Hodnocení ${rating.toLocaleString("cs-CZ")} z 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={size} filled={i <= full} className={i <= full ? "" : "opacity-40"} />
      ))}
    </span>
  );
}
