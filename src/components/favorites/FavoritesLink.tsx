"use client";

import Link from "next/link";
import { HeartIcon } from "@/components/ui/icons";
import { useFavorites } from "@/lib/favorites";

/** Odkaz na oblíbená auta s počtem uložených. */
export function FavoritesLink({ variant }: { variant: "desktop" | "mobile" }) {
  const { count } = useFavorites();
  const label = count > 0 ? `Oblíbená auta (${count})` : "Oblíbená auta";
  const badge = count > 0 && (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-acc px-1 text-[10px] font-bold leading-none text-white">{count}</span>
  );

  if (variant === "mobile") {
    return (
      <Link href="/oblibene" aria-label={label} className="btn-outline btn-sm relative">
        <HeartIcon size={16} filled={count > 0} className={count > 0 ? "text-acc" : ""} />
        {badge}
      </Link>
    );
  }
  return (
    <Link href="/oblibene" aria-label={label} title="Oblíbená auta" className="relative flex items-center gap-1.5 transition-opacity hover:opacity-70">
      <HeartIcon size={18} filled={count > 0} className={count > 0 ? "text-acc" : ""} />
      <span className="sr-only md:not-sr-only lg:sr-only xl:not-sr-only">Oblíbené</span>
      {badge}
    </Link>
  );
}
