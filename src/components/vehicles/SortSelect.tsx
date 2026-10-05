"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS, type SortKey } from "@/lib/validation/filters";

export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(sort: string) {
    const qs = new URLSearchParams(params);
    qs.delete("page");
    if (sort === "doporucene") qs.delete("sort");
    else qs.set("sort", sort);
    const query = qs.toString();
    router.push(query ? `/vozy?${query}` : "/vozy", { scroll: false });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Řadit:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field w-auto">
        {Object.entries(SORT_OPTIONS).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>
    </label>
  );
}
