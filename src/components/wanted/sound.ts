// Tichý zvuk při objevení bublinky. Hraje se jen pokud ho prohlížeč povolí: zvuk smí začít až po
// prvním kliknutí, klepnutí nebo stisku klávesy na webu, jinak se nezahraje nic (žádná chyba).

let ctx: AudioContext | null = null;
let armed = false;

const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

/** Při první akci návštěvníka odemkne přehrávání zvuku. Bezpečné volat opakovaně. */
export function armChime() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const unlock = () => {
    UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
    try {
      ctx ??= new AudioContext();
      void ctx.resume();
    } catch {}
  };
  UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, unlock, { passive: true, capture: true }));
}

/** Dva jemné tóny (cinknutí). Bez odemčení přehrávání nic neudělá. */
export function playChime() {
  const c = ctx;
  if (!c || c.state !== "running" || document.visibilityState !== "visible") return;
  const t0 = c.currentTime;
  for (const [freq, delay] of [
    [880, 0],
    [1318.5, 0.14],
  ]) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + delay);
    gain.gain.exponentialRampToValueAtTime(0.08, t0 + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.5);
    osc.connect(gain).connect(c.destination);
    osc.start(t0 + delay);
    osc.stop(t0 + delay + 0.55);
  }
}
