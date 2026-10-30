"use client";

import { useState } from "react";
import { TimeSelect } from "@/components/forms/TimeField";
import { useAdminAction } from "./useAdminAction";

type Props = {
  id: number;
  /** Platný termín jako "RRRR-MM-DD" (domluvený, jinak přání zákazníka) – výchozí hodnota formuláře */
  date: string | null;
  /** Platný čas "HH:MM" (domluvený, jinak přání zákazníka) */
  time: string | null;
  confirmed: boolean;
  /** Dnešní datum v Praze "RRRR-MM-DD" */
  min: string;
};

/** Domluvený termín servisní objednávky: majitel ho po telefonu potvrdí (nebo změní) a nástěnka ukazuje už jeho. */
export function LeadBookingForm({ id, date, time, confirmed, min }: Props) {
  const { run, pending } = useAdminAction();
  const [d, setD] = useState(date ?? "");
  const [t, setT] = useState(time ?? "");

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
        <TimeSelect defaultValue={time} onChange={setT} className="field w-auto py-1.5 text-sm" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={pending || !d} onClick={() => run(`/api/leads/${id}`, "PUT", { confirmedDate: d, confirmedTime: t || null })} className="btn btn-sm">
          {confirmed ? "Uložit změnu" : "Potvrdit termín"}
        </button>
        {confirmed && (
          <button type="button" disabled={pending} onClick={() => confirm("Zrušit potvrzený termín? Zákazník dostane e-mail, že byl termín zrušen.") && run(`/api/leads/${id}`, "PUT", { confirmedDate: null, confirmedTime: null })} className="btn-outline btn-sm">
            Zrušit potvrzení
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        {confirmed
          ? "Na nástěnce a v připomenutí platí tento termín, ne přání zákazníka. Při změně nebo zrušení dostane zákazník e-mail."
          : "Potvrzený termín je závazný: objednávka přejde do stavu Potvrzeno a zákazník dostane e-mail s potvrzením (pokud ho vyplnil). Připomene se ráno v den termínu."}
      </p>
    </div>
  );
}
