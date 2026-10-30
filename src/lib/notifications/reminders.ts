import "server-only";
import { effectiveBooking, pragueToday } from "@/lib/booking";
import { getBookingsOn } from "@/lib/leads/service";
import { LEAD_TYPE_LABELS, TIME_SLOT_LABELS } from "@/lib/labels";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { sendEmail } from "./email";
import { adminRecipients } from "./index";
import { sendPush } from "./push";

/** „1 objednávka“, „2 objednávky“, „5 objednávek“ (první pád) a „1 objednávku“ (čtvrtý pád). */
const plural = (n: number, accusative = false) => (n === 1 ? (accusative ? "objednávku" : "objednávka") : n >= 2 && n <= 4 ? "objednávky" : "objednávek");

/**
 * Ranní připomenutí: objednávky (servis, prohlídky vozů…) s dnešním termínem (domluveným, jinak přáním zákazníka)
 * přijdou oběma majitelům e-mailem a jako upozornění do zařízení. Když dnes nic není, neposílá se nic.
 * Vrací počet dnešních objednávek.
 */
export async function sendBookingReminders(now = new Date()) {
  const bookings = await getBookingsOn(pragueToday(now));
  if (!bookings.length) return 0;
  const settings = await getSettings();
  const items = bookings.map((b) => {
    const booking = effectiveBooking(b);
    const { confirmed } = booking;
    return {
      id: b.id,
      when: booking.time ? `v ${booking.time}` : booking.slot ? TIME_SLOT_LABELS[booking.slot].toLowerCase() : "bez upřesnění",
      confirmed,
      service: b.type === "SERVICE" ? (b.service?.title ?? "Servis") : `${LEAD_TYPE_LABELS[b.type]}${b.vehicle ? `: ${b.vehicle.brand} ${b.vehicle.model}` : ""}`,
      name: b.name,
      phone: b.phone,
      car: b.car,
    };
  });
  const title = `Dnes na programu: ${items.length} ${plural(items.length)}`;

  const text = [
    `Dnes máte na programu ${items.length} ${plural(items.length, true)}:`,
    "",
    ...items.map((i) =>
      [`• ${i.when}${i.confirmed ? "" : " (přání zákazníka, nepotvrzeno)"} – ${i.service}`, `  ${i.name}, ${i.phone}${i.car ? `, ${i.car}` : ""}`, `  ${siteUrl(`/admin/poptavky/${i.id}`)}`].join("\n"),
    ),
    "",
    `Přehled: ${siteUrl("/admin")}`,
  ].join("\n");

  const results = await Promise.allSettled([
    sendEmail({ to: adminRecipients(settings), subject: title, text }),
    sendPush({ title, body: items.map((i) => `${i.when}: ${i.name} – ${i.service}`).join(" · "), url: "/admin", tag: "booking-reminder" }),
  ]);
  for (const r of results) if (r.status === "rejected") console.error("Připomenutí termínů selhalo:", r.reason);
  return items.length;
}
