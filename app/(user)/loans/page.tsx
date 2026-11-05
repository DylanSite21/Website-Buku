import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { cancelLoan } from "@/actions/loans";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { books, loanItems, loans } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  pending: "Menunggu persetujuan",
  approved: "Siap diambil",
  rejected: "Ditolak",
  borrowed: "Sedang dipinjam",
  returned: "Dikembalikan",
  overdue: "Terlambat",
  cancelled: "Dibatalkan",
};

export default async function LoansPage() {
  const user = await requireUser();
  const rows = await db.select({ loan: loans, item: loanItems, book: books })
    .from(loans)
    .innerJoin(loanItems, eq(loanItems.loanId, loans.id))
    .innerJoin(books, eq(books.id, loanItems.bookId))
    .where(eq(loans.userId, user.id))
    .orderBy(desc(loans.createdAt));
  const today = new Date();
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Perpustakaan</p><h1 className="mt-2 text-4xl font-bold">Peminjaman saya</h1></div>
      {rows.length ? (
        <div className="space-y-3">
          {rows.map(({ loan, item, book }) => {
            const status = loan.status === "borrowed" && loan.dueDate && loan.dueDate < today ? "overdue" : loan.status;
            return (
              <article key={loan.id} className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-line bg-white p-5">
                <div>
                  <p className="text-xs text-muted">{loan.loanNumber}</p>
                  <Link href={`/books/${book.slug}`} className="mt-1 block font-bold hover:text-brand">{book.title}</Link>
                  <p className="mt-1 text-sm text-muted">{item.quantity} eksemplar · Tenggat {formatDate(loan.dueDate)}</p>
                  {loan.rejectionReason && <p className="mt-2 text-sm text-red-700">{loan.rejectionReason}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-brand">{labels[status] ?? status}</span>
                  {loan.status === "pending" && <form action={cancelLoan.bind(null, loan.id)}><button className="btn-outline">Batalkan</button></form>}
                </div>
              </article>
            );
          })}
        </div>
      ) : <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">Belum ada pengajuan peminjaman. <Link className="font-semibold text-brand" href="/books">Cari buku</Link></p>}
    </div>
  );
}
