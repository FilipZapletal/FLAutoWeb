"use client";

import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

type SelectProps = {
  /** Výchozí čas "HH:MM" */
  defaultValue?: string | null;
  required?: boolean;
  onChange?: (time: string) => void;
  /** Název skrytého pole s výsledným časem "HH:MM" (prázdné = bez času) */
  name?: string;
  id?: string;
  invalid?: boolean;
  className?: string;
};

/** Výběr času dvěma rozbalovacími seznamy (hodina a minuty po 15), jednodušší než nativní pole pro čas. */
export function TimeSelect({ defaultValue, required, onChange, name, id, invalid, className = "field" }: SelectProps) {
  const [h, setH] = useState(defaultValue?.slice(0, 2) ?? "");
  const [m, setM] = useState(defaultValue?.slice(3, 5) ?? "00");
  const value = h ? `${h}:${m}` : "";
  const update = (nh: string, nm: string) => {
    setH(nh);
    setM(nm);
    onChange?.(nh ? `${nh}:${nm}` : "");
  };
  // Starší čas mimo čtvrthodiny (např. 14:10) se v seznamu nabídne taky.
  const minutes = MINUTES.includes(m) ? MINUTES : [...MINUTES, m].sort();

  return (
    <div className="flex items-center gap-2">
      <select
        id={id}
        aria-label="Hodina"
        aria-invalid={invalid || undefined}
        required={required}
        value={h}
        onChange={(e) => update(e.target.value, m)}
        className={className}
      >
        <option value="">{required ? "Hodina" : "—"}</option>
        {HOURS.map((x) => (
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
      <span aria-hidden="true">:</span>
      <select aria-label="Minuty" value={m} disabled={!h} onChange={(e) => update(h, e.target.value)} className={className}>
        {minutes.map((x) => (
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}

type FieldProps = { label: string; name: string; error?: string; required?: boolean; idPrefix?: string; className?: string };

export function TimeField({ label, name, error, required, idPrefix = "", className }: FieldProps) {
  const id = `${idPrefix}fld-${name}`;
  return (
    <div className={className}>
      <label className="label" htmlFor={id}>{label}</label>
      <TimeSelect id={id} name={name} required={required} invalid={!!error} />
      {error && (
        <p className="mt-1 text-xs text-acc" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
