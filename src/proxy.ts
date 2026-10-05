import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";

/**
 * Rychlá kontrola přihlášení pro stránky administrace. Plné ověření (vč. existence
 * účtu v DB) dělá layout administrace a každý admin endpoint v API.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/prihlaseni") {
    return session ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }
  if (!session) return NextResponse.redirect(new URL("/admin/prihlaseni", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
