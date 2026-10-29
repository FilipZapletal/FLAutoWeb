"use client";

/* eslint-disable @next/next/no-img-element -- fotky z vlastního úložiště, varianty řeší srcSet */
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type Photo = { src: string; srcSet: string };

/**
 * Posuvník „před / po“. Tažením (myší i prstem) nebo šipkami na klávesnici se odkrývá fotka před přes fotku po.
 * Svislé posouvání stránky prstem zůstává funkční (`touch-action: pan-y`).
 */
export function BeforeAfterSlider({ before, after, width, height, caption }: { before: Photo; after: Photo; width: number; height: number; caption?: string | null }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const moveTo = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r?.width) setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  const onDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    moveTo(e.clientX);
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5;
    const next = e.key === "ArrowLeft" ? pos - step : e.key === "ArrowRight" ? pos + step : e.key === "Home" ? 0 : e.key === "End" ? 100 : null;
    if (next === null) return;
    e.preventDefault();
    setPos(Math.min(100, Math.max(0, next)));
  };

  const label = "absolute top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm";

  return (
    // Výška posuvníku nesmí přesáhnout okno: u fotek na výšku se zúží šířka (na mobilu je limit zbytečný, tam je šířka menší).
    <figure style={{ maxWidth: `calc(min(75svh, 680px) * ${width} / ${height})` }}>
      <div
        ref={box}
        className="relative w-full select-none overflow-hidden rounded-inner border border-line bg-card2"
        style={{ aspectRatio: `${width} / ${height}`, touchAction: "pan-y", cursor: dragging ? "grabbing" : "ew-resize" }}
        onPointerDown={onDown}
        onPointerMove={(e) => dragging && moveTo(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <img src={after.src} srcSet={after.srcSet} sizes="(min-width: 1024px) 560px, 100vw" alt="Vůz po ošetření" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <img
          src={before.src}
          srcSet={before.srcSet}
          sizes="(min-width: 1024px) 560px, 100vw"
          alt="Vůz před ošetřením"
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <span className={`${label} left-3`} aria-hidden="true">Před</span>
        <span className={`${label} right-3`} aria-hidden="true">Po</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]" style={{ left: `${pos}%` }} aria-hidden="true" />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Porovnání před a po"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`Zobrazeno ${Math.round(pos)} % fotky před`}
          onKeyDown={onKey}
          className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg outline-offset-2 focus-visible:outline-2 focus-visible:outline-acc"
          style={{ left: `${pos}%` }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}
