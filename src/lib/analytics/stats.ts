import "server-only";
import { db } from "@/lib/db";
import { pragueToday } from "@/lib/booking";
import { getPublicServices } from "@/lib/services/public";

const SESSION_GAP_MS = 30 * 60_000;

/** Co se počítá jako konverze (návštěvník nás kontaktoval): zavolání, WhatsApp, e-mail, odeslaná poptávka. */
export const isConversion = (name: string) => name === "call" || name === "whatsapp" || name === "email" || name.startsWith("lead_");

export const ACTION_LABELS: Record<string, string> = {
  call: "Klepnutí na telefon",
  whatsapp: "Klepnutí na WhatsApp",
  email: "Klepnutí na e-mail",
  lead_interest: "Poptávka: prohlídka vozu",
  lead_reservation: "Poptávka: rezervace vozu",
  lead_callback: "Poptávka: zavolat zpět",
  lead_test_drive: "Poptávka: zkušební jízda",
  lead_service: "Objednávka do servisu",
  lead_order: "Objednávka z ceníku (Crystal Finish)",
  lead_wanted: "Auto na přání",
  review: "Napsaná recenze",
  social: "Klepnutí na sociální síť",
  map_show: "Zobrazení mapy",
  wanted_open: "Otevření „Auto na přání“",
  favorite_add: "Uložení do oblíbených",
};

const PAGE_LABELS: Record<string, string> = {
  "/": "Úvodní stránka",
  "/vozy": "Nabídka vozů",
  "/servis": "Servis (přehled)",
  "/kontakt": "Kontakt",
  "/o-nas": "O nás",
  "/oblibene": "Oblíbená auta",
  "/obchodni-udaje": "Obchodní údaje",
  "/ochrana-osobnich-udaju": "Ochrana osobních údajů",
  "/cookies": "Cookies",
  "/reklamacni-rad": "Reklamační řád",
};

type Session = { start: Date; views: string[]; actions: string[]; source: string | null; device: string | null; converted: boolean };

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

