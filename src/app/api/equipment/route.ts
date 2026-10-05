import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { EquipmentCategory } from "@/generated/prisma/enums";
import { guardAdmin, readJson, validationError } from "@/lib/api";
import { db } from "@/lib/db";
import { requiredText } from "@/lib/validation/helpers";

const schema = z.object({ name: requiredText(80), category: z.enum(EquipmentCategory) });

/** Přidání položky do katalogu výbavy (z formuláře vozu). */
export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const item = await db.equipment.upsert({
    where: { category_name: parsed.data },
    create: { ...parsed.data, sortOrder: 1000 },
    update: {},
  });
  return NextResponse.json(item, { status: 201 });
}
