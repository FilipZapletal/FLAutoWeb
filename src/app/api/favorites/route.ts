import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cardInclude, PUBLIC_VEHICLE_WHERE, toVehicleCard } from "@/lib/vehicles/public";

const MAX_IDS = 60;

/** Veřejné: karty vozů podle ID uložených v oblíbených (jen vozy, které jsou veřejně v nabídce). */
export async function GET(req: NextRequest) {
  if (!rateLimit(`fav:${clientIp(req)}`, 60, 60_000).ok) return jsonError(429, "Příliš mnoho požadavků.");
  const ids = [...new Set((req.nextUrl.searchParams.get("ids") ?? "").split(",").map(Number))]
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, MAX_IDS);
  if (!ids.length) return NextResponse.json({ items: [] });

  const rows = await db.vehicle.findMany({ where: { id: { in: ids }, ...PUBLIC_VEHICLE_WHERE }, include: cardInclude });
  // Pořadí podle uloženého seznamu (nejnovější uložené první).
  const items = ids.flatMap((id) => rows.filter((r) => r.id === id).map(toVehicleCard));
  return NextResponse.json({ items });
}
