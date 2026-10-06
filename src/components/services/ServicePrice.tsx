import { formatPrice } from "@/lib/format";
import type { ServicePrice } from "@/lib/validation/service";

export const priceText = (p: Pick<ServicePrice, "price" | "from">) => `${p.from ? "od " : ""}${formatPrice(p.price)}`;

/** Ceník služby; bez položek „Cena na dotaz“. */
export function PriceList({ prices, note }: { prices: ServicePrice[]; note: string | null }) {
  return (
    <div className="card p-5">
      {prices.length > 0 ? (
        <dl className="divide-y divide-line text-sm">
          {prices.map((p, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt>{p.label}</dt>
              <dd className="whitespace-nowrap font-semibold">{priceText(p)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm">Cena na dotaz – rádi vám ji sdělíme po telefonu nebo v odpovědi na poptávku.</p>
      )}
      {note && <p className="mt-3 border-t border-line pt-3 text-xs text-muted">{note}</p>}
    </div>
  );
}
