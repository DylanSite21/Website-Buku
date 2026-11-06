import Link from "next/link";
import { asc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { books, categories, stocks } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminStocksPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const term = `%${query.replace(/[%_]/g, "\\$&")}%`;
  const rows = await db.select({ book: books, category: categories.name, stock: stocks })
    .from(books)
    .leftJoin(categories, eq(categories.id, books.categoryId))
    .leftJoin(stocks, eq(stocks.bookId, books.id))
    .where(query ? or(like(books.title, term), like(books.author, term), like(books.isbn, term), like(categories.name, term)) : undefined)
    .orderBy(asc(books.title));

  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Inventaris</p><h1 className="mt-2 text-4xl font-bold">Kelola stok</h1><p className="mt-2 text-muted">Jumlah total sama dengan tersedia + reservasi + dipinjam.</p></div>
      <form className="flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4" role="search">
        <label className="sr-only" htmlFor="stock-book-search">Cari buku</label>
        <input id="stock-book-search" className="input min-w-0 flex-1" type="search" name="q" defaultValue={query} placeholder="Cari judul, penulis, ISBN, atau kategori" />
        <button className="btn-primary">Cari</button>
        {query && <Link className="btn-outline" href="/admin/stocks">Reset</Link>}
      </form>
      {rows.length ? <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ book, category, stock }) => <li key={book.id}>
          <Link href={`/admin/stocks/${book.id}`} className="block h-full rounded-xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">{category ?? "Belum berkategori"}</p>
            <h2 className="mt-2 text-lg font-bold">{book.title}</h2>
            <p className="mt-1 text-sm text-muted">{book.author}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Total fisik</dt><dd className="font-bold">{stock?.totalQuantity ?? 0}</dd></div>
              <div><dt className="text-muted">Tersedia</dt><dd className="font-bold">{stock?.availableQuantity ?? 0}</dd></div>
            </dl>
            <span className="mt-4 inline-block text-sm font-semibold text-brand">Kelola stok →</span>
          </Link>
        </li>)}
      </ul> : <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">{query ? "Buku tidak ditemukan. Coba kata kunci lain." : "Belum ada data buku."}</p>}
    </div>
  );
}
