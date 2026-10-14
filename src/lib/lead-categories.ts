// Rozdělení poptávek a objednávek na „služby“ pro nástěnku a kalendář v administraci:
// vozy (prohlídky, rezervace…), auto na přání a každá služba servisu zvlášť. Každá má svou barvu.

export type LeadCategory = { key: string; label: string; color: string };

/** Barvy (středně sytá, čitelná na tmavém i světlém pozadí; text na nich je černý). */
const PALETTE = ["#38bdf8", "#f59e0b", "#34d399", "#a78bfa", "#fb923c", "#2dd4bf", "#f472b6", "#a3e635"];

const KNOWN_SERVICE_COLORS: Record<string, string> = {
  "autoservis-pneuservis": "#f59e0b",
  "priprava-na-stk-emise": "#34d399",
  "crystal-finish": "#a78bfa",
  "dovoz-aut-z-eu": "#fb923c",
};

export const CARS_CATEGORY: LeadCategory = { key: "vozy", label: "Vozy (prohlídky, rezervace)", color: "#38bdf8" };
export const WANTED_CATEGORY: LeadCategory = { key: "hledane", label: "Auto na přání", color: "#f472b6" };
export const OTHER_SERVICE_CATEGORY: LeadCategory = { key: "servis", label: "Servis (neurčeno)", color: "#9ca3af" };

type ServiceRef = { id: number; slug: string; title: string };

export const SERVICE_KEY_PREFIX = "s-";

export function serviceCategory(s: ServiceRef): LeadCategory {
  return { key: `${SERVICE_KEY_PREFIX}${s.slug}`, label: s.title, color: KNOWN_SERVICE_COLORS[s.slug] ?? PALETTE[s.id % PALETTE.length] };
}

/** Do které „služby“ poptávka patří. */
export function leadCategory(lead: { type: string; service?: ServiceRef | null }): LeadCategory {
  if (lead.type === "WANTED_CAR") return WANTED_CATEGORY;
  if (lead.type === "SERVICE") return lead.service ? serviceCategory(lead.service) : OTHER_SERVICE_CATEGORY;
  return CARS_CATEGORY;
}
