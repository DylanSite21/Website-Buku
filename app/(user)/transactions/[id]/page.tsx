import Link from "next/link";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PaymentProofForm } from "@/app/components/payment-proof-form";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { transactionItems, transactions } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  pending: "Menunggu pembayaran",
  awaiting_verification: "Menunggu verifikasi admin",
  paid: "Pembayaran berhasil",
  rejected: "Pembayaran ditolak",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [transaction] = await db.select().from(transactions)
    .where(or(eq(transactions.id, id), eq(transactions.invoiceNumber, id))).limit(1);
  if (!transaction || (user.role !== "admin" && transaction.userId !== user.id)) notFound();
  const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <Link href="/transactions" className="text-sm font-semibold text-brand">← Kembali ke pesanan</Link>
      <section className="rounded-xl border border-line bg-white p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div><p className="text-sm text-muted">Invoice</p><h1 className="mt-1 text-2xl font-bold">{transaction.invoiceNumber}</h1></div>
          <span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-brand">{labels[transaction.status] ?? transaction.status}</span>
        </div>
        <p className="mt-2 text-sm text-muted">Dibuat {formatDate(transaction.createdAt)}</p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {items.map((item) => <li key={item.id} className="flex justify-between gap-5 py-4">
            <div><p className="font-semibold">{item.bookTitle}</p><p className="text-sm text-muted">{item.quantity} × {formatCurrency(item.price)}</p></div>
            <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
          </li>)}
        </ul>
        <p className="mt-5 flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(transaction.totalAmount)}</span></p>
        {transaction.rejectionReason && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">Alasan: {transaction.rejectionReason}</p>}
      </section>
      {transaction.paymentProof && (
        <a className="btn-outline" href={`/api/payment-proofs/${encodeURIComponent(transaction.paymentProof)}`} target="_blank" rel="noreferrer">Lihat bukti pembayaran</a>
      )}
      {user.role === "user" && ["pending", "rejected"].includes(transaction.status) && (
        <PaymentProofForm transactionId={transaction.id} />
      )}
    </div>
  );
}