export async function getAnalytics(days: number) {
  const todayIso = pragueToday();
  const from = new Date(`${todayIso}T00:00:00.000Z`);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  // Hranice dne podle pražského času: začátek prvního dne období (přibližně, tolerance ±2 h kvůli letnímu času je pro statistiku zanedbatelná).
  const since = new Date(from.getTime() - 2 * 3_600_000);

  const [rows, services, vehicles] = await Promise.all([
    db.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: [{ visitor: "asc" }, { createdAt: "asc" }],
      select: { visitor: true, kind: true, name: true, path: true, source: true, device: true, createdAt: true },
      take: 250_000,
    }),
    getPublicServices(),
    db.vehicle.findMany({ select: { slug: true, brand: true, model: true } }),
  ]);

  const serviceTitle = new Map(services.map((s) => [s.slug, s.title]));
  const vehicleName = new Map(vehicles.map((v) => [v.slug, `${v.brand} ${v.model}`]));

  const pageLabel = (path: string) => {
    if (PAGE_LABELS[path]) return PAGE_LABELS[path];
    if (path.startsWith("/vozy/")) return "Detail vozu";
    if (path.startsWith("/servis/")) return `Servis: ${serviceTitle.get(path.slice(8)) ?? path.slice(8)}`;
    return path;
  };

  // Návštěvy: události jednoho (jednodenního) návštěvníka rozdělené pauzou nad 30 minut.
  const sessions: Session[] = [];
  let cur: Session | null = null;
  let lastVisitor = "";
  let lastAt = 0;
  for (const r of rows) {
    const t = r.createdAt.getTime();
    if (!cur || r.visitor !== lastVisitor || t - lastAt > SESSION_GAP_MS) {
      cur = { start: r.createdAt, views: [], actions: [], source: null, device: null, converted: false };
      sessions.push(cur);
    }
    lastVisitor = r.visitor;
    lastAt = t;
    if (r.kind === "view") cur.views.push(r.path);
    else {
      cur.actions.push(r.name);
      if (isConversion(r.name)) cur.converted = true;
    }
    if (r.source && !cur.source) cur.source = r.source;
    if (r.device && !cur.device) cur.device = r.device;
  }

  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Prague" }).format(d);
  const visitorsPerDay = new Map<string, Set<string>>();
  for (const r of rows) {
    const k = day(r.createdAt);
    (visitorsPerDay.get(k) ?? visitorsPerDay.set(k, new Set()).get(k)!).add(r.visitor);
  }
  const sessionsPerDay = new Map<string, { sessions: number; converted: number }>();
  for (const s of sessions) {
    const k = day(s.start);
    const e = sessionsPerDay.get(k) ?? { sessions: 0, converted: 0 };
    e.sessions++;
    if (s.converted) e.converted++;
    sessionsPerDay.set(k, e);
  }
  const daily: { date: string; visitors: number; sessions: number; converted: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    daily.push({ date: iso, visitors: visitorsPerDay.get(iso)?.size ?? 0, sessions: sessionsPerDay.get(iso)?.sessions ?? 0, converted: sessionsPerDay.get(iso)?.converted ?? 0 });
  }

  const visitors = daily.reduce((n, d) => n + d.visitors, 0);
  const pageviews = rows.filter((r) => r.kind === "view").length;
  const converted = sessions.filter((s) => s.converted).length;
  const bounced = sessions.filter((s) => s.views.length <= 1 && s.actions.length === 0).length;
  const n = sessions.length;
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

  // Cesta k akci: kolik návštěv došlo do jednotlivých kroků.
  const sawOffer = sessions.filter((s) => s.views.some((p) => p === "/vozy" || p.startsWith("/vozy/"))).length;
  const sawDetail = sessions.filter((s) => s.views.some((p) => p.startsWith("/vozy/"))).length;
  const stepCounts = [
    { label: "Přišli na web", count: n },
    { label: "Prohlédli si nabídku vozů", count: sawOffer },
    { label: "Otevřeli detail vozu", count: sawDetail },
    { label: "Kontaktovali nás (konverze)", count: converted },
  ];
  const funnel = stepCounts.map((s, i) => ({
    ...s,
    pctOfFirst: pct(s.count, n),
    pctOfPrev: i === 0 ? 100 : pct(s.count, stepCounts[i - 1].count),
    lost: i === 0 ? 0 : Math.max(0, stepCounts[i - 1].count - s.count),
  }));

  // Kde odcházejí: poslední stránka návštěv bez konverze, vzhledem ke všem zobrazením té stránky.
  const viewsByLabel = new Map<string, number>();
  for (const r of rows) if (r.kind === "view") viewsByLabel.set(pageLabel(r.path), (viewsByLabel.get(pageLabel(r.path)) ?? 0) + 1);
  const exitsByLabel = new Map<string, number>();
  for (const s of sessions) {
    if (s.converted || s.views.length === 0) continue;
    const l = pageLabel(s.views[s.views.length - 1]);
    exitsByLabel.set(l, (exitsByLabel.get(l) ?? 0) + 1);
  }
  const noConv = n - converted;
  const exits = [...exitsByLabel.entries()]
    .map(([label, count]) => ({ label, count, shareOfLeavers: pct(count, noConv), exitRate: pct(count, viewsByLabel.get(label) ?? count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const count = (arr: (string | null | undefined)[], fallback: string) => {
    const m = new Map<string, number>();
    for (const x of arr) m.set(x ?? fallback, (m.get(x ?? fallback) ?? 0) + 1);
    return [...m.entries()].map(([label, c]) => ({ label, count: c, pct: pct(c, arr.length) })).sort((a, b) => b.count - a.count);
  };
  const sources = count(sessions.map((s) => s.source), "Neznámý").slice(0, 8);
  const devices = count(sessions.map((s) => (s.device === "mobile" ? "Telefon" : s.device === "desktop" ? "Počítač a tablet" : null)), "Neznámé");

  const actionCounts = new Map<string, number>();
  for (const r of rows) if (r.kind === "action") actionCounts.set(r.name, (actionCounts.get(r.name) ?? 0) + 1);
  const actions = [...actionCounts.entries()]
    .map(([name, c]) => ({ name, label: ACTION_LABELS[name] ?? name, count: c, conversion: isConversion(name) }))
    .sort((a, b) => Number(b.conversion) - Number(a.conversion) || b.count - a.count);

  const pageCounts = new Map<string, number>();
  const vehicleCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.kind !== "view") continue;
    const l = pageLabel(r.path);
    pageCounts.set(l, (pageCounts.get(l) ?? 0) + 1);
    if (r.path.startsWith("/vozy/")) {
      const v = vehicleName.get(r.path.slice(6)) ?? r.path.slice(6);
      vehicleCounts.set(v, (vehicleCounts.get(v) ?? 0) + 1);
    }
  }
  const top = (m: Map<string, number>, k = 8) => [...m.entries()].map(([label, views]) => ({ label, views })).sort((a, b) => b.views - a.views).slice(0, k);

  return {
    days,
    hasData: rows.length > 0,
    totals: { visitors, sessions: n, pageviews, converted, conversionRate: pct(converted, n), bounced, bounceRate: pct(bounced, n), noConversion: noConv, noConversionRate: pct(noConv, n) },
    funnel,
    exits,
    sources,
    devices,
    actions,
    daily,
    topPages: top(pageCounts),
    topVehicles: top(vehicleCounts, 6),
  };
}
