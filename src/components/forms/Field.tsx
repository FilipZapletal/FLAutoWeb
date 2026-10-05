import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Common = { label: string; name: string; error?: string; hint?: ReactNode; className?: string };

function Wrapper({ label, name, error, hint, className = "", children }: Common & { children: ReactNode }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={`fld-${name}`}>{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`fld-${name}-err`} className="mt-1 text-xs text-acc" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const aria = (name: string, error?: string) => ({
  id: `fld-${name}`,
  name,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `fld-${name}-err` : undefined,
});

export function InputField({ label, name, error, hint, className, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className}>
      <input className="field" {...aria(name, error)} {...rest} />
    </Wrapper>
  );
}

export function SelectField({ label, name, error, hint, className, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className}>
      <select className="field" {...aria(name, error)} {...rest}>
        {children}
      </select>
    </Wrapper>
  );
}

export function TextareaField({ label, name, error, hint, className, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className}>
      <textarea className="field" {...aria(name, error)} {...rest} />
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
    <p className="rounded border border-acc/40 bg-acc/10 px-3 py-2 text-sm" role="alert">
      {message}
    </p>
  );
}
