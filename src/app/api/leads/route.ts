import { after, NextResponse, type NextRequest } from "next/server";
import { LeadStatus, LeadType } from "@/generated/prisma/enums";
import { guardAdmin, jsonError, readJson, validationError } from "@/lib/api";
import { purgeExpiredLeads } from "@/lib/leads/retention";
import { createLead, getLeads, LeadVehicleNotFoundError } from "@/lib/leads/service";
import { notifyNewLead } from "@/lib/notifications";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validation/lead";

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const type = sp.get("type");
  const leads = await getLeads({
    status: status && status in LeadStatus ? (status as LeadStatus) : undefined,
    type: type && type in LeadType ? (type as LeadType) : undefined,
  });
  return NextResponse.json(leads);
}

/** Veřejné: poptávka u vozu i objednávka do servisu. */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`lead:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) return jsonError(429, "Odeslali jste příliš mnoho poptávek. Zkuste to prosím za chvíli, nebo nám zavolejte.");

  const parsed = leadSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    // Vyplněný honeypot = robot. Tváříme se, že je vše v pořádku.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return NextResponse.json({ ok: true }, { status: 201 });
    return validationError(parsed.error);
  }
  try {
    const lead = await createLead(parsed.data);
    after(() => notifyNewLead(lead));
    // Pojistka: úklid proběhne i bez plánovače, kdykoli přijde nová poptávka.
    after(() => purgeExpiredLeads().catch((e) => console.error("Úklid poptávek selhal:", e)));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof LeadVehicleNotFoundError) return jsonError(404, "Vůz už není v nabídce.");
    throw e;
  }
}
