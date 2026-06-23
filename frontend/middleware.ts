import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "te"];
const DEFAULT_LOCALE = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip: Next.js internals, static files, API routes, uploads
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".") // static files like favicon.ico, robots.txt
  ) {
    return NextResponse.next();
  }

  // Skip: path already has a locale prefix
  const firstSegment = pathname.split("/")[1];
  if (LOCALES.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Read locale from cookie (set by language switcher)
  const cookieLocale = request.cookies.get("locale")?.value;
  const locale = cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  // Redirect /login → /en/login, /products → /en/products, etc.
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
