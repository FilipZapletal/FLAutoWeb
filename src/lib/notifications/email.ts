import "server-only";
import { Resend } from "resend";

export type EmailMessage = { to: string | string[]; subject: string; text: string; replyTo?: string };

let resend: Resend | null | undefined;

/** Odešle e-mail přes Resend. Bez RESEND_API_KEY ho jen vypíše do konzole (vývoj). */
export async function sendEmail(msg: EmailMessage) {
  resend ??= process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (!resend) {
    console.info(`[e-mail – neodesláno, chybí RESEND_API_KEY]\nKomu: ${[msg.to].flat().join(", ")}\nPředmět: ${msg.subject}\n\n${msg.text}\n`);
    return;
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "FL Auto <onboarding@resend.dev>",
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    replyTo: msg.replyTo,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
