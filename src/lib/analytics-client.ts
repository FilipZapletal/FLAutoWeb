// Anonymní měření návštěvnosti z prohlížeče: bez cookies a bez ukládání čehokoli do zařízení.
// Respektuje nastavení „Do Not Track“. Výsledky vidí jen správci v administraci.

type Payload = { type: "view" | "action"; path: string; name?: string; entry?: boolean; ref?: string; device?: "mobile" | "desktop" };

const doNotTrack = () => navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1";

export function sendStat(p: Payload) {
  try {
    if (doNotTrack()) return;
    const body = JSON.stringify(p);
    if (navigator.sendBeacon) navigator.sendBeacon("/api/stat", new Blob([body], { type: "text/plain" }));
    else void fetch("/api/stat", { method: "POST", body, keepalive: true });
  } catch {}
}

/** Zaznamená akci návštěvníka (zavolání, WhatsApp, e-mail, mapa, oblíbené…). */
export function track(name: "call" | "whatsapp" | "email" | "social" | "map_show" | "wanted_open" | "favorite_add") {
  sendStat({ type: "action", name, path: window.location.pathname });
}
