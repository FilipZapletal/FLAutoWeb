"use client";

import { useSyncExternalStore } from "react";
import { canPersist } from "@/lib/consent";

// Oblíbená auta bez registrace: seznam ID vozů v prohlížeči (localStorage `fl_favorites`).
// Bez souhlasu s pohodlnými funkcemi se seznam drží jen v paměti stránky (po zavření zmizí).

const KEY = "fl_favorites";
const MAX = 60;
const EMPTY: number[] = [];

let ids: number[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): number[] {
  try {
    const v = JSON.parse(raw ?? "[]");
    return Array.isArray(v) ? v.filter((n): n is number => Number.isInteger(n) && n > 0).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    ids = parse(localStorage.getItem(KEY));
  } catch {
    ids = [];
  }
}

function persist() {
  if (!canPersist()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
}

function notify() {
  listeners.forEach((l) => l());
}

export function toggleFavorite(id: number) {
  ensureLoaded();
  ids = ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids].slice(0, MAX);
  persist();
  notify();
}

/** Ponechá jen vozy, které jsou ještě v nabídce (pořadí podle `allowed`). */
export function retainFavorites(allowed: number[]) {
  ensureLoaded();
  const next = ids.filter((id) => allowed.includes(id));
  if (next.length === ids.length) return;
  ids = next;
  persist();
  notify();
}

function getSnapshot() {
  ensureLoaded();
  return ids;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      ids = parse(e.newValue);
      cb();
    }
  };
  // Souhlas udělený později: aktuální seznam se uloží. Odmítnutí: stav v prohlížeči smaže souhlas, v paměti zůstane.
  const onConsent = () => persist();
  window.addEventListener("storage", onStorage);
  window.addEventListener("fl:consent-changed", onConsent);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("fl:consent-changed", onConsent);
  };
}

export function useFavorites() {
  const list = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return { ids: list, count: list.length, has: (id: number) => list.includes(id), toggle: toggleFavorite };
}
