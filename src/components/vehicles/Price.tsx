import { formatPrice } from "@/lib/format";

/** Vždy jen aktuální cena. U akce je zvýrazněná, původní cena se nezobrazuje. */
export function Price({ value, isSale, className = "" }: { value: number; isSale: boolean; className?: string }) {
  return (
    <span className={`font-display font-bold whitespace-nowrap ${isSale ? "text-acc" : ""} ${className}`}>
      {formatPrice(value)}
    </span>
  );
}
