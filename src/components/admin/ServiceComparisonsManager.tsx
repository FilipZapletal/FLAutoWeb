"use client";

/* eslint-disable @next/next/no-img-element -- náhledy z vlastního úložiště a z vybraného souboru */
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { InputField } from "@/components/forms/Field";
import { downscaleImage } from "@/lib/images/downscale";

export type ManagedComparison = { id: number; caption: string | null; before: { thumb: string }; after: { thumb: string } };

/** Dvě fotky v jednom požadavku musí vyjít pod limitem 4,5 MB na serverless hostingu. */
const MAX_PER_PHOTO = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif";

function Slot({ label, file, onPick }: { label: string; file: File | null; onPick: (f: File | null) => void }) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <label className="card relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden border-2 border-dashed p-2 text-center text-sm transition-colors hover:border-acc">
      {preview ? <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <span className={`relative rounded-full px-3 py-1 font-semibold ${preview ? "bg-bg/80" : ""}`}>{label}</span>
      {!preview && <span className="relative text-xs text-muted">Vybrat fotku</span>}
      <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
    </label>
  );
}

export function ServiceComparisonsManager({ serviceId, initial }: { serviceId: number; initial: ManagedComparison[] }) {
  const router = useRouter();
  const base = `/api/services/${serviceId}/comparisons`;
  const [items, setItems] = useState(initial);
  const [before, setBefore] = useState<File | null>(null);
  const [after, setAfter] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotKey, setSlotKey] = useState(0);

  async function add() {
    if (!before || !after) return setError("Vyberte obě fotky – před i po.");
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("before", await downscaleImage(before, MAX_PER_PHOTO), "pred.jpg");
      body.append("after", await downscaleImage(after, MAX_PER_PHOTO), "po.jpg");
      body.append("caption", caption);
      const res = await fetch(base, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) return router.replace("/admin/prihlaseni");
      if (!res.ok) {
        const why = res.status === 413 ? "soubory jsou příliš velké pro server" : res.status === 504 || res.status === 408 ? "server neodpověděl včas" : "neočekávaná odpověď serveru";
        return setError([data.error ?? `Nahrání selhalo (HTTP ${res.status}) – ${why}.`, data.diagnostics].filter(Boolean).join(" "));
      }
      setItems(data.items);
      setBefore(null);
      setAfter(null);
      setCaption("");
      setSlotKey((k) => k + 1);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Smazat tuto dvojici fotek?")) return;
    const res = await fetch(`${base}/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return router.replace("/admin/prihlaseni");
    if (!res.ok) return setError(data.error ?? "Smazání se nepovedlo.");
    setItems(data.items);
    router.refresh();
  }

  return (
    <section className="card mt-6 p-5">
      <h2 className="mb-1 text-base">Fotky před a po</h2>
      <p className="mb-4 text-sm text-muted">
        Na stránce služby se zobrazí jako posuvník, kterým návštěvník přejíždí mezi stavem před a po. Fotky se zobrazují jen tam, nikde jinde na webu.
        Foťte oba snímky ze stejného místa a úhlu. Než fotku nahrajete, zakryjte registrační značku, pokud je vidět.
      </p>

      {items.length > 0 && (
        <ul className="mb-5 grid gap-3 sm:grid-cols-2">
          {items.map((c) => (
            <li key={c.id} className="rounded-inner border border-line p-2">
              <div className="grid grid-cols-2 gap-1">
                <img src={c.before.thumb} alt="Před" className="aspect-[4/3] w-full rounded-inner object-cover" />
                <img src={c.after.thumb} alt="Po" className="aspect-[4/3] w-full rounded-inner object-cover" />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm">{c.caption || <span className="text-muted">bez popisku</span>}</span>
                <button type="button" onClick={() => remove(c.id)} className="btn-outline btn-sm shrink-0 text-acc">Smazat</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mb-2 text-sm">Přidat novou dvojici</h3>
      <div key={slotKey} className="grid grid-cols-2 gap-3">
        <Slot label="Před" file={before} onPick={setBefore} />
        <Slot label="Po" file={after} onPick={setAfter} />
      </div>
      <InputField className="mt-3" label="Popisek (nepovinný)" name="caption" value={caption} maxLength={120} placeholder="např. Škoda Octavia – kompletní mytí a vosk" onChange={(e) => setCaption(e.target.value)} />
      {error && <p role="alert" className="mt-3 rounded-inner border border-acc/40 bg-acc/10 px-4 py-3 text-sm">{error}</p>}
      <button type="button" className="btn mt-3" disabled={busy || !before || !after} onClick={add}>
        {busy ? "Nahrávám…" : "Přidat dvojici"}
      </button>
    </section>
  );
}
