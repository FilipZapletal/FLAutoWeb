import "server-only";
import type { Lead } from "@/generated/prisma/client";
import { LEAD_TYPE_LABELS } from "@/lib/labels";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { sendEmail } from "./email";

type LeadWithVehicle = Lead & { vehicle: { brand: string; model: string; version: string | null; slug: string } | null };

/**
 * Notifikace po nové poptávce. Zatím jen e-mail; další kanály (SMS, WhatsApp)
 * se přidají sem jako další odesílatelé. Chyba odeslání nikdy neshodí uložení leadu.
 */
export async function notifyNewLead(lead: LeadWithVehicle) {
  const settings = await getSettings();
  const vehicleName = lead.vehicle ? [lead.vehicle.brand, lead.vehicle.model, lead.vehicle.version].filter(Boolean).join(" ") : null;
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL || settings.email;

  const jobs: Promise<void>[] = [
    sendEmail({
      to: adminTo,
      replyTo: lead.email ?? undefined,
      subject: `Nová poptávka – ${vehicleName ?? LEAD_TYPE_LABELS[lead.type]}`,
      text: [
        "Nová poptávka z webu FL Auto",
        "",
        vehicleName ? `Vůz: ${vehicleName} (${siteUrl(`/vozy/${lead.vehicle!.slug}`)})` : null,
        `Typ: ${LEAD_TYPE_LABELS[lead.type]}`,
        `Jméno: ${lead.name}`,
        `Telefon: ${lead.phone}`,
        `E-mail: ${lead.email ?? "—"}`,
        lead.message ? `\nZpráva:\n${lead.message}` : null,
        "",
        `Detail v administraci: ${siteUrl(`/admin/poptavky/${lead.id}`)}`,
      ]
        .filter((l) => l !== null)
        .join("\n"),
    }),
  ];

  if (lead.email) {
    jobs.push(
      sendEmail({
        to: lead.email,
        replyTo: settings.email,
        subject: "Děkujeme za váš zájem – FL Auto",
        text: [
          "Dobrý den,",
          "",
          "děkujeme za váš zájem. Autobazar vás bude kontaktovat.",
          vehicleName ? `\nVaše poptávka: ${vehicleName}` : null,
          "",
          "FL Auto",
          settings.address,
          `Tel.: ${settings.phone}`,
          settings.email,
        ]
          .filter((l) => l !== null)
          .join("\n"),
      }),
    );
  }

  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === "rejected") console.error("Notifikace poptávky selhala:", r.reason);
}
