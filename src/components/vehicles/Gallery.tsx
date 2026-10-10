"use client";

/* eslint-disable @next/next/no-img-element -- předgenerované WebP varianty se srcset */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CloseIcon, ExpandIcon } from "@/components/ui/icons";
import type { PublicImage } from "@/lib/vehicles/public";
import { VehicleImage } from "./VehicleImage";

/** Galerie: velké foto, šipky, náhledy, fullscreen (klávesy ←/→/Esc, swipe). */
export function Gallery({ images, title }: { images: PublicImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen, go]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  if (count === 0) {
    return <VehicleImage image={null} sizes="100vw" className="aspect-[16/11] w-full rounded-inner" />;
  }

  const current = images[index];
  const arrowClass = "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/80";

  return (
    <div className="min-w-0">
      <div className="group relative aspect-[16/11] overflow-hidden rounded-inner bg-card2" {...swipe}>
        <button type="button" className="block h-full w-full cursor-zoom-in" onClick={() => setFullscreen(true)} aria-label="Zobrazit fotku na celou obrazovku">
          <VehicleImage image={current} sizes="(min-width: 768px) 560px, 100vw" priority={index === 0} className="h-full w-full" />
        </button>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${arrowClass} left-2`} aria-label="Předchozí fotka">
              <ChevronLeft size={22} />
            </button>
            <button type="button" onClick={() => go(1)} className={`${arrowClass} right-2`} aria-label="Další fotka">
              <ChevronRight size={22} />
            </button>
          </>
        )}
        <span className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
          <ExpandIcon size={12} /> {index + 1} / {count}
        </span>
      </div>

      {count > 1 && (
        <div className="mt-2 flex w-full max-w-full gap-2 overflow-x-auto pb-1" role="list" aria-label="Náhledy fotografií">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="listitem"
              onClick={() => setIndex(i)}
              aria-label={`Fotka ${i + 1}`}
              aria-current={i === index}
              className={`aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl border-2 sm:w-24 ${i === index ? "border-acc" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <img src={img.thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" role="dialog" aria-modal="true" aria-label={`Fotogalerie – ${title}`} {...swipe}>
          <img src={current.large} srcSet={current.srcSet} sizes="100vw" alt={current.alt} className="h-full w-full object-contain" />
          <button type="button" onClick={() => setFullscreen(false)} className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Zavřít" autoFocus>
            <CloseIcon size={24} />
          </button>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className={`${arrowClass} left-3`} aria-label="Předchozí fotka">
                <ChevronLeft size={28} />
              </button>
              <button type="button" onClick={() => go(1)} className={`${arrowClass} right-3`} aria-label="Další fotka">
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <span className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 text-sm text-white/80">
            {index + 1} / {count}
          </span>
        </div>
      )}
    </div>
  );
}
