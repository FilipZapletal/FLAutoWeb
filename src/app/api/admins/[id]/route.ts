import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError, parseId } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

/** Odebrání admina. Sebe ani posledního admina smazat nejde. Smazaný admin je hned odhlášen. */
export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/admins/[id]">) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const session = await getSession();
  if (!session) return jsonError(401, "Nejste přihlášeni.");

  const id = parseId((await ctx.params).id);
  if (!id) return jsonError(404, "Admin nenalezen.");
  if (id === session.id) return jsonError(400, "Sami sebe odebrat nemůžete.");
  if ((await db.admin.count()) <= 1) return jsonError(400, "Poslední admin nejde odebrat.");

  const { count } = await db.admin.deleteMany({ where: { id } });
  return count ? NextResponse.json({ ok: true }) : jsonError(404, "Admin nenalezen.");
}
