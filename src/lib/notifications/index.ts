import "server-only";
import type { Lead } from "@/generated/prisma/client";
import { formatBooking } from "@/lib/booking";
import { formatPrice } from "@/lib/format";
import { LEAD_TYPE_LABELS } from "@/lib/labels";
import { orderTotal, parseOrderItems } from "@/lib/order-items";
import { phonesLine } from "@/lib/contacts";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import type { SiteSettings } from "@/lib/validation/settings";
import { sendEmail } from "./email";
import { sendPush } from "./push";

type LeadWithVehicle = Lead & {
  vehicle: { brand: string; model: string; version: string | null; slug: string } | null;
  service: { title: string } | null;
};

/** Upozornění dostávají oba majitelé: hlavní e-mail webu a odpovědná osoba. */
export function adminRecipients(settings: SiteSettings) {
  return [...new Set([process.env.ADMIN_NOTIFY_EMAIL || settings.email, settings.responsibleEmail].filter((e): e is string => Boolean(e)))];
}

/** Upozornění majitelům na novou recenzi od návštěvníka (čeká na schválení). */
export async function notifyNewReview(review: { id: number; author: string; rating: number; text: string }) {
  try {
    const settings = await getSettings();
    await sendEmail({
      to: adminRecipients(settings),
      subject: `Nová recenze ke schválení – ${review.author} (${"★".repeat(review.rating)})`,
      text: [
        "Návštěvník napsal na webu FL Auto recenzi. Na webu se zobrazí, až ji schválíte.",
        "",
        `Jméno: ${review.author}`,
        `Hodnocení: ${review.rating} z 5`,
        "",
        review.text,
        "",
        `Schválit nebo smazat: ${siteUrl("/admin/recenze")}`,
      ].join("\n"),
    });
  } catch (e) {
    console.error("Upozornění na novou recenzi selhalo:", e);
  }
}

/**
 * Notifikace po nové poptávce. Zatím jen e-mail; další kanály (SMS, WhatsApp)
 * se přidají sem jako další odesílatelé. Chyba odeslání nikdy neshodí uložení leadu.
 */
export async function notifyNewLead(lead: LeadWithVehicle) {
  const settings = await getSettings();
  const vehicleName = lead.vehicle ? [lead.vehicle.brand, lead.vehicle.model, lead.vehicle.version].filter(Boolean).join(" ") : null;
  const adminTo = adminRecipients(settings);
  const wanted = lead.type === "WANTED_CAR";
  const service = lead.service?.title ?? null;
  const booking = formatBooking(lead);
  const items = parseOrderItems(lead.items);
  const total = orderTotal(items);
  const ordered = Boolean(booking) || items.length > 0;
  const itemLines = items.length
    ? [
        "Objednané položky:",
        ...items.map((i) => `• ${i.label} – ${i.from ? "od " : ""}${formatPrice(i.price)}`),
        `Celkem ${total.fromAny ? "od " : ""}${formatPrice(total.sum)} (orientačně podle ceníku)`,
      ]
    : null;

  const jobs: Promise<unknown>[] = [
    sendPush({
      title: wanted ? "Hledané auto" : ordered ? `Nová objednávka${service ? ` – ${service}` : ""}` : "Nová poptávka",
      body: [lead.name, wanted ? lead.car : (vehicleName ?? service ?? LEAD_TYPE_LABELS[lead.type]), booking].filter(Boolean).join(" · "),
      url: `/admin/poptavky/${lead.id}`,
      tag: `lead-${lead.id}`,
    }),
    sendEmail({
      to: adminTo,
      replyTo: lead.email ?? undefined,
      subject: wanted
        ? `Hledané auto – ${lead.car}`
        : items.length > 0
          ? `Objednávka – ${service ?? "služba"}${booking ? ` – ${booking}` : ""}`
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
        itemLines ? `\n${itemLines.join("\n")}\n` : null,
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
          : ordered
            ? "Přijali jsme vaši objednávku – FL Auto"
            : "Děkujeme za váš zájem – FL Auto",
        text: [
          "Dobrý den,",
          "",
          wanted
            ? `děkujeme za poptávku. Vůz „${lead.car}“ se pokusíme pro vás sehnat. Ozveme se vám s odpovědí, zda je poptávka reálná, nebo ji potvrdíme.`
            : ordered
              ? "děkujeme za objednávku. Termín je zatím předběžný, ozveme se vám a potvrdíme ho."
              : "děkujeme za váš zájem. Autobazar vás bude kontaktovat.",
          vehicleName ? `\nVaše poptávka: ${vehicleName}` : null,
          service ? `\nSlužba: ${service}` : null,
          itemLines ? `\n${itemLines.join("\n")}` : null,
          booking ? `Preferovaný termín: ${booking}` : null,
          "",
          "FL Auto",
          settings.address,
          `Tel.: ${phonesLine(settings)}`,
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
