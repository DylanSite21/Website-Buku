import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUserId, SESSION_COOKIE_NAME } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPath =
    // pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    // pathname === "/cart" ||
    // pathname.startsWith("/transactions") ||
    // pathname.startsWith("/loans") ||
    pathname.startsWith("/api/payment-proofs");
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  // if (protectedPath && (!token || !(await getSessionUserId(token)))) {
  //   const loginUrl = new URL("/login", request.url);
  //   loginUrl.searchParams.set("callbackUrl", pathname);
  //   const response = NextResponse.redirect(loginUrl);
  //   if (token) response.cookies.delete(SESSION_COOKIE_NAME);
  //   return response;
  // }

   if (protectedPath && (!token || !(await getSessionUserId(token)))) {
    const unauthorizedUrl = new URL("/unauthorized", request.url);

    const response = NextResponse.redirect(unauthorizedUrl);

    if (token) response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/admin/:path*",
    "/api/admin/:path*",
    // "/cart",
    // "/transactions/:path*",
    // "/loans/:path*",
    "/api/payment-proofs/:path*",
  ],
};
