export const SITE_NAME = "FL Auto";
export const SITE_TAGLINE = "Prodej · Servis · Mytí · STK";

export function siteUrl(path = "") {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Relativní URL (např. /media/...) → absolutní, pro OG a JSON-LD. */
export function absoluteUrl(url: string) {
  return /^https?:\/\//.test(url) ? url : siteUrl(url);
}
