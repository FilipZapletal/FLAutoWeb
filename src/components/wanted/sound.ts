// Zvuk při objevení bublinky. Hraje se jen pokud ho prohlížeč povolí: zvuk smí začít až po prvním
// kliknutí, klepnutí nebo stisku klávesy na webu (samotné posouvání stránky se nepočítá),
// jinak se nezahraje nic a bublinka se objeví tiše.

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;
let armed = false;

// Safari bere jako povolení až „click“ a „touchend“, Chrome už „pointerdown“ – posloucháme všechno.
const UNLOCK_EVENTS = ["pointerdown", "mousedown", "touchstart", "touchend", "click", "keydown"] as const;

/** Při první akci návštěvníka odemkne přehrávání zvuku. Bezpečné volat opakovaně. */
export function armChime() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const unlock = () => {
    try {
      const Ctor: AudioContextCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
      if (!Ctor) return;
      ctx ??= new Ctor();
      void ctx.resume();
      if (ctx.state === "running") UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
    } catch {}
  };
  UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, unlock, { passive: true, capture: true }));
}

/** Dva zřetelné tóny (cinknutí). Vrací true, když se zvuk opravdu spustil (bez odemčení prohlížečem false). */
export function playChime() {
  const c = ctx;
  if (!c || c.state !== "running" || document.visibilityState !== "visible") return false;
  const t0 = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.35;
  master.connect(c.destination);
  for (const [freq, delay] of [
    [880, 0],
    [1318.5, 0.16],
  ]) {
    // Základní tón a o oktávu vyšší tón navíc, aby byl zvuk zřetelnější i na malém reproduktoru telefonu.
    for (const [mult, level] of [
      [1, 1],
      [2, 0.25],
    ]) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      gain.gain.setValueAtTime(0.0001, t0 + delay);
      gain.gain.exponentialRampToValueAtTime(level, t0 + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.8);
      osc.connect(gain).connect(master);
      osc.start(t0 + delay);
      osc.stop(t0 + delay + 0.85);
    }
  }
  return true;
}
