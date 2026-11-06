import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { transactions } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  pending: "Menunggu pembayaran",
  awaiting_verification: "Menunggu verifikasi",
  paid: "Lunas",
  rejected: "Pembayaran ditolak",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

export default async function TransactionsPage() {
  const user = await requireUser();
  const rows = await db.select().from(transactions).where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.createdAt));
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Akun Anda</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Pesanan</h1>
        <p className="mt-3 text-muted">Lihat status dan detail pembelian buku Anda.</p>
      </div>
      {rows.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Invoice</p>
                  <p className="mt-1 break-all font-bold">{row.invoiceNumber}</p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {labels[row.status] ?? row.status}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
                <div>
                  <p className="text-xs text-muted">Tanggal pesanan</p>
                  <p className="mt-1 text-sm font-medium">{formatDate(row.createdAt)}</p>
                  <p className="mt-3 text-xs text-muted">Total</p>
                  <p className="mt-1 font-bold">{formatCurrency(row.totalAmount)}</p>
                </div>
                <Link className="btn-outline" href={`/transactions/${row.invoiceNumber}`}>Lihat detail</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-14 text-center shadow-sm">
          <p className="font-semibold">Belum ada pesanan.</p>
          <Link className="btn-primary mt-5" href="/books">Jelajahi katalog</Link>
        </div>
      )}
    </div>
  );
}
