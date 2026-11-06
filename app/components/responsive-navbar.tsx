"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/actions/auth";

type NavbarUser = {
  name: string;
  role: "user" | "admin";
} | null;

function NavigationLinks({ user }: { user: NavbarUser }) {
  return (
    <>
      <Link className="hover:text-brand" href="/books">Katalog</Link>
      <Link className="hover:text-brand" href="/about">Tentang Kami</Link>
      <Link className="hover:text-brand" href="/contact">Hubungi Admin</Link>
      {user?.role === "user" && (
        <>
          <Link className="hover:text-brand" href="/cart">Keranjang</Link>
          <Link className="hover:text-brand" href="/transactions">Pesanan</Link>
          <Link className="hover:text-brand" href="/loans">Peminjaman</Link>
        </>
      )}
      {user?.role === "admin" && (
        <Link className="hover:text-brand" href="/admin">Admin</Link>
      )}
      {user ? (
        <form action={logout}>
          <button className="btn-outline">{user.name} · Keluar</button>
        </form>
      ) : (
        <>
          <Link className="hover:text-brand" href="/login">Masuk</Link>
          <Link className="btn-primary" href="/register">Daftar</Link>
        </>
      )}
    </>
  );
}

export function ResponsiveNavbar({ user }: { user: NavbarUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-md border border-line bg-white lg:hidden"
        aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={isOpen}
        aria-controls="mobile-site-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      <div className="hidden items-center gap-5 text-sm font-medium lg:flex">
        <NavigationLinks user={user} />
      </div>
      {isOpen && (
        <div id="mobile-site-navigation" className="basis-full border-t border-line pt-3 lg:hidden">
          <nav className="flex flex-col items-stretch gap-1 text-sm font-medium">
            <NavigationLinks user={user} />
          </nav>
        </div>
      )}
    </>
  );
}
