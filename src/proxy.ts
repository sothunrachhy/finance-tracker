import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

const PROTECTED_PREFIXES = ["/dashboard", "/transactions", "/categories", "/budgets", "/settings"];
const AUTH_PAGES = ["/login", "/register"];

// Optimistic check: only verifies the cookie signature, no database call, so it's
// fast enough to run on every navigation. Pages and Server Actions still verify
// the session themselves through the Data Access Layer (src/lib/auth.ts).
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userId = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PAGES.includes(pathname) && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next.js internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
