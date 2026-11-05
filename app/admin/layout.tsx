import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

const links = [
  ["/admin", "Ringkasan"],
  ["/admin/books", "Buku"],
  ["/admin/categories", "Kategori"],
  ["/admin/stocks", "Stok"],
  ["/admin/loans", "Peminjaman"],
  ["/admin/transactions", "Transaksi"],
  ["/admin/users", "Pengguna"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-xl border border-line bg-white p-4">
        <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">Administrasi</p>
        <nav className="space-y-1">
          {links.map(([href, label]) => <Link key={href} href={href} className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-50 hover:text-brand">{label}</Link>)}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}