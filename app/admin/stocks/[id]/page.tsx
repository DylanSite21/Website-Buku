import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActionFeedback } from "@/app/components/action-feedback";
import { changeStock } from "@/actions/admin";
import { db } from "@/lib/db";
import { books, categories, stocks } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function BookStockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select({ book: books, category: categories.name, stock: stocks })
    .from(books)
    .leftJoin(categories, eq(categories.id, books.categoryId))
    .leftJoin(stocks, eq(stocks.bookId, books.id))
    .where(eq(books.id, id))
    .limit(1);
  if (!row?.stock) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/stocks" className="text-sm font-semibold text-brand">← Kembali ke daftar produk</Link>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Inventaris · {row.category ?? "Belum berkategori"}</p>
        <h1 className="mt-2 text-4xl font-bold">{row.book.title}</h1>
        <p className="mt-2 text-muted">{row.book.author}</p>
      </div>
      <section className="rounded-xl border border-line bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Ringkasan stok</h2>
        <dl className="grid gap-4 sm:grid-cols-4">
          <div><dt className="text-sm text-muted">Total fisik</dt><dd className="text-2xl font-bold">{row.stock.totalQuantity}</dd></div>
          <div><dt className="text-sm text-muted">Tersedia</dt><dd className="text-2xl font-bold">{row.stock.availableQuantity}</dd></div>
          <div><dt className="text-sm text-muted">Reservasi</dt><dd className="text-2xl font-bold">{row.stock.reservedQuantity}</dd></div>
          <div><dt className="text-sm text-muted">Dipinjam</dt><dd className="text-2xl font-bold">{row.stock.borrowedQuantity}</dd></div>
        </dl>
      </section>
      <section className="max-w-xl rounded-xl border border-line bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Ubah stok</h2>
        <ActionFeedback action={changeStock.bind(null, row.book.id)} submitLabel="Simpan stok">
          <label className="block">
            <span className="label">Operasi</span>
            <select name="mode" className="input">
              <option value="restock">Tambah stok</option>
              <option value="adjustment">Atur total fisik</option>
            </select>
          </label>
          <label className="block">
            <span className="label">Jumlah</span>
            <input className="input" type="number" name="quantity" min="0" max="10000" step="1" required />
          </label>
          <label className="block">
            <span className="label">Catatan audit (opsional)</span>
            <input className="input" name="notes" maxLength={1000} />
          </label>
        </ActionFeedback>
      </section>
    </div>
  );
}
