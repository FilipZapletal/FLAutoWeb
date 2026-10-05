const nf = new Intl.NumberFormat("cs-CZ");

export const formatNumber = (n: number) => nf.format(n);
export const formatPrice = (n: number) => `${nf.format(n)} Kč`;
export const formatKm = (n: number) => `${nf.format(n)} km`;

/** Formát MM/RRRR (STK, první registrace). Datum se ukládá jako UTC půlnoc. */
export function formatMonthYear(d: Date | string | null | undefined) {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

/** Datum a čas v české časové zóně (admin). */
export function formatDateTime(d: Date | string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(typeof d === "string" ? new Date(d) : d);
}

/** Telefon do odkazu tel: / wa.me (jen číslice, s předvolbou). */
export function phoneDigits(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function whatsappLink(phone: string, text?: string) {
  const digits = phoneDigits(phone).replace(/^\+/, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
