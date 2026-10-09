"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import type { CardImage } from "@/lib/vehicles/public";
import { VehicleImage } from "./VehicleImage";

type Props = {
  images: CardImage[];
  href: string;
  sizes: string;
  priority?: boolean;
  /** Štítky přes fotku (např. Prodáno) – nereagují na kliknutí. */
  children?: ReactNode;
};

/**
 * Fotky na kartě vozu: listování prstem (přejetí) nebo šipkami bez otevření detailu, klik na fotku otevře vůz.
 * Posuv zajišťuje prohlížeč (scroll-snap), proto je plynulý a funguje i na dotykových displejích.
 */
export function CardGallery({ images, href, sizes, priority = false, children }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // První dotyk/najetí: ostatní fotky se načtou předem, aby při listování nebyla prázdná místa.
  const [warm, setWarm] = useState(false);
  const count = images.length;

  function onScroll() {
    const el = scroller.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }
  function go(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * (scroller.current?.clientWidth ?? 0), behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:hidden";

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-card2" onPointerEnter={() => setWarm(true)} onTouchStart={() => setWarm(true)} onFocus={() => setWarm(true)}>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {count === 0 ? (
          <Link href={href} tabIndex={-1} aria-hidden="true" className="block h-full w-full shrink-0">
            <VehicleImage image={null} sizes={sizes} className="h-full w-full" />
          </Link>
        ) : (
          images.map((img, i) => (
            <Link key={img.id} href={href} tabIndex={-1} aria-hidden="true" className="relative block h-full w-full shrink-0 basis-full snap-center">
              <VehicleImage image={img} sizes={sizes} priority={priority && i === 0} eager={warm && i < 4} className="h-full w-full" />
            </Link>
          ))
        )}
      </div>
      {children && <div className="pointer-events-none absolute inset-0">{children}</div>}
      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Předchozí fotka" className={`${arrow} left-2 disabled:hidden`}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => go(1)} disabled={index >= count - 1} aria-label="Další fotka" className={`${arrow} right-2 disabled:hidden`}>
            <ChevronRight size={20} />
          </button>
          <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white" aria-hidden="true">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
}
