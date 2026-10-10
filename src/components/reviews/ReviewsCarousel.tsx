"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FacebookIcon, GoogleIcon, PlusIcon, QuoteIcon } from "@/components/ui/icons";
import { Stars } from "./Stars";

export type ReviewCardData = { id: number; author: string; text: string; rating: number; source: string | null };

/** Delší recenze se zkrátí na 5 řádků a rozbalí se kulatým tlačítkem „+“. */
const LONG_TEXT = 170;

function SourceIcon({ source }: { source: string | null }) {
  const s = source?.toLowerCase() ?? "";
  if (s.includes("google")) return <GoogleIcon size={26} />;
  if (s.includes("facebook")) return <FacebookIcon size={24} />;
  return <QuoteIcon size={24} />;
}

function ReviewCard({ r }: { r: ReviewCardData }) {
  const [open, setOpen] = useState(false);
  const long = r.text.length > LONG_TEXT;
  return (
    <figure className={`card relative flex min-h-72 w-[84%] shrink-0 snap-start flex-col rounded-card p-6 sm:w-[46%] lg:w-[31%] ${long ? "pb-16" : ""}`}>
      <div className="mb-4 flex items-center justify-between text-muted">
        <SourceIcon source={r.source} />
        {r.source && <span className="text-xs">{r.source}</span>}
      </div>
      <Stars rating={r.rating} size={22} tone="accent" className="mb-3" />
      <figcaption className="mb-2 font-display text-xl font-bold normal-case leading-tight [overflow-wrap:anywhere]">{r.author}</figcaption>
      <blockquote className={`whitespace-pre-line text-sm leading-relaxed text-muted [overflow-wrap:anywhere] ${open ? "" : "line-clamp-5"} ${long ? "" : "flex-1"}`}>
        {r.text}
      </blockquote>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Skrýt celou recenzi" : "Zobrazit celou recenzi"}
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-acc text-white shadow transition hover:bg-acc2"
        >
          <PlusIcon size={22} className={`transition-transform ${open ? "rotate-45" : ""}`} />
        </button>
      )}
    </figure>
  );
}

/**
 * Recenze v řadě, kterou lze listovat prstem (nebo šipkami na počítači). Další karta vždy trochu
 * vykukuje, aby bylo jasné, že je co listovat.
 */
export function ReviewsCarousel({ reviews }: { reviews: ReviewCardData[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const arrow = "rounded-full border border-line bg-card p-2 transition hover:border-acc";

  return (
    <div>
      {reviews.length > 1 && (
        <div className="mb-3 hidden justify-end gap-2 pointer-fine:flex">
          <button type="button" onClick={() => go(-1)} aria-label="Předchozí recenze" className={arrow}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Další recenze" className={arrow}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      <div ref={scroller} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reviews.map((r) => (
          <ReviewCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
