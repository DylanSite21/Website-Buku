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
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Perpustakaan</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Peminjaman saya</h1>
        <p className="mt-3 text-muted">Pantau status pengajuan dan tenggat pengembalian buku.</p>
      </div>
      {rows.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map(({ loan, item, book }) => {
            const status = loan.status === "borrowed" && loan.dueDate && loan.dueDate < today ? "overdue" : loan.status;
            return (
              <li key={loan.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="break-all text-xs text-muted">{loan.loanNumber}</p>
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{labels[status] ?? status}</span>
                  </div>
                  <Link href={`/books/${book.slug}`} className="mt-3 block text-lg font-bold hover:text-brand">{book.title}</Link>
                  <p className="mt-2 text-sm text-muted">{item.quantity} eksemplar · Tenggat {formatDate(loan.dueDate)}</p>
                  {loan.rejectionReason && <p className="mt-2 text-sm text-red-700">{loan.rejectionReason}</p>}
                </div>
                {loan.status === "pending" && <form action={cancelLoan.bind(null, loan.id)}><button className="btn-outline">Batalkan pengajuan</button></form>}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-14 text-center shadow-sm">
          <p className="font-semibold">Belum ada pengajuan peminjaman.</p>
          <Link className="btn-primary mt-5" href="/books">Cari buku</Link>
        </div>
      )}
    </div>
  );
}
