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
});

export type ReviewInput = z.infer<typeof reviewSchema>;
