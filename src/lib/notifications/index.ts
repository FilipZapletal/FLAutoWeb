import "server-only";
import type { Lead } from "@/generated/prisma/client";
import { formatBooking } from "@/lib/booking";
import { LEAD_TYPE_LABELS } from "@/lib/labels";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { sendEmail } from "./email";

type LeadWithVehicle = Lead & {
  vehicle: { brand: string; model: string; version: string | null; slug: string } | null;
  service: { title: string } | null;
};

/**
 * Notifikace po nové poptávce. Zatím jen e-mail; další kanály (SMS, WhatsApp)
 * se přidají sem jako další odesílatelé. Chyba odeslání nikdy neshodí uložení leadu.
 */
export async function notifyNewLead(lead: LeadWithVehicle) {
  const settings = await getSettings();
  const vehicleName = lead.vehicle ? [lead.vehicle.brand, lead.vehicle.model, lead.vehicle.version].filter(Boolean).join(" ") : null;
  // Upozornění dostávají oba majitelé: hlavní e-mail webu a odpovědná osoba.
  const adminTo = [...new Set([process.env.ADMIN_NOTIFY_EMAIL || settings.email, settings.responsibleEmail].filter((e): e is string => Boolean(e)))];
  const wanted = lead.type === "WANTED_CAR";
  const service = lead.service?.title ?? null;
  const booking = formatBooking(lead);

  const jobs: Promise<void>[] = [
    sendEmail({
      to: adminTo,
      replyTo: lead.email ?? undefined,
      subject: wanted
        ? `Hledané auto – ${lead.car}`
        : booking
          ? `Objednávka do servisu – ${booking}`
          : `Nová poptávka – ${vehicleName ?? LEAD_TYPE_LABELS[lead.type]}`,
      text: [
        wanted ? "Zákazník hledá auto, které není v nabídce – poptávka z webu FL Auto" : "Nová poptávka z webu FL Auto",
        wanted ? "Odpovězte mu prosím, zda je poptávka reálná, případně ji potvrďte." : null,
        "",
        vehicleName ? `Vůz: ${vehicleName} (${siteUrl(`/vozy/${lead.vehicle!.slug}`)})` : null,
        `Typ: ${LEAD_TYPE_LABELS[lead.type]}`,
        service ? `Služba: ${service}` : null,
        booking ? `Preferovaný termín: ${booking}` : null,
        lead.car ? `${wanted ? "Hledaný vůz" : "Vůz zákazníka"}: ${lead.car}` : null,
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
        subject: wanted
          ? "Přijali jsme vaši poptávku na auto – FL Auto"
          : booking
            ? "Přijali jsme vaši objednávku do servisu – FL Auto"
            : "Děkujeme za váš zájem – FL Auto",
        text: [
          "Dobrý den,",
          "",
          wanted
            ? `děkujeme za poptávku. Vůz „${lead.car}“ se pokusíme pro vás sehnat. Ozveme se vám s odpovědí, zda je poptávka reálná, nebo ji potvrdíme.`
            : booking
              ? "děkujeme za objednávku. Termín je zatím předběžný, ozveme se vám a potvrdíme ho."
              : "děkujeme za váš zájem. Autobazar vás bude kontaktovat.",
          vehicleName ? `\nVaše poptávka: ${vehicleName}` : null,
          service ? `\nSlužba: ${service}` : null,
          booking ? `Preferovaný termín: ${booking}` : null,
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
