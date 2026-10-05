import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, readJson, validationError } from "@/lib/api";
import { getSettings, saveSettings } from "@/lib/settings";
import { siteSettingsSchema } from "@/lib/validation/settings";

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  return NextResponse.json(await getSettings());
}

export async function PUT(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const parsed = siteSettingsSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  await saveSettings(parsed.data);
  return NextResponse.json(parsed.data);
}
