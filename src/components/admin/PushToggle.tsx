"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "@/components/ui/icons";
import { armChime, playChime } from "@/lib/chime";

type State = "loading" | "hidden" | "ios-install" | "unsupported" | "denied" | "off" | "on";

const SW_URL = "/sw.js";
const SW_SCOPE = "/admin";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

async function currentSubscription() {
  const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/**
 * Tlačítko v hlavičce administrace: zapne/vypne upozornění na nové poptávky v tomto zařízení
 * (Web Push – chodí i při zavřeném webu). Když server nemá klíče, tlačítko se nezobrazí.
 */
export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // Je-li administrace otevřená, nová poptávka navíc zacinká přímo ve stránce (zvuk systémového upozornění
  // určuje telefon). Zvuk smí začít až po prvním klepnutí na stránku.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    armChime();
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "push") playChime();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/push");
        const { publicKey } = (await res.json()) as { publicKey: string | null };
        let next: State;
        if (!publicKey) next = "hidden";
        else if (!("serviceWorker" in navigator && "PushManager" in window && "Notification" in window)) next = isIos() && !isStandalone() ? "ios-install" : "unsupported";
        else if (Notification.permission === "denied") next = "denied";
        else next = (await currentSubscription()) && Notification.permission === "granted" ? "on" : "off";
        if (!cancelled) setState(next);
      } catch {
        if (!cancelled) setState("hidden");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setBusy(true);
    setNote(null);
    try {
      const { publicKey } = (await (await fetch("/api/push")).json()) as { publicKey: string };
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        setNote(
          permission === "denied"
            ? "Prohlížeč upozornění zablokoval. Povolte je v nastavení webu (ikona vedle adresy → Oznámení → Povolit) a načtěte stránku znovu."
            : "Prohlížeč upozornění nepovolil. Klikněte na ikonu vedle adresy webu → Oznámení → Povolit, načtěte stránku znovu a zkuste to ještě jednou.",
        );
        return;
      }
      await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("subscribe");
      setState("on");
      setNote("Upozornění zapnuta. Nové poptávky se budou hlásit i při zavřeném webu.");
    } catch {
      setNote("Upozornění se nepodařilo zapnout. Zkuste to prosím znovu.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setNote(null);
    try {
      const sub = await currentSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
      setNote("Upozornění v tomto zařízení vypnuta.");
    } catch {
      setNote("Upozornění se nepodařilo vypnout.");
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = (await res.json()) as { sent?: number; error?: string };
      setNote(res.ok ? (data.sent ? "Zkušební upozornění odesláno." : "Žádné zařízení není přihlášené.") : (data.error ?? "Odeslání se nezdařilo."));
    } catch {
      setNote("Odeslání se nezdařilo.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "hidden") return null;

  const stateHelp =
    state === "ios-install"
      ? "Na iPhonu upozornění fungují jen v aplikaci na ploše: v Safari klepněte na Sdílet → Přidat na plochu, otevřete administraci z ikony a zapněte upozornění tam (potřebujete iOS 16.4 nebo novější)."
      : state === "unsupported"
        ? "Tento prohlížeč upozornění nepodporuje. Zkuste Chrome, Edge, Firefox nebo Safari."
        : state === "denied"
          ? "Upozornění jsou v prohlížeči zablokovaná. Povolte je v nastavení webu (ikona zámku vedle adresy) a načtěte stránku znovu."
          : null;
  // Nápověda se ukáže až po klepnutí na tlačítko, ne samovolně.
  const info = note;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {state === "on" && (
          <button type="button" onClick={test} disabled={busy} className="hidden text-xs text-muted underline hover:text-fg sm:block">
            Vyzkoušet
          </button>
        )}
        <button
          type="button"
          onClick={state === "on" ? disable : state === "off" ? enable : () => setNote(stateHelp)}
          disabled={busy}
          aria-pressed={state === "on"}
          title={state === "on" ? "Upozornění na nové poptávky jsou zapnutá (klepnutím vypnete)" : "Zapnout upozornění na nové poptávky"}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
            state === "on" ? "border-acc text-acc" : "border-line text-muted hover:border-acc hover:text-fg"
          }`}
        >
          <BellIcon size={16} />
          <span className="hidden sm:inline">{state === "on" ? "Upozornění zapnuta" : "Zapnout upozornění"}</span>
        </button>
      </div>
      {info && (
        <div role="status" className="card absolute right-0 top-full z-20 mt-2 w-72 p-3 text-xs">
          <p>{info}</p>
          {state === "on" && (
            <button type="button" onClick={test} disabled={busy} className="mt-2 underline sm:hidden">
              Vyzkoušet upozornění
            </button>
          )}
          <button type="button" onClick={() => setNote(null)} className="mt-2 block text-muted underline">
            Zavřít
          </button>
        </div>
      )}
    </div>
  );
}
