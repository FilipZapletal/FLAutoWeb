import Link from "next/link";
import { ChevronLeft, ChevronRight } from "./icons";

/** Stránkování přes odkazy (funguje bez JS a je indexovatelné). */
export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (page: number) => string }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Stránkování">
      {page > 1 && (
        <Link href={href(page - 1)} className="btn-outline btn-sm" aria-label="Předchozí stránka">
          <ChevronLeft size={16} />
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-muted">…</span>}
          <Link href={href(p)} aria-current={p === page ? "page" : undefined} className={`btn-outline btn-sm ${p === page ? "border-acc text-acc" : ""}`}>
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} className="btn-outline btn-sm" aria-label="Další stránka">
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
