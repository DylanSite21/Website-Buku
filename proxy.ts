import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Catatan: Sesuaikan pemanggilan session Auth.js Anda di sini
// Contoh implementasi logika proteksi rute enterprise:

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Contoh proteksi path admin
  if (pathname.startsWith("/admin")) {
    const sessionCookie =
      request.cookies.get("authjs.session-token") ||
      request.cookies.get("__Secure-authjs.session-token");

    if (!sessionCookie) {
      return NextResponse.redirect(
        new URL(
          "/login?callbackUrl=" + encodeURIComponent(pathname),
          request.url,
        ),
      );
    }
    // Validasi role admin dapat dilakukan via token dekripsi atau query database cepat di sini
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/cart",
    "/transactions",
    "/loans",
  ],
};
