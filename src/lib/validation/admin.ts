import { z } from "zod";
import "./helpers";

/** Nový admin: e-mail, dočasné heslo a pro jistotu heslo přihlášeného admina. */
export const adminCreateSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email({ error: "Zadejte platný e-mail" }).max(160)),
    password: z
      .string()
      .min(10, { error: "Heslo musí mít alespoň 10 znaků" })
      .max(200, { error: "Heslo je příliš dlouhé" }),
    confirmPassword: z.string().max(200),
    currentPassword: z.string().min(1, { error: "Zadejte své heslo" }).max(200),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], error: "Hesla se neshodují" });
