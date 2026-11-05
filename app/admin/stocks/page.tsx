import { asc, eq } from "drizzle-orm";
import { ActionFeedback } from "@/app/components/action-feedback";
import { changeStock } from "@/actions/admin";
import { db } from "@/lib/db";
import { books, stocks } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminStocksPage() {
  const rows = await db.select({ book: books, stock: stocks }).from(stocks)
    .innerJoin(books, eq(stocks.bookId, books.id)).orderBy(asc(books.title));
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Inventaris</p><h1 className="mt-2 text-4xl font-bold">Kelola stok</h1><p className="mt-2 text-muted">Jumlah total sama dengan tersedia + reservasi + dipinjam.</p></div>
      <div className="space-y-4">{rows.map(({ book, stock }) => <article key={stock.id} className="grid gap-6 rounded-xl border border-line bg-white p-5 lg:grid-cols-[1fr_1.2fr]">
        <div><h2 className="text-lg font-bold">{book.title}</h2><p className="mt-1 text-sm text-muted">{book.author}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted">Total fisik</dt><dd className="font-bold">{stock.totalQuantity}</dd></div>
            <div><dt className="text-muted">Tersedia</dt><dd className="font-bold">{stock.availableQuantity}</dd></div>
            <div><dt className="text-muted">Reservasi</dt><dd className="font-bold">{stock.reservedQuantity}</dd></div>
            <div><dt className="text-muted">Dipinjam</dt><dd className="font-bold">{stock.borrowedQuantity}</dd></div>
          </dl>
        </div>
        <ActionFeedback action={changeStock.bind(null, book.id)} submitLabel="Simpan stok">
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className="label">Operasi</span><select name="mode" className="input"><option value="restock">Tambah stok</option><option value="adjustment">Atur total fisik</option></select></label>
            <label><span className="label">Jumlah</span><input className="input" type="number" name="quantity" min="0" step="1" required /></label>
          </div>
          <label className="block"><span className="label">Catatan audit</span><input className="input" name="notes" maxLength={1000} /></label>
        </ActionFeedback>
      </article>)}</div>
    </div>
  );
}
