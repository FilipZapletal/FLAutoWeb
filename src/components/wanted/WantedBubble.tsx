"use client";

import Link from "next/link";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { HeartIcon, ShieldIcon, SparkleIcon, WrenchIcon } from "@/components/ui/icons";
import { playChime } from "./sound";
import { patchSession, readSession } from "./storage";

type Item = {
  key: string;
  label: string;
  /** Kratší popisek na úzkém displeji */
  short: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  /** Bez odkazu = otevře okno „Auto na přání“ */
  href?: string;
};

const ITEMS: Item[] = [
  { key: "wanted", label: "Hledáte auto na přání?", short: "Auto na přání", Icon: HeartIcon },
  { key: "servis", label: "Autoservis & pneuservis", short: "Autoservis", Icon: WrenchIcon, href: "/servis/autoservis-pneuservis" },
  { key: "myti", label: "Ruční mytí", short: "Ruční mytí", Icon: SparkleIcon, href: "/servis/crystal-finish" },
  { key: "stk", label: "Příprava na STK & emise", short: "STK & emise", Icon: ShieldIcon, href: "/servis/priprava-na-stk-emise" },
];

/** Jedna nabídka je vidět 10 s (z toho dvakrát přejezd lesku). */
const CYCLE_MS = 10_000;
/** Délka jednoho přejezdu lesku – musí sedět s `--sweep` v globals.css. */
const BUBBLE_SWEEP_MS = 900;
const IDLE_MS = CYCLE_MS - 2 * BUBBLE_SWEEP_MS;

type Phase = "idle" | "out" | "in";

/**
 * Bublinka v rohu stránky, která střídá nabídky: Auto na přání a služby servisu.
 * Lesk jede zleva doprava a smaže aktuální popisek, pak zprava doleva a napíše další.
 * Po najetí myší (nebo při zaostření klávesnicí) se střídání zastaví.
 */
export function WantedBubble({ offerWanted, onOpenWanted, onHide }: { offerWanted: boolean; onOpenWanted: () => void; onHide: () => void }) {
  const items = offerWanted ? ITEMS : ITEMS.slice(1);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [kick, setKick] = useState(0);
  const paused = useRef(false);
  const phaseRef = useRef<Phase>("idle");

  // Cinknutí při prvním objevení bublinky v této návštěvě. Pokud prohlížeč zvuk zatím nepovolil
  // (návštěvník ještě nikam neklikl), zkusí se to při dalším zobrazení bublinky na úvodní stránce.
  useEffect(() => {
    if (readSession().chimed) return;
    if (playChime()) patchSession({ chimed: true });
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "idle" && paused.current) return;
    const t = setTimeout(
      () => {
        if (phase === "idle") setPhase("out");
        else if (phase === "out") {
          setIndex((i) => i + 1);
          setPhase("in");
        } else setPhase("idle");
      },
      phase === "idle" ? IDLE_MS : BUBBLE_SWEEP_MS,
    );
    return () => clearTimeout(t);
  }, [phase, kick]);

  const setPaused = (value: boolean) => {
    paused.current = value;
    if (!value && phaseRef.current === "idle") setKick((k) => k + 1);
  };

  const current = index % items.length;
  const item = items[current];
  const cls =
    "flex items-center rounded-l-full border border-r-0 border-line bg-card py-2.5 pl-4 pr-3 text-sm font-semibold transition-colors hover:border-acc";
  const label = (
    <span className="bubble-label grid" data-phase={phase}>
      {items.map((it, i) => (
        <span key={it.key} className={`col-start-1 row-start-1 flex items-center gap-2 whitespace-nowrap ${i === current ? "" : "invisible"}`} aria-hidden={i === current ? undefined : true}>
          <it.Icon size={16} className="text-acc" />
          <span className="hidden sm:inline">{it.label}</span>
          <span className="sm:hidden">{it.short}</span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      className="bubble-shine fixed bottom-20 right-3 z-30 flex items-center rounded-full shadow-lg md:bottom-5 md:right-5"
      data-phase={phase}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onFocusCapture={(e) => e.target.matches(":focus-visible") && setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {item.href ? (
        <Link key={item.key} href={item.href} className={cls}>
          {label}
        </Link>
      ) : (
        <button key={item.key} type="button" onClick={onOpenWanted} className={cls}>
          {label}
        </button>
      )}
      <button
        type="button"
        onClick={onHide}
        aria-label="Skrýt bublinku"
        title="Skrýt"
        className="rounded-r-full border border-line bg-card py-2.5 pl-2 pr-3 text-muted transition-colors hover:text-fg"
      >
        ×
      </button>
    </div>
  );
}
