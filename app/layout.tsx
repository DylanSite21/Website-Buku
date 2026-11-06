import type { Metadata } from "next";
import { Navbar } from "./components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BukuRuang | Toko Buku & Perpustakaan", template: "%s | BukuRuang" },
  description: "Jelajahi, beli, dan pinjam buku dalam satu ruang.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-73px)] max-w-7xl px-4 py-6 sm:px-5 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
