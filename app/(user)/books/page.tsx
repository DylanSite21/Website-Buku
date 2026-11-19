import Link from "next/link";
import { and, count, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { books, categories, stocks } from "@/lib/db/schema";
import { BookCover } from "@/app/components/book-cover";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page: pageParam = "" } = await searchParams;
  const conditions: SQL[] = [eq(books.status, "published")];
  if (q.trim()) {
    const term = `%${q.trim().replace(/[%_]/g, "\\$&")}%`;
    conditions.push(
      or(
        like(books.title, term),
        like(books.author, term),
        like(books.isbn, term),
      )!,
    );
  }
  if (category) conditions.push(eq(books.categoryId, category));

  const requestedPage = Number(pageParam);
  const safePage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [countResult, categoryList] = await Promise.all([
    db.select({ value: count() }).from(books).where(and(...conditions)),
    db.select().from(categories).orderBy(categories.name),
  ]);
  const totalCount = countResult[0].value;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1;
  const results = await db
    .select({ book: books, categoryName: categories.name, stock: stocks })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .leftJoin(stocks, eq(books.id, stocks.bookId))
    .where(and(...conditions))
    .orderBy(books.title)
    .limit(PAGE_SIZE)
    .offset((currentPage - 1) * PAGE_SIZE);

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("page", String(page));
    return `/books?${params.toString()}`;
  };
  const firstVisiblePage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4),
  );
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <main className="space-y-10">
      {/* Header */}
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
          Jelajahi Koleksi
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Katalog Buku
        </h1>

        <p className="mt-3 max-w-xl leading-7 text-muted">
          Temukan bacaan favoritmu. Beli untuk koleksi pribadi atau ajukan
          peminjaman dengan mudah.
        </p>
      </section>

      {/* Search */}
      <form className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:grid-cols-[1fr_230px_auto] sm:p-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul, penulis, atau ISBN..."
          className="input w-full"
        />

        <select
          name="category"
          defaultValue={category}
          className="input w-full"
        >
          <option value="">Semua kategori</option>
          {categoryList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <button className="btn-primary justify-center px-7">Cari Buku</button>
      </form>

      {/* Results heading */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-bold">Koleksi Buku</h2>
          <p className="mt-1 text-sm text-muted">
            {totalCount} buku ditemukan
          </p>
        </div>
      </div>

      {/* Empty state */}
      {totalCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-16 text-center">
          <p className="text-lg font-bold">Buku tidak ditemukan</p>
          <p className="mt-2 text-sm text-muted">
            Coba kata kunci atau kategori lainnya.
          </p>
          <Link href="/books" className="btn-outline mt-5 inline-flex">
            Lihat semua buku
          </Link>
        </div>
      ) : (
        /* Book grid */
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {results.map(({ book, categoryName, stock }) => (
            <li
              key={book.id}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Cover */}
              <Link
                href={`/books/${book.slug}`}
                className="block overflow-hidden bg-emerald-50 p-3 sm:p-4"
              >
                <div className="overflow-hidden rounded-lg shadow-md">
                  <BookCover title={book.title} image={book.image} />
                </div>
              </Link>

              {/* Information */}
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand sm:text-xs">
                  {categoryName ?? "Umum"}
                </p>

                <Link
                  href={`/books/${book.slug}`}
                  className="mt-2 line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-brand sm:text-base"
                >
                  {book.title}
                </Link>

                <p className="mt-1 line-clamp-1 text-xs text-muted sm:text-sm">
                  {book.author}
                </p>

                <div className="mt-4">
                  <p className="text-sm font-extrabold text-brand sm:text-base">
                    {formatCurrency(book.price)}
                  </p>
                </div>

                {/* Stock */}
                <div className="my-3 flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      (stock?.availableQuantity ?? 0) > 0
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />

                  <p className="text-[10px] text-muted sm:text-xs">
                    {(stock?.availableQuantity ?? 0) > 0
                      ? `${stock?.availableQuantity} tersedia`
                      : "Stok habis"}
                  </p>
                </div>

                {/* Detail button */}
                <Link
                  href={`/books/${book.slug}`}
                  className="btn-outline mt-auto mt-4 flex w-full justify-center py-2.5 text-xs sm:text-sm"
                >
                  Lihat Detail
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Navigasi halaman katalog"
          className="flex items-center justify-center gap-2"
        >
          {currentPage > 1 && (
            <Link
              href={pageHref(currentPage - 1)}
              className="btn-outline px-3 py-2 text-sm"
              aria-label="Halaman sebelumnya"
            >
              Sebelumnya
            </Link>
          )}

          {visiblePages.map((page) => (
            <Link
              key={page}
              href={pageHref(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                page === currentPage
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-ink hover:bg-emerald-50"
              }`}
            >
              {page}
            </Link>
          ))}

          {currentPage < totalPages && (
            <Link
              href={pageHref(currentPage + 1)}
              className="btn-outline px-3 py-2 text-sm"
              aria-label="Halaman berikutnya"
            >
              Berikutnya
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
