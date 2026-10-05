import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { fieldErrors } from "@/lib/validation/helpers";

export const jsonError = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ error, ...(fields && { fields }) }, { status });

export const validationError = (e: z.ZodError) => jsonError(422, "Zkontrolujte vyplněné údaje.", fieldErrors(e));

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/**
 * Ochrana admin API: platná session + u zápisů kontrola Origin (CSRF).
 * Vrací Response s chybou, nebo null, když je vše v pořádku.
 */
export async function guardAdmin(req: Request) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin) return jsonError(403, "Neplatný původ požadavku.");
  }
  const admin = await getSession();
  return admin ? null : jsonError(401, "Nejste přihlášeni.");
}

export function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
