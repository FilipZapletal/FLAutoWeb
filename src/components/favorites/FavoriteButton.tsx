"use client";

import { HeartIcon } from "@/components/ui/icons";
import { useFavorites } from "@/lib/favorites";

type Props = { vehicleId: number; label: string; variant?: "icon" | "labeled"; className?: string };

/** Srdíčko: uloží vůz do oblíbených (bez registrace, jen v prohlížeči). */
export function FavoriteButton({ vehicleId, label, variant = "icon", className = "" }: Props) {
  const { has, toggle } = useFavorites();
  const active = has(vehicleId);
  const aria = active ? `Odebrat z oblíbených: ${label}` : `Uložit do oblíbených: ${label}`;

  if (variant === "labeled") {
    return (
      <button type="button" onClick={() => toggle(vehicleId)} aria-pressed={active} aria-label={aria} className={`btn-outline ${active ? "border-acc text-acc" : ""} ${className}`}>
        <HeartIcon size={16} filled={active} /> {active ? "V oblíbených" : "Uložit do oblíbených"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => toggle(vehicleId)}
      aria-pressed={active}
      aria-label={aria}
      title={active ? "Odebrat z oblíbených" : "Uložit do oblíbených"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/55 backdrop-blur transition hover:bg-black/75 ${active ? "text-acc2" : "text-white"} ${className}`}
    >
      <HeartIcon size={18} filled={active} />
    </button>
  );
}
