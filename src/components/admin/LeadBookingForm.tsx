"use client";

import { useState } from "react";
import { TimeSlot } from "@/generated/prisma/enums";
import { TIME_SLOT_LABELS } from "@/lib/labels";
import { useAdminAction } from "./useAdminAction";

type Props = {
  id: number;
  /** Platný termín jako "RRRR-MM-DD" (domluvený, jinak přání zákazníka) – výchozí hodnota formuláře */
  date: string | null;
  slot: TimeSlot | null;
  confirmed: boolean;
  /** Dnešní datum v Praze "RRRR-MM-DD" */
  min: string;
};

/** Domluvený termín servisní objednávky: majitel ho po telefonu potvrdí (nebo změní) a nástěnka ukazuje už jeho. */
export function LeadBookingForm({ id, date, slot, confirmed, min }: Props) {
  const { run, pending } = useAdminAction();
  const [d, setD] = useState(date ?? "");
  const [s, setS] = useState<TimeSlot | "">(slot ?? "");

  return (
    <div>
      <p className="label">{confirmed ? "Domluvený termín" : "Potvrdit termín"}</p>
      <div className="flex flex-wrap items-end gap-2">
        <input
          type="date"
          aria-label="Datum termínu"
          value={d}
          min={min}
          onChange={(e) => setD(e.target.value)}
          className="field w-auto py-1.5 text-sm"
        />
        <select aria-label="Část dne" value={s} onChange={(e) => setS(e.target.value as TimeSlot | "")} className="field w-auto py-1.5 text-sm">
          <option value="">Bez upřesnění</option>
          {Object.values(TimeSlot).map((t) => (
            <option key={t} value={t}>{TIME_SLOT_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={pending || !d} onClick={() => run(`/api/leads/${id}`, "PUT", { confirmedDate: d, confirmedSlot: s || null })} className="btn btn-sm">
          {confirmed ? "Uložit změnu" : "Potvrdit termín"}
        </button>
        {confirmed && (
          <button type="button" disabled={pending} onClick={() => run(`/api/leads/${id}`, "PUT", { confirmedDate: null, confirmedSlot: null })} className="btn-outline btn-sm">
            Zrušit potvrzení
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        {confirmed
          ? "Na nástěnce a v připomenutí platí tento termín, ne přání zákazníka."
          : "Po telefonu domluvený den se uloží a objednávka přejde do stavu Potvrzeno. Připomene se ráno v den termínu."}
      </p>
    </div>
  );
}
