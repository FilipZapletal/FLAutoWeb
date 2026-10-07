import { z } from "zod";
import "./helpers";

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Zadejte současné heslo" }).max(200),
    newPassword: z
      .string()
      .min(10, { error: "Nové heslo musí mít alespoň 10 znaků" })
      .max(200, { error: "Nové heslo je příliš dlouhé" }),
    confirmPassword: z.string().max(200),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], error: "Hesla se neshodují" })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ["newPassword"], error: "Nové heslo musí být jiné než současné" });
