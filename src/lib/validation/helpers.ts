import { z } from "zod";
import { capitalizeFirst, capitalizeWords } from "@/lib/capitalize";

// Obecné chybové hlášky česky (konkrétní hlášky jsou u jednotlivých polí).
z.config(z.locales.cs());

const empty = (v: unknown) => v === "" || v === null || v === undefined;

/** Volitelné celé číslo z formuláře ("" → null). */
export const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (empty(v) ? null : typeof v === "string" ? Number(v.replace(/\s/g, "")) : v),
    z
      .number({ error: "Zadejte číslo" })
      .int({ error: "Zadejte celé číslo" })
      .min(min, { error: `Minimum je ${min}` })
      .max(max, { error: `Maximum je ${max}` })
      .nullable(),
  );

export const requiredInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (empty(v) ? undefined : typeof v === "string" ? Number(v.replace(/\s/g, "")) : v),
    z
      .number({ error: "Povinné pole" })
      .int({ error: "Zadejte celé číslo" })
      .min(min, { error: `Minimum je ${min}` })
      .max(max, { error: `Maximum je ${max}` }),
  );

/** Volitelný text: ořízne mezery, prázdný → null. */
export const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || null : v ?? null),
    z.string().max(max, { error: `Maximálně ${max} znaků` }).nullable(),
  );

export const requiredText = (max: number) =>
  z
    .string({ error: "Povinné pole" })
    .trim()
    .min(1, { error: "Povinné pole" })
    .max(max, { error: `Maximálně ${max} znaků` });

/** Měsíc "RRRR-MM" (input type=month) → Date (UTC, 1. den měsíce). */
export const optionalMonth = z.preprocess(
  (v) => (empty(v) ? null : v),
  z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, { error: "Zadejte měsíc a rok" })
    .transform((s) => new Date(`${s}-01T00:00:00.000Z`))
    .nullable(),
);

export const optionalEnum = <T extends Record<string, string>>(values: T) =>
  z.preprocess((v) => (empty(v) ? null : v), z.enum(values).nullable());

/** Chyby zod → { pole: "zpráva" } pro zobrazení ve formuláři. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Jméno a příjmení zákazníka: aspoň dvě slova, první písmena velká (i když je zákazník napsal malými). */
export const personName = (max: number) =>
  z
    .string({ error: "Povinné pole" })
    .trim()
    .min(1, { error: "Povinné pole" })
    .max(max, { error: `Maximálně ${max} znaků` })
    .refine((v) => /\S\s+\S/.test(v), { error: "Zadejte jméno i příjmení" })
    .transform((v) => capitalizeWords(v.replace(/\s+/g, " ")));

/** Povinný text s velkými písmeny na začátku slov (značka a model vozu). */
export const requiredTitleCase = (max: number) => requiredText(max).transform(capitalizeWords);

/** Povinný text s velkým prvním písmenem (popis hledaného vozu). */
export const requiredSentence = (max: number) => requiredText(max).transform(capitalizeFirst);
