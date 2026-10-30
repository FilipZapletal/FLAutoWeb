import "server-only";
import type { Lead } from "@/generated/prisma/client";
import { formatBooking, formatConfirmedBooking } from "@/lib/booking";
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
  service: { title: string; contactEmail?: string | null; contactPhone?: string | null; contactName?: string | null } | null;
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
  // U služby s vlastním kontaktem (Crystal Finish) dostane e-mail o objednávce i tento kontakt.
  const adminTo = [...new Set([...adminRecipients(settings), ...(lead.service?.contactEmail ? [lead.service.contactEmail] : [])])];
  const wanted = lead.type === "WANTED_CAR";
  const service = lead.service?.title ?? null;
  const booking = formatBooking(lead);
  const items = parseOrderItems(lead.items);
  const total = orderTotal(items);
  const ordered = lead.type === "SERVICE" && (Boolean(booking) || items.length > 0);
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
          : booking && lead.type === "SERVICE"
            ? `Objednávka do servisu – ${booking}`
            : `Nová poptávka – ${vehicleName ?? LEAD_TYPE_LABELS[lead.type]}${booking ? ` – ${booking}` : ""}`,
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
          booking ? `Preferovaný termín: ${booking}${ordered ? "" : " (zatím předběžný, ozveme se vám a potvrdíme ho)"}` : null,
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

/**
 * E-mail zákazníkovi, když majitel v administraci potvrdí, změní nebo zruší termín.
 * Potvrzený termín je závazný, majitel už zákazníkovi volat nemusí. Bez e-mailu zákazníka se nic neposílá.
 */
export async function notifyBookingChange(
  lead: LeadWithVehicle,
  change: "confirmed" | "changed" | "cancelled",
  previous: { confirmedDate: Date | null; confirmedSlot: Lead["confirmedSlot"]; confirmedTime: string | null },
) {
  if (!lead.email) return;
  try {
    const settings = await getSettings();
    const vehicleName = lead.vehicle ? [lead.vehicle.brand, lead.vehicle.model, lead.vehicle.version].filter(Boolean).join(" ") : null;
    const what = lead.service?.title ?? (vehicleName ? `prohlídka vozu ${vehicleName}` : null);
    const booking = formatConfirmedBooking(lead);
    const before = formatConfirmedBooking({ preferredDate: null, preferredSlot: null, ...previous });
    // Crystal Finish má vlastní kontakt, ostatní služby a vozy kontakty majitelů.
    const phone = lead.service?.contactPhone ? `${lead.service.contactName ? `${lead.service.contactName} ` : ""}${lead.service.contactPhone}` : phonesLine(settings);
    const subject =
      change === "cancelled" ? "Termín byl zrušen – FL Auto" : change === "changed" ? `Změna termínu: ${booking} – FL Auto` : `Termín potvrzen: ${booking} – FL Auto`;
    const body =
      change === "cancelled"
        ? [`termín${before ? ` ${before}` : ""}${what ? ` (${what})` : ""} jsme zrušili.`, "Pokud si chcete domluvit jiný, zavolejte nám nebo se objednejte znovu na webu."]
        : change === "changed"
          ? [`váš termín${what ? ` (${what})` : ""} jsme změnili.`, "", `Nový termín: ${booking}`, before ? `Původní termín: ${before}` : null, "", "Pokud vám nový termín nevyhovuje, zavolejte nám."]
          : [`potvrzujeme váš termín${what ? ` (${what})` : ""}.`, "", `Termín: ${booking}`, "", "Těšíme se na vás. Pokud vám termín nevyhovuje, zavolejte nám."];
    await sendEmail({
      to: lead.email,
      replyTo: settings.email,
      subject,
      text: ["Dobrý den,", "", ...body, "", "FL Auto", settings.address, `Tel.: ${phone}`, settings.email].filter((l) => l !== null).join("\n"),
    });
  } catch (e) {
    console.error("E-mail o změně termínu selhal:", e);
  }
}
