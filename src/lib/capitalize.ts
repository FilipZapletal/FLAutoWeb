// Velká písmena na začátku slov (jména, značky vozů) a vět. Používá formulář při psaní i server při ukládání.

/** Velké první písmeno každého slova („jan novák-svobodová“ → „Jan Novák-Svobodová“). Zbytek slova se nemění. */
export const capitalizeWords = (v: string) => v.replace(/(^|[\s\-'’(])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase("cs"));

/** Velké první písmeno textu. */
export const capitalizeFirst = (v: string) => v.replace(/^(\p{L})/u, (c) => c.toLocaleUpperCase("cs"));
