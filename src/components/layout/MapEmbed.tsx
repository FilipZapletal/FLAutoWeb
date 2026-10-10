"use client";

import { useState } from "react";
import { PinIcon } from "@/components/ui/icons";

/** Mapa se načte až po kliknutí – Google nedostane data návštěvníka bez jeho akce. */
export function MapEmbed({ address }: { address: string }) {
  const [show, setShow] = useState(false);
  const q = encodeURIComponent(address);

  if (show) {
    return (
      <iframe
        title={`Mapa – ${address}`}
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        className="aspect-[4/3] w-full rounded-inner border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-inner bg-card2 p-6 text-center">
      <PinIcon size={32} className="text-acc" />
      <p className="text-sm text-muted">Mapa se načte ze služby Google Maps.</p>
      <button type="button" onClick={() => setShow(true)} className="btn-outline btn-sm">
        Zobrazit mapu
      </button>
    </div>
  );
}
