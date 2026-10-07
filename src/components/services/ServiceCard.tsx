import Link from "next/link";
import { CheckIcon } from "@/components/ui/icons";
import { lowestPrice, type PublicService } from "@/lib/services/public";
import { priceText } from "./ServicePrice";
import { ServiceIconView } from "./ServiceIconView";

export function ServiceCard({ service: s }: { service: PublicService }) {
  const low = lowestPrice(s.prices);
  return (
    <article className="card flex flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-card2 text-acc">
          <ServiceIconView icon={s.icon} />
        </span>
        {s.tag && <span className="text-[10px] uppercase tracking-widest text-muted">{s.tag}</span>}
      </div>
      <h2 className="mb-1 text-lg">
        <Link href={`/servis/${s.slug}`} className="hover:text-acc">{s.title}</Link>
      </h2>
      <p className="mb-3 text-sm text-muted">{s.summary}</p>
      {s.items.length > 0 && (
        <ul className="mb-4 space-y-1.5 text-sm">
          {s.items.map((i) => (
            <li key={i} className="flex gap-2">
              <CheckIcon size={16} className="mt-0.5 shrink-0 text-acc" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-sm font-semibold">{low ? priceText(low) : <span className="font-normal text-muted">Cena na dotaz</span>}</span>
        <Link href={`/servis/${s.slug}`} className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
          Podrobnosti a ceník →
        </Link>
      </div>
    </article>
  );
}
