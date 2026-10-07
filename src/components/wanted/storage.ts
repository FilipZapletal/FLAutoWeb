// Stav vyskakovacího formuláře „Sehnat auto na přání“.
// localStorage (fl_wanted): dokud se okno po zavření/odeslání nemá zobrazovat.
// sessionStorage (fl_wanted_session): co návštěvník během návštěvy dělal. Neobsahuje osobní údaje.

const LONG_KEY = "fl_wanted";
const SESSION_KEY = "fl_wanted_session";

const DAY = 24 * 60 * 60 * 1000;
/** Po zavření okna se několik dní znovu neukáže. */
export const DISMISS_DAYS = 14;
/** Po odeslání poptávky ještě déle. */
export const SUBMIT_DAYS = 60;

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
  /** Otevřel detail vozu nebo odeslal poptávku – z nabídky si vybral. */
  chosen: boolean;
  /** Okno se v této návštěvě už zobrazilo. */
  shown: boolean;
  /** Poslední hledání (pro předvyplnění). */
  prefill: Prefill | null;
};

const EMPTY: SessionState = { engaged: false, chosen: false, shown: false, prefill: null };

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

export function isHidden() {
  try {
    const until = Number(JSON.parse(localStorage.getItem(LONG_KEY) ?? "{}").hiddenUntil ?? 0);
    return until > Date.now();
  } catch {
    return false;
  }
}

/** Skryje okno na daný počet dní (nikdy nezkrátí už nastavenou dobu). */
export function hideFor(days: number) {
  try {
    const current = Number(JSON.parse(localStorage.getItem(LONG_KEY) ?? "{}").hiddenUntil ?? 0);
    localStorage.setItem(LONG_KEY, JSON.stringify({ hiddenUntil: Math.max(current, Date.now() + days * DAY) }));
  } catch {}
}
