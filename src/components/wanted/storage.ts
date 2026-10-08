import { canPersist } from "@/lib/consent";

// Stav okna „Auto na přání“.
// localStorage `fl_wanted` (jen se souhlasem s pohodlnými funkcemi): zavřeno/odesláno, kolikrát se okno samo ukázalo.
// sessionStorage `fl_wanted_session`: co návštěvník dělal během této návštěvy. Žádné osobní údaje.

const LONG_KEY = "fl_wanted";
const SESSION_KEY = "fl_wanted_session";

const DAY = 24 * 60 * 60 * 1000;
/** Bublinka po zavření okna zůstává tolik dní (i při další návštěvě). */
export const BUBBLE_DAYS = 30;
/** Po odeslání poptávky se okno ani bublinka tolik dní neukazují. */
export const SUBMIT_DAYS = 60;
/** Okno se samo ukáže nejvýše tolikrát (při různých návštěvách); pak už jen bublinka. */
export const MAX_AUTO_POPUPS = 3;
/** Čas strávený na webu, po kterém se okno samo ukáže. */
export const TIMER_MS = 5 * 60 * 1000;

export type Prefill = {
  car?: string;
  maxPrice?: number;
  yearFrom?: number;
  maxMileage?: number;
  fuel?: string;
  transmission?: string;
  bodyType?: string;
};

export type SessionState = {
  /** Návštěvník v katalogu použil filtry. */
  engaged: boolean;
  /** Otevřel detail vozu – z nabídky si vybral. */
  chosen: boolean;
  /** Odeslal nějakou poptávku (u vozu, servis, auto na přání). */
  inquirySent: boolean;
  /** Okno se v této návštěvě už samo ukázalo. */
  shown: boolean;
  /** Poslední hledání (pro předvyplnění). */
  prefill: Prefill | null;
  /** Aktivně strávený čas na webu v této návštěvě (ms). */
  activeMs: number;
};

const EMPTY: SessionState = { engaged: false, chosen: false, inquirySent: false, shown: false, prefill: null, activeMs: 0 };

export function readSession(): SessionState {
  try {
    return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "{}") };
  } catch {
    return EMPTY;
  }
}

export function patchSession(patch: Partial<SessionState>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...readSession(), ...patch }));
  } catch {}
}

type Long = { dismissedAt?: number; submittedUntil?: number; shownCount?: number };

function readLong(): Long {
  try {
    return JSON.parse(localStorage.getItem(LONG_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function patchLong(patch: Long) {
  if (!canPersist()) return; // bez souhlasu s pohodlnými funkcemi se nic nezapisuje
  try {
    localStorage.setItem(LONG_KEY, JSON.stringify({ ...readLong(), ...patch }));
  } catch {}
}

export const isSubmitted = () => (readLong().submittedUntil ?? 0) > Date.now();

/** Smí se okno samo ukázat (neodesláno a nepřekročen počet automatických zobrazení)? */
export const autoPopupAllowed = () => !isSubmitted() && (readLong().shownCount ?? 0) < MAX_AUTO_POPUPS;

/** Má se zobrazovat bublinka (okno bylo zavřeno a neodesláno)? */
export function bubbleWanted() {
  const l = readLong();
  return !isSubmitted() && typeof l.dismissedAt === "number" && Date.now() - l.dismissedAt < BUBBLE_DAYS * DAY;
}

export const markShown = () => patchLong({ shownCount: (readLong().shownCount ?? 0) + 1 });
export const markDismissed = () => patchLong({ dismissedAt: Date.now() });
export const hideBubble = () => patchLong({ dismissedAt: 0 });
export const markSubmitted = () => patchLong({ submittedUntil: Date.now() + SUBMIT_DAYS * DAY, dismissedAt: 0 });
