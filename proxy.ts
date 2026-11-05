import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Catatan: Sesuaikan pemanggilan session Auth.js Anda di sini
// Contoh implementasi logika proteksi rute enterprise:

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/cart" ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/loans") ||
    pathname.startsWith("/api/payment-proofs");
  if (protectedPath && !request.cookies.has("book-store-session")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/cart",
    "/transactions/:path*",
    "/loans/:path*",
    "/api/payment-proofs/:path*",
  ],
};
