import { desc, eq } from "drizzle-orm";
import { ActionFeedback } from "@/app/components/action-feedback";
import { approveLoan, issueLoan, rejectLoan, returnLoan } from "@/actions/loans";
import { db } from "@/lib/db";
import { books, loanItems, loans, users } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLoansPage() {
  const rows = await db.select({ loan: loans, item: loanItems, book: books, user: users })
    .from(loans).innerJoin(loanItems, eq(loanItems.loanId, loans.id))
    .innerJoin(books, eq(books.id, loanItems.bookId)).innerJoin(users, eq(users.id, loans.userId))
    .orderBy(desc(loans.createdAt));
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Sirkulasi</p><h1 className="mt-2 text-4xl font-bold">Peminjaman</h1></div>
      {rows.map(({ loan, item, book, user }) => <article key={loan.id} className="space-y-4 rounded-xl border border-line bg-white p-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div><p className="text-xs text-muted">{loan.loanNumber} · {formatDate(loan.createdAt)}</p><h2 className="mt-1 text-lg font-bold">{book.title}</h2><p className="text-sm text-muted">{user.name} ({user.email}) · {item.quantity} eksemplar</p></div>
          <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">{loan.status}</span>
        </div>
        {loan.dueDate && <p className="text-sm text-muted">Tenggat: {formatDate(loan.dueDate)}</p>}
        {loan.rejectionReason && <p className="text-sm text-red-700">{loan.rejectionReason}</p>}
        <div className="flex flex-wrap gap-3">
          {loan.status === "pending" && <>
            <ActionFeedback action={approveLoan.bind(null, loan.id)} submitLabel="Setujui pengajuan"><p className="text-sm text-muted">Stok akan direservasi saat disetujui.</p></ActionFeedback>
            <ActionFeedback action={rejectLoan.bind(null, loan.id)} submitLabel="Tolak pengajuan"><label className="block"><span className="label">Alasan penolakan</span><input className="input" name="reason" maxLength={1000} required /></label></ActionFeedback>
          </>}
          {loan.status === "approved" && <ActionFeedback action={issueLoan.bind(null, loan.id)} submitLabel="Catat pengambilan"><p className="text-sm text-muted">Konfirmasi buku telah diserahkan.</p></ActionFeedback>}
          {loan.status === "borrowed" && <ActionFeedback action={returnLoan.bind(null, loan.id)} submitLabel="Catat pengembalian"><p className="text-sm text-muted">Konfirmasi buku telah diterima kembali.</p></ActionFeedback>}
        </div>
      </article>)}
      {!rows.length && <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">Belum ada pengajuan peminjaman.</p>}
    </div>
  );
}
