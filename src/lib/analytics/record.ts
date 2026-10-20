import "server-only";
import { createHmac } from "node:crypto";
import { SESSION_COOKIE } from "@/lib/auth/token";
import { db } from "@/lib/db";
import { pragueToday } from "@/lib/booking";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Anonymní měření návštěvnosti: bez cookies, bez ukládání IP adresy.
 * Návštěvník se pozná jen podle jednodenního otisku HMAC(klíč platný jen pro daný den; IP + prohlížeč).
 * Z otisku nejde zjistit IP a druhý den vznikne úplně jiný, takže člověka nelze sledovat v čase.
 */

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|fetch|monitor|uptime|vercel|scanner/i;

/** Akce, které smí poslat prohlížeč. Odeslané poptávky a recenze zaznamenává server sám. */
export const CLIENT_ACTIONS = ["call", "whatsapp", "email", "social", "map_show", "wanted_open", "favorite_add"] as const;

function secret() {
  return process.env.ANALYTICS_SALT || process.env.SESSION_SECRET || "flauto-analytics";
}

export function visitorHash(req: Request) {
  const day = pragueToday();
  const key = createHmac("sha256", secret()).update(`day:${day}`).digest();
  return createHmac("sha256", key).update(`${clientIp(req)}|${req.headers.get("user-agent") ?? ""}`).digest("hex").slice(0, 20);
}

/** Zdroj návštěvy podle hostitele odkazující stránky (ukládá se jen název zdroje). */
export function sourceFromReferrerHost(host: string | undefined, ownHost: string | null) {
  const h = (host ?? "").toLowerCase().replace(/^www\./, "");
  if (!h || (ownHost && h === ownHost.toLowerCase().replace(/^www\./, ""))) return "Přímý vstup";
  if (/(^|\.)google\./.test(h)) return "Google";
  if (/seznam\.cz$/.test(h)) return "Seznam";
  if (/bing\.com$/.test(h)) return "Bing";
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(h)) return "Facebook";
  if (/instagram\.com$/.test(h)) return "Instagram";
  if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(h)) return "X";
  if (/youtube\.com$|youtu\.be$/.test(h)) return "YouTube";
  if (/sauto\.cz$|tipcars\.com$|autoesa\.cz$|bazos\.cz$|aaaauto\.cz$/.test(h)) return "Inzertní portál";
  return h.slice(0, 60);
}

/** Jen cesta stránky (bez parametrů, které by mohly obsahovat osobní údaje). */
export function normalizePath(p: string) {
  let path = p;
  try {
    path = new URL(p, "http://x").pathname;
  } catch {
    return null;
  }
  path = path.replace(/\/+$/, "") || "/";
  if (path.length > 150 || !/^\/[\w\-/%.]*$/.test(path)) return null;
  if (/^\/(admin|api|_next|media)(\/|$)/.test(path)) return null;
  return path;
}

type EventInput = { kind: "view" | "action"; name: string; path: string; entry?: boolean; referrerHost?: string; device?: "mobile" | "desktop" };

/** Uloží událost. Boty, přihlášení správci a nadměrné množství požadavků se přeskočí. */
export async function recordEvent(req: Request, e: EventInput) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return false;
  if ((req.headers.get("cookie") ?? "").includes(`${SESSION_COOKIE}=`)) return false; // vlastní procházení majitelů se nepočítá
  const path = normalizePath(e.path);
  if (!path) return false;
  const visitor = visitorHash(req);
  if (!rateLimit(`stat:${visitor}`, 120, 60_000).ok) return false;
  const ownHost = new URL(req.url).hostname;
  await db.analyticsEvent.create({
    data: {
      visitor,
      kind: e.kind,
      name: e.kind === "view" ? path : e.name,
      path,
      source: e.entry ? sourceFromReferrerHost(e.referrerHost, ownHost) : null,
      device: e.device ?? null,
    },
  });
  return true;
}

/** Cesta stránky, ze které přišel požadavek (z hlavičky Referer), pro událost zaznamenanou serverem. */
export function refererPath(req: Request) {
  try {
    const ref = req.headers.get("referer");
    return ref ? normalizePath(new URL(ref).pathname) ?? "/" : "/";
  } catch {
    return "/";
  }
}

/** Smaže data starší než daný počet dní (zásada uchování). */
export async function purgeOldEvents(days = 395, now = new Date()) {
  const { count } = await db.analyticsEvent.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - days * 86_400_000) } } });
  return count;
}
