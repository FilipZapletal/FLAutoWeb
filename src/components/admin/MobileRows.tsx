import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";

/**
 * Seznamy v administraci na telefonu: jeden záznam = jeden řádek (název, stav, 1–2 řádky shrnutí).
 * Klepnutím se otevře detail, kde jsou všechny údaje a akce. Na počítači se místo toho ukazují tabulky.
 */
export function RowList({ children, empty }: { children: ReactNode; empty?: string }) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <ul className="card mb-6 divide-y divide-line overflow-hidden md:hidden">
      {rows.length > 0 ? rows : <li className="px-4 py-3 text-sm text-muted">{empty ?? "Nic tu zatím není."}</li>}
    </ul>
  );
}

type RowProps = {
  href: string;
  title: ReactNode;
  /** Štítek vpravo od názvu (stav) */
  chip?: ReactNode;
  /** Jeden až dva krátké řádky pod názvem */
  lines?: ReactNode[];
  /** Obrázek nebo barevná tečka vlevo */
  leading?: ReactNode;
  /** Tlačítko vpravo mimo odkaz (např. zavolat, schválit) */
  aside?: ReactNode;
};

export function Row({ href, title, chip, lines = [], leading, aside }: RowProps) {
  return (
    <li className="flex items-center">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 active:bg-card2">
        {leading}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{title}</span>
          {(chip || lines.some(Boolean)) && (
            <span className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted">
              {chip && <span className="shrink-0 [&_.badge]:whitespace-nowrap [&_.badge]:!px-2 [&_.badge]:!py-0.5 [&_.badge]:!text-[10px]">{chip}</span>}
              <span className="min-w-0 truncate">{lines.filter(Boolean)[0]}</span>
            </span>
          )}
          {lines.filter(Boolean).slice(1).map((l, i) => (
            <span key={i} className="mt-0.5 block truncate text-xs text-muted">
              {l}
            </span>
          ))}
        </span>
        {!aside && <ChevronRightIcon size={16} className="shrink-0 text-muted" />}
      </Link>
      {aside && <span className="shrink-0 pr-3">{aside}</span>}
    </li>
  );
}
