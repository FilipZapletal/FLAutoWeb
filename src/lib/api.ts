import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { fieldErrors } from "@/lib/validation/helpers";

export const jsonError = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ error, ...(fields && { fields }) }, { status });

export const validationError = (e: z.ZodError) => jsonError(422, "Zkontrolujte vyplněné údaje.", fieldErrors(e));

/** Max. velikost JSON těla (formuláře a admin úpravy jsou malé; fotky jdou přes multipart). */
const MAX_JSON_BYTES = 256 * 1024;

/** Načte JSON tělo, nebo undefined (neplatné nebo příliš velké). */
export async function readJson(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_JSON_BYTES) return undefined;
  try {
    const text = await req.text();
    return text.length > MAX_JSON_BYTES ? undefined : JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Požadavek z vlastního webu (ochrana proti CSRF). Kontroluje Origin, případně Sec-Fetch-Site.
 * Když prohlížeč neposlal ani jedno (velmi staré prohlížeče), požadavek projde – chrání ještě SameSite cookie.
 */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) return origin === new URL(req.url).origin;
  const site = req.headers.get("sec-fetch-site");
  return !site || site === "same-origin" || site === "none";
}

/**
 * Ochrana admin API: platná session + u zápisů kontrola Origin (CSRF).
 * Vrací Response s chybou, nebo null, když je vše v pořádku.
 */
export async function guardAdmin(req: Request) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (!sameOrigin(req)) return jsonError(403, "Neplatný původ požadavku.");
  }
  const admin = await getSession();
  return admin ? null : jsonError(401, "Nejste přihlášeni.");
}

export function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
