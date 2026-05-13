import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy
 * Replaces the deprecated middleware.ts convention.
 */
export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Protect Admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect Delivery routes
  if (request.nextUrl.pathname.startsWith("/delivery")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect specific Customer routes
  if (request.nextUrl.pathname.startsWith("/checkout") || request.nextUrl.pathname.startsWith("/account")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/delivery/:path*",
    "/checkout/:path*",
    "/account/:path*",
  ],
};
