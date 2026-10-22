import { desc, eq } from "drizzle-orm";
import { returnBook } from "@/actions/loans";
import { db } from "@/db";
import { books, loans } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { formatDate } from "@/lib/utils";

export default async function MyLoansPage() {
  const user = await requireUser();

  const rows = await db
    .select({ loan: loans, title: books.title, author: books.author })
    .from(loans)
    .innerJoin(books, eq(loans.bookId, books.id))
    .where(eq(loans.userId, user.id))
    .orderBy(desc(loans.borrowedAt));

  const now = new Date();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pinjaman saya</h1>

      {rows.length === 0 ? (
        <p className="text-muted">
          Kamu belum meminjam buku. Pilih buku dari katalog.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="p-3">Buku</th>
                <th className="p-3">Dipinjam</th>
                <th className="p-3">Jatuh tempo</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ loan, title, author }) => {
                const overdue =
                  loan.status === "borrowed" && loan.dueDate < now;
                return (
                  <tr
                    key={loan.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="p-3">
                      <p className="font-medium">{title}</p>
                      <p className="text-muted">{author}</p>
                    </td>
                    <td className="p-3">{formatDate(loan.borrowedAt)}</td>
                    <td className="p-3">{formatDate(loan.dueDate)}</td>
                    <td className="p-3">
                      {loan.status === "returned" ? (
                        <span>Dikembalikan {formatDate(loan.returnedAt)}</span>
                      ) : overdue ? (
                        <span className="font-medium text-red-700">
                          Terlambat
                        </span>
                      ) : (
                        <span>Dipinjam</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {loan.status === "borrowed" && (
                        <form action={returnBook.bind(null, loan.id)}>
                          <button className="btn-outline">Kembalikan</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
