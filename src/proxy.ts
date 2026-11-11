import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, localePath, negotiateLocale, splitLocale } from "@/i18n/config";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

const PROTECTED_PREFIXES = ["/dashboard", "/transactions", "/categories", "/budgets", "/settings"];
// Pages for signed-out visitors; signed-in users go straight to their dashboard
const SIGNED_OUT_PAGES = ["/", "/login", "/register"];
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { locale, path } = splitLocale(pathname);

  // 1. Every page lives under /en or /km. Add the visitor's language if it's missing:
  //    their last choice (cookie), else their browser language, else English.
  if (!locale) {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const preferred = isLocale(saved)
      ? saved
      : negotiateLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = localePath(preferred, withoutForeignLocale(pathname));
    return NextResponse.redirect(url);
  }

  // 2. Optimistic auth check: only verifies the cookie signature, no database call,
  //    so it's fast enough for every navigation. Pages and Server Actions still
  //    verify the session through the Data Access Layer (src/lib/auth.ts).
  const userId = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (isProtected && !userId) {
    const loginUrl = new URL(localePath(locale, "/login"), request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (SIGNED_OUT_PAGES.includes(path) && userId) {
    return NextResponse.redirect(new URL(localePath(locale, "/dashboard"), request.url));
  }

  // 3. Remember the language, so Server Actions (which can't see the URL) and the
  //    next visit to "/" use it too.
  const response = NextResponse.next();
  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  }
  return response;
}

// A language we don't offer, like /fr or /zh-CN/budgets. No app path is this short.
const LANGUAGE_TAG = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

/** "/fr/budgets" -> "/budgets", so it lands on a real page instead of /km/fr/budgets (404). */
function withoutForeignLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  return LANGUAGE_TAG.test(first) ? `/${rest.join("/")}` : pathname;
}

export const config = {
  // Skip API routes, the logout handler, Next.js internals and static files
  matcher: ["/((?!api|logout|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
