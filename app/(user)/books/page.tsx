import Link from "next/link";
import { and, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { books, categories, stocks } from "@/lib/db/schema";
import { BookCover } from "@/app/components/book-cover";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const conditions: SQL[] = [eq(books.status, "published")];
  if (q.trim()) {
    const term = `%${q.trim().replace(/[%_]/g, "\\$&")}%`;
    conditions.push(or(like(books.title, term), like(books.author, term), like(books.isbn, term))!);
  }
  if (category) conditions.push(eq(books.categoryId, category));

  const [results, categoryList] = await Promise.all([
    db.select({ book: books, categoryName: categories.name, stock: stocks })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .leftJoin(stocks, eq(books.id, stocks.bookId))
      .where(and(...conditions))
      .orderBy(books.title),
    db.select().from(categories).orderBy(categories.name),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Jelajahi koleksi</p>
        <h1 className="mt-2 text-4xl font-bold">Katalog buku</h1>
        <p className="mt-2 text-muted">Pilih bacaan, beli untuk koleksi pribadi, atau ajukan peminjaman.</p>
      </div>
      <form className="grid gap-3 rounded-xl border border-line bg-white p-4 sm:grid-cols-[1fr_240px_auto]">
        <input name="q" defaultValue={q} placeholder="Judul, penulis, atau ISBN" className="input" />
        <select name="category" defaultValue={category} className="input">
          <option value="">Semua kategori</option>
          {categoryList.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button className="btn-primary">Cari buku</button>
      </form>
      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">Buku tidak ditemukan. Coba kata kunci lain.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ book, categoryName, stock }) => (
            <li key={book.id} className="flex gap-4 rounded-xl border border-line bg-white p-4 shadow-sm">
              <BookCover title={book.title} image={book.image} />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">{categoryName ?? "Umum"}</p>
                <Link href={`/books/${book.slug}`} className="mt-1 text-lg font-bold leading-snug hover:text-brand">{book.title}</Link>
                <p className="mt-1 text-sm text-muted">{book.author}</p>
                <p className="mt-3 font-semibold">{formatCurrency(book.price)}</p>
                <p className="mt-auto pt-2 text-xs text-muted">{stock?.availableQuantity ?? 0} tersedia untuk dibeli atau dipinjam</p>
                <Link href={`/books/${book.slug}`} className="btn-outline mt-3">Lihat detail</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}