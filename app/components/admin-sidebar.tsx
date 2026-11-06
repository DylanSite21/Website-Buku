"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["/admin", "Ringkasan"],
  ["/admin/books", "Buku"],
  ["/admin/categories", "Kategori"],
  ["/admin/stocks", "Stok"],
  ["/admin/loans", "Peminjaman"],
  ["/admin/transactions", "Transaksi"],
  ["/admin/messages", "Pesan pengguna"],
  ["/admin/users", "Pengguna"],
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-left font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-expanded={isOpen}
          aria-controls="admin-mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="flex items-center gap-3">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
            <span>Administrasi</span>
          </span>
          <span className="text-sm text-muted">{isOpen ? "Tutup" : "Menu"}</span>
        </button>
        {isOpen && (
          <nav id="admin-mobile-navigation" className="mt-2 rounded-xl border border-line bg-white p-2 shadow-sm">
            {links.map(([href, label]) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={`block rounded-md px-3 py-3 text-sm font-medium ${active ? "bg-emerald-50 text-brand" : "hover:bg-gray-50"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
      <aside className="hidden h-fit rounded-xl border border-line bg-white p-4 lg:block">
        <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">Administrasi</p>
        <nav className="space-y-1">
          {links.map(([href, label]) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-emerald-50 text-brand" : "hover:bg-emerald-50 hover:text-brand"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
