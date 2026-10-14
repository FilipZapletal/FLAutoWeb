// Položky vybrané z ceníku služby (objednávka Crystal Finish), uložené u poptávky jako snapshot.

export type OrderItem = { label: string; price: number; from: boolean };

export function parseOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((v) => {
    const o = v as Partial<OrderItem> | null;
    return o && typeof o.label === "string" && typeof o.price === "number" ? [{ label: o.label, price: o.price, from: Boolean(o.from) }] : [];
  });
}

/** Součet cen; `fromAny` = aspoň jedna položka je „od“ (konečná cena podle rozsahu práce). */
export function orderTotal(items: OrderItem[]) {
  return { sum: items.reduce((n, i) => n + i.price, 0), fromAny: items.some((i) => i.from) };
}
