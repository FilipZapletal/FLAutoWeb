import "server-only";
import webpush from "web-push";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

/**
 * Upozornění do zařízení přihlášených správců (Web Push). Funguje jen s nastavenými klíči
 * VAPID_PUBLIC_KEY a VAPID_PRIVATE_KEY – bez nich se nic neodesílá a tlačítko v administraci se skryje.
 * Chyba odeslání nikdy neshodí uložení poptávky.
 */

export type PushPayload = { title: string; body: string; url: string; tag?: string };

let configured: boolean | null = null;

export function pushPublicKey() {
  return pushConfigured() ? process.env.VAPID_PUBLIC_KEY!.trim() : null;
}

export function pushConfigured() {
  if (configured !== null) return configured;
  const pub = process.env.VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!pub || !priv) return (configured = false);
  // Kontakt pro poskytovatele push služeb: mailto: nebo https adresa (lokálně http nejde, proto záložní adresa).
  const site = siteUrl("/");
  const subject =
    process.env.VAPID_SUBJECT?.trim() ||
    (process.env.ADMIN_NOTIFY_EMAIL ? `mailto:${process.env.ADMIN_NOTIFY_EMAIL.trim()}` : site.startsWith("https://") ? site : "mailto:vyvoj@localhost.test");
  try {
    webpush.setVapidDetails(subject, pub, priv);
    return (configured = true);
  } catch (e) {
    console.error("Klíče pro upozornění (VAPID) nejsou platné:", e);
    return (configured = false);
  }
}

/** Pošle upozornění všem zařízením správců (nebo jen jednomu adminovi). Neplatná zařízení smaže. Vrací počet doručených. */
export async function sendPush(payload: PushPayload, opts: { adminId?: number } = {}) {
  if (!pushConfigured()) return 0;
  const subs = await db.pushSubscription.findMany({ where: opts.adminId ? { adminId: opts.adminId } : undefined });
  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 24 * 60 * 60, urgency: "high" }),
    ),
  );
  const gone: number[] = [];
  let sent = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") sent++;
    else {
      const status = (r.reason as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) gone.push(subs[i].id);
      else console.error("Odeslání upozornění selhalo:", r.reason);
    }
  });
  if (gone.length) await db.pushSubscription.deleteMany({ where: { id: { in: gone } } });
  return sent;
}
