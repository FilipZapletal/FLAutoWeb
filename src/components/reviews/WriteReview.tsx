"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormError, Honeypot, InputField, TextareaField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";
import { StarIcon } from "@/components/ui/icons";

const P = "rv-"; // předpona id polí (na stránce může být víc formulářů)

/** Tlačítko „Napsat recenzi“ a okno s formulářem. Recenze se zveřejní až po schválení provozovatelem. */
export function WriteReview({ className = "" }: { className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const { submit, sending, done, error, fields, reset } = useJsonSubmit("/api/reviews/submit");

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    dialogRef.current?.close();
  }

  function openDialog() {
    reset();
    setRating(0);
    setOpen(true);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    submit({ ...fd, rating: rating || undefined });
  }

  const shown = hover || rating;

  return (
    <>
      <button type="button" onClick={openDialog} className={`btn-outline ${className}`}>
        Napsat recenzi
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="rv-title"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(34rem,calc(100vw-1.5rem))] overflow-y-auto rounded-card border border-line bg-card p-0 text-fg shadow-2xl backdrop:bg-black/70"
      >
        {open &&
          (done ? (
            <div className="p-6 text-center" role="status">
              <h2 id="rv-title" className="text-xl">Děkujeme za recenzi!</h2>
              <p className="mt-3 text-sm text-muted">Po schválení provozovatelem se zobrazí na webu.</p>
              <button type="button" onClick={close} className="btn mt-5">
                Zavřít
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="relative grid gap-4 p-5 sm:p-6" noValidate>
              <Honeypot />
              <div>
                <h2 id="rv-title" className="text-xl">Napsat recenzi</h2>
                <p className="mt-2 text-sm text-muted">Podělte se o svou zkušenost s FL Auto. Prosíme jen o pravdivé hodnocení.</p>
              </div>

              <fieldset>
                <legend className="label">Hodnocení *</legend>
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
                      <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" aria-label={`${n} z 5`} />
                      <StarIcon size={32} filled={n <= shown} className={`rounded text-acc transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-acc ${n <= shown ? "" : "opacity-50"}`} />
                    </label>
                  ))}
                </div>
                {fields.rating && <p className="mt-1 text-xs text-acc" role="alert">Vyberte hodnocení (počet hvězdiček)</p>}
              </fieldset>

              <InputField idPrefix={P} label="Jméno *" name="author" required maxLength={60} autoComplete="given-name" error={fields.author} hint="Zobrazí se u recenze. Stačí křestní jméno nebo jméno a iniciála, např. „Petr N.“" />
              <TextareaField idPrefix={P} label="Vaše recenze *" name="text" rows={5} required maxLength={1000} error={fields.text} />

              <FormError message={error} />
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn" disabled={sending}>
                  {sending ? "Odesílám…" : "Odeslat recenzi"}
                </button>
                <button type="button" onClick={close} className="btn-outline">
                  Zrušit
                </button>
              </div>
              <p className="text-xs text-muted">
                Odesláním souhlasíte se zveřejněním svého jména a textu recenze po schválení provozovatelem. Podrobnosti v{" "}
                <Link href="/ochrana-osobnich-udaju" className="underline" onClick={close}>
                  Ochraně osobních údajů
                </Link>
                .
              </p>
            </form>
          ))}
      </dialog>
    </>
  );
}
