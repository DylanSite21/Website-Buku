import { desc, eq } from "drizzle-orm";
import { ActionFeedback } from "@/app/components/action-feedback";
import { verifyTransaction } from "@/actions/transactions";
import { db } from "@/lib/db";
import { transactions, users } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  const rows = await db.select({ transaction: transactions, user: users })
    .from(transactions).innerJoin(users, eq(users.id, transactions.userId))
    .orderBy(desc(transactions.createdAt));
  const pending = rows.filter(({ transaction }) => transaction.status === "awaiting_verification");
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Keuangan</p><h1 className="mt-2 text-4xl font-bold">Transaksi</h1></div>
      {rows.map(({ transaction, user }) => <article key={transaction.id} className="space-y-4 rounded-xl border border-line bg-white p-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div><p className="text-xs text-muted">{transaction.invoiceNumber} · {formatDate(transaction.createdAt)}</p><h2 className="mt-1 text-lg font-bold">{user.name}</h2><p className="text-sm text-muted">{user.email}</p></div>
          <div className="text-right"><p className="font-bold">{formatCurrency(transaction.totalAmount)}</p><p className="mt-1 text-sm text-muted">{transaction.status}</p></div>
        </div>
        {transaction.paymentProof && <a className="font-semibold text-brand underline" href={`/api/payment-proofs/${encodeURIComponent(transaction.paymentProof)}`} target="_blank" rel="noreferrer">Buka bukti pembayaran</a>}
        {transaction.rejectionReason && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{transaction.rejectionReason}</p>}
        {transaction.status === "awaiting_verification" && <div className="flex flex-wrap gap-4">
          <ActionFeedback action={verifyTransaction.bind(null, transaction.id)} submitLabel="Setujui pembayaran">
            <input type="hidden" name="decision" value="paid" />
            <p className="text-sm text-muted">Stok dikurangi secara atomik jika pembayaran disetujui.</p>
          </ActionFeedback>
          <ActionFeedback action={verifyTransaction.bind(null, transaction.id)} submitLabel="Tolak pembayaran">
            <input type="hidden" name="decision" value="rejected" />
            <label className="block"><span className="label">Alasan penolakan</span><input className="input" name="reason" maxLength={1000} required /></label>
          </ActionFeedback>
        </div>}
      </article>)}
      {!rows.length && <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">Belum ada transaksi.</p>}
      <p className="text-xs text-muted">{pending.length} pembayaran menunggu verifikasi.</p>
    </div>
  );
}
