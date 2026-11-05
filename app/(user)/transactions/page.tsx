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
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Akun Anda</p><h1 className="mt-2 text-4xl font-bold">Pesanan</h1></div>
      {rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-muted"><tr><th className="p-4">Invoice</th><th className="p-4">Tanggal</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-t border-line">
              <td className="p-4 font-semibold">{row.invoiceNumber}</td><td className="p-4">{formatDate(row.createdAt)}</td>
              <td className="p-4">{formatCurrency(row.totalAmount)}</td><td className="p-4">{labels[row.status] ?? row.status}</td>
              <td className="p-4"><Link className="font-semibold text-brand" href={`/transactions/${row.invoiceNumber}`}>Detail</Link></td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">Belum ada pesanan.</p>}
    </div>
  );
}
