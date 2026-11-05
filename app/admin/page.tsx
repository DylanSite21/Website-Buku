import Link from "next/link";
import { count, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { books, loans, stocks, transactions, users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    [bookCount], [userCount], [pendingLoans], [pendingPayments], [lowStock],
  ] = await Promise.all([
    db.select({ value: count() }).from(books).where(eq(books.status, "published")),
    db.select({ value: count() }).from(users).where(eq(users.role, "user")),
    db.select({ value: count() }).from(loans).where(eq(loans.status, "pending")),
    db.select({ value: count() }).from(transactions).where(eq(transactions.status, "awaiting_verification")),
    db.select({ value: count() }).from(stocks).where(lt(stocks.availableQuantity, 3)),
  ]);
  const cards = [
    ["Buku terbit", bookCount.value, "/admin/books"],
    ["Pengguna", userCount.value, "/admin/users"],
    ["Pengajuan pinjam", pendingLoans.value, "/admin/loans"],
    ["Pembayaran menunggu", pendingPayments.value, "/admin/transactions"],
    ["Stok menipis", lowStock.value, "/admin/stocks"],
  ] as const;
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Panel admin</p><h1 className="mt-2 text-4xl font-bold">Ringkasan operasional</h1><p className="mt-2 text-muted">Pantau katalog, stok, pembayaran, dan sirkulasi buku.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, href]) => <Link key={label} href={href} className="rounded-xl border border-line bg-white p-5 hover:border-brand">
          <p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-3 text-sm font-semibold text-brand">Kelola →</p>
        </Link>)}
      </div>
    </div>
  );
}
