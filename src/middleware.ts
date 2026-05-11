import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Canonical merchant storefront URLs are `/:slug`.
 * Permanent redirect from `/merchants/:slug` for bookmarks and legacy links.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/merchants/")) {
    return NextResponse.next();
  }

  const rest = pathname.slice("/merchants/".length);
  const segments = rest.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return NextResponse.next();
  }

  const slug = segments[0];
  if (!slug) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${slug}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/merchants/:path*"],
};
