import { formatPrice } from "@/lib/format";
import type { ServicePrice } from "@/lib/validation/service";

export const priceText = (p: Pick<ServicePrice, "price" | "from">) => `${p.from ? "od " : ""}${formatPrice(p.price)}`;

/** Položky ceníku seskupené podle nadpisu sekce (pořadí zůstává, jak je zadané). */
function groupPrices(prices: ServicePrice[]) {
  const groups: { title: string | null; rows: ServicePrice[] }[] = [];
  for (const p of prices) {
    const last = groups[groups.length - 1];
    if (last && last.title === (p.group ?? null)) last.rows.push(p);
    else groups.push({ title: p.group ?? null, rows: [p] });
  }
  return groups;
}

/** Ceník služby; bez položek „Cena na dotaz“. */
export function PriceList({ prices, note }: { prices: ServicePrice[]; note: string | null }) {
  return (
    <div className="card p-5">
      {prices.length > 0 ? (
        <div className="space-y-5">
          {groupPrices(prices).map((g, gi) => (
            <section key={gi}>
              {g.title && <h3 className="mb-1 border-b border-line pb-2 text-sm text-acc">{g.title}</h3>}
              <dl className="divide-y divide-line text-sm">
                {g.rows.map((p, i) => (
                  <div key={i} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt>{p.label}</dt>
                      <dd className="whitespace-nowrap font-semibold">{priceText(p)}</dd>
                    </div>
                    {p.note && <p className="mt-0.5 text-xs text-muted">{p.note}</p>}
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-sm">Cena na dotaz – rádi vám ji sdělíme po telefonu nebo v odpovědi na poptávku.</p>
      )}
      {note && <p className="mt-3 border-t border-line pt-3 text-xs text-muted">{note}</p>}
    </div>
  );
}
