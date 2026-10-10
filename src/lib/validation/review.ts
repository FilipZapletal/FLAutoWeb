import { z } from "zod";
import { optionalText, requiredInt, requiredText } from "./helpers";

/** Checkbox z formuláře ("on") i JSON boolean. */
const checkbox = z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());

export const reviewSchema = z.object({
  author: requiredText(100),
  text: requiredText(1500),
  rating: requiredInt(1, 5),
  source: optionalText(50),
  showOnHome: checkbox,
  showOnService: checkbox,
  sortOrder: requiredInt(0, 9999),
  /** Schváleno = smí se zobrazit na webu. Když klíč chybí (API), bere se jako schváleno. */
  approved: z.preprocess((v) => (v === undefined ? true : v === true || v === "on" || v === "true"), z.boolean()),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

/** Rychlá akce v seznamu recenzí (schválit / stáhnout). */
export const reviewApproveSchema = z.object({ approved: z.boolean() }).strict();

/** Recenze od návštěvníka z webu. Čeká na schválení administrátorem. */
export const reviewSubmitSchema = z.object({
  author: z.string({ error: "Povinné pole" }).trim().min(2, { error: "Zadejte jméno" }).max(60, { error: "Maximálně 60 znaků" }),
  rating: requiredInt(1, 5),
  text: z
    .string({ error: "Napište text recenze" })
    .trim()
    .min(15, { error: "Napište alespoň 15 znaků" })
    .max(1000, { error: "Maximálně 1000 znaků" })
    // Ochrana před spamem: do recenze nepatří odkazy.
    .refine((t) => !/(https?:\/\/|www\.|\b[\w-]+\.(com|cz|sk|net|org|ru|info|biz)\b)/i.test(t), { error: "Do recenze prosím nevkládejte odkazy" }),
  /** Honeypot – skryté pole, které vyplní jen roboti. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
