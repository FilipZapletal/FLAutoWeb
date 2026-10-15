import type { ComponentProps, FormEvent, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { capitalizeFirst, capitalizeWords } from "@/lib/capitalize";

/** `idPrefix` zajistí unikátní id, když je na stránce víc formulářů se stejnými poli (např. vyskakovací okno). */
/** Automatická velká písmena při psaní: „words“ = každé slovo (jména), „first“ = jen první písmeno textu. */
type Capitalize = { capitalize?: "words" | "first" };

type Common = { label: string; name: string; error?: string; hint?: ReactNode; className?: string; idPrefix?: string };

function Wrapper({ label, name, error, hint, className = "", idPrefix = "", children }: Common & { children: ReactNode }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={`${idPrefix}fld-${name}`}>{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${idPrefix}fld-${name}-err`} className="mt-1 text-xs text-acc" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const aria = (name: string, error?: string, idPrefix = "") => ({
  id: `${idPrefix}fld-${name}`,
  name,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${idPrefix}fld-${name}-err` : undefined,
});

/** Při psaní doplní velká písmena a nechá kurzor na místě. */
function capitalizing(mode: "words" | "first" | undefined) {
  if (!mode) return {};
  return {
    autoCapitalize: mode === "words" ? "words" : "sentences",
    onInput: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      const next = mode === "words" ? capitalizeWords(el.value) : capitalizeFirst(el.value);
      if (next === el.value) return;
      const { selectionStart, selectionEnd } = el;
      el.value = next;
      el.setSelectionRange(selectionStart, selectionEnd);
    },
  };
}

export function InputField({ label, name, error, hint, className, idPrefix, capitalize, ...rest }: Common & Capitalize & ComponentProps<"input">) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className} idPrefix={idPrefix}>
      <input className="field" {...aria(name, error, idPrefix)} {...capitalizing(capitalize)} {...rest} />
    </Wrapper>
  );
}

export function SelectField({ label, name, error, hint, className, idPrefix, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className} idPrefix={idPrefix}>
      <select className="field" {...aria(name, error, idPrefix)} {...rest}>
        {children}
      </select>
    </Wrapper>
  );
}

export function TextareaField({ label, name, error, hint, className, idPrefix, capitalize, ...rest }: Common & Capitalize & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className} idPrefix={idPrefix}>
      <textarea className="field" {...aria(name, error, idPrefix)} {...capitalizing(capitalize)} {...rest} />
    </Wrapper>
  );
}

/** Skryté pole proti spamovým robotům. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Nevyplňujte <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-inner border border-acc/40 bg-acc/10 px-3 py-2 text-sm" role="alert">
      {message}
    </p>
  );
}
