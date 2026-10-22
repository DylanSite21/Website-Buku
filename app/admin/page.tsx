import { and, asc, count, eq, lt } from "drizzle-orm";
import { returnBook } from "@/actions/loans";
import { db } from "@/db";
import { books, loans, users } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const now = new Date();

  const [[b], [u], [active], [overdue], activeLoans] = await Promise.all([
    db.select({ n: count() }).from(books),
    db.select({ n: count() }).from(users).where(eq(users.role, "user")),
    db.select({ n: count() }).from(loans).where(eq(loans.status, "borrowed")),
    db
      .select({ n: count() })
      .from(loans)
      .where(and(eq(loans.status, "borrowed"), lt(loans.dueDate, now))),
    db
      .select({ loan: loans, title: books.title, member: users.name })
      .from(loans)
      .innerJoin(books, eq(loans.bookId, books.id))
      .innerJoin(users, eq(loans.userId, users.id))
      .where(eq(loans.status, "borrowed"))
      .orderBy(asc(loans.dueDate)),
  ]);

  const stats = [
    { label: "Judul buku", value: b.n },
    { label: "Anggota", value: u.n },
    { label: "Sedang dipinjam", value: active.n },
    { label: "Terlambat", value: overdue.n },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Ringkasan</h1>

      <dl className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-line bg-white p-4"
          >
            <dd className="text-3xl font-bold">{s.value}</dd>
            <dt className="text-sm text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Pinjaman aktif</h2>
        {activeLoans.length === 0 ? (
          <p className="text-muted">Tidak ada buku yang sedang dipinjam.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="p-3">Buku</th>
                  <th className="p-3">Peminjam</th>
                  <th className="p-3">Jatuh tempo</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {activeLoans.map(({ loan, title, member }) => (
                  <tr
                    key={loan.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="p-3 font-medium">{title}</td>
                    <td className="p-3">{member}</td>
                    <td
                      className={`p-3 ${loan.dueDate < now ? "font-medium text-red-700" : ""}`}
                    >
                      {formatDate(loan.dueDate)}
                    </td>
                    <td className="p-3 text-right">
                      <form action={returnBook.bind(null, loan.id)}>
                        <button className="btn-outline">
                          Tandai dikembalikan
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
