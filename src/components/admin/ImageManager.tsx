"use client";

/* eslint-disable @next/next/no-img-element -- náhledy z vlastního úložiště */
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { ChevronLeft, ChevronRight, StarIcon, TrashIcon, UploadIcon } from "@/components/ui/icons";

export type ManagedImage = { id: number; isMain: boolean; thumb: string; src: string };

const MAX_EDGE = 2560;
/** Serverless hosting (Vercel) přijme tělo požadavku nejvýše 4,5 MB. */
const MAX_SEND_BYTES = 4 * 1024 * 1024;

/**
 * Zmenší fotku v prohlížeči před uploadem (rychlejší nahrávání z mobilu a
 * dodržení limitu velikosti požadavku na serverless hostingu). Finální
 * optimalizaci (WebP varianty) dělá server.
 */
async function downscale(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_EDGE && file.size < MAX_SEND_BYTES && file.type !== "image/heic") {
      bitmap.close();
      return file;
    }
    // Zmenší na MAX_EDGE; když je výsledek stále velký, zkusí menší rozměr a nižší kvalitu.
    let edge = Math.min(longest, MAX_EDGE);
    let quality = 0.9;
    let blob: Blob = file;
    for (let attempt = 0; attempt < 3; attempt++) {
      const scale = edge / longest;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality));
      if (blob.size < MAX_SEND_BYTES) break;
      edge = Math.round(edge * 0.8);
      quality -= 0.1;
    }
    bitmap.close();
    return blob;
  } catch {
    return file;
  }
}

export function ImageManager({ vehicleId, initial }: { vehicleId: number; initial: ManagedImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const dragId = useRef<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const base = `/api/vehicles/${vehicleId}/images`;

  async function call(url: string, init: RequestInit) {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) router.replace("/admin/prihlaseni");
    if (data.images) setImages(data.images);
    return { ok: res.ok, status: res.status, data };
  }

  async function upload(files: File[]) {
    const list = files.filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!list.length) return;
    setErrors([]);
    setProgress({ done: 0, total: list.length });
    const errs: string[] = [];
    for (const [i, file] of list.entries()) {
      const body = new FormData();
      body.append("files", await downscale(file), file.name.replace(/\.\w+$/, ".jpg"));
      const { ok, status, data } = await call(base, { method: "POST", body });
      if (data.errors?.length) errs.push(...data.errors);
      else if (data.error) errs.push(`${file.name}: ${data.error}`);
      else if (!ok) {
        // Server vrátil chybu bez JSON (např. příliš velký požadavek nebo vypršel časový limit).
        const why = status === 413 ? "soubor je příliš velký pro server" : status === 504 || status === 408 ? "server neodpověděl včas" : "neočekávaná odpověď serveru";
        errs.push(`${file.name}: nahrání selhalo (HTTP ${status}) – ${why}.`);
      }
      setProgress({ done: i + 1, total: list.length });
    }
    setErrors(errs);
    setProgress(null);
    router.refresh();
  }

  async function arrange(order: number[], mainId?: number) {
    const { ok, data } = await call(base, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order, mainId }) });
    if (!ok) alert(data.error ?? "Uložení pořadí se nepovedlo.");
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setImages(next);
    arrange(next.map((i) => i.id));
  }

  async function remove(id: number) {
    if (!confirm("Smazat tuto fotku?")) return;
    await call(`${base}/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function onDropFiles(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) upload([...e.dataTransfer.files]);
  }

  return (
    <div className="grid gap-5">
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDropFiles}
        className={`card flex flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-acc bg-acc/5" : ""}`}
      >
        <UploadIcon size={32} className="text-acc" />
        <p className="text-sm">Přetáhněte fotky sem, nebo</p>
        <button type="button" className="btn" disabled={!!progress} onClick={() => fileInput.current?.click()}>
          Vybrat fotky
        </button>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" multiple hidden onChange={(e) => {
          upload([...(e.target.files ?? [])]);
          e.target.value = "";
        }} />
        <p className="text-xs text-muted">JPG, PNG, WebP, AVIF · max. 15 MB na fotku · automaticky se zmenší a převedou do WebP</p>
        {progress && (
          <div className="w-full max-w-xs" role="status">
            <div className="h-1.5 overflow-hidden rounded bg-card2">
              <div className="h-full bg-acc transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">Nahrávám {progress.done} / {progress.total}…</p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="rounded border border-acc/40 bg-acc/10 px-4 py-3 text-sm" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {images.length === 0 ? (
        <p className="text-muted">Zatím žádné fotky. První nahraná fotka bude hlavní.</p>
      ) : (
        <>
          <p className="text-sm text-muted">Pořadí změníte přetažením nebo šipkami. Hvězdička = hlavní fotka (karta vozu, sdílení).</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img, i) => (
              <li
                key={img.id}
                draggable
                onDragStart={() => (dragId.current = img.id)}
                onDragOver={(e) => dragId.current !== null && e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const from = images.findIndex((x) => x.id === dragId.current);
                  dragId.current = null;
                  if (from >= 0) move(from, i);
                }}
                className={`card cursor-grab overflow-hidden active:cursor-grabbing ${img.isMain ? "border-acc" : ""}`}
              >
                <div className="relative aspect-[4/3]">
                  <img src={img.thumb} alt={`Fotka ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 text-xs text-white">{i + 1}</span>
                  {img.isMain && <span className="badge absolute right-1.5 top-1.5 bg-acc text-white">Hlavní</span>}
                </div>
                <div className="flex items-center justify-between gap-1 p-1.5">
                  <div className="flex">
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="p-1.5 text-muted hover:text-fg disabled:opacity-30" aria-label="Posunout dopředu">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="p-1.5 text-muted hover:text-fg disabled:opacity-30" aria-label="Posunout dozadu">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="flex">
                    <button type="button" onClick={() => arrange(images.map((x) => x.id), img.id)} className={`p-1.5 ${img.isMain ? "text-acc" : "text-muted hover:text-fg"}`} aria-label="Nastavit jako hlavní fotku" aria-pressed={img.isMain}>
                      <StarIcon size={16} filled={img.isMain} />
                    </button>
                    <button type="button" onClick={() => remove(img.id)} className="p-1.5 text-muted hover:text-acc" aria-label="Smazat fotku">
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
