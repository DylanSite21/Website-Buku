import Link from "next/link";
import { and, asc, count, eq, like, or, type SQL } from "drizzle-orm";
import { archiveBook } from "@/actions/books";
import { BookCover } from "@/app/components/book-cover";
import { db } from "@/lib/db";
import { books, categories, stocks } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { BookAlert } from "@/app/components/admin-book-form";
import ArchiveButton from "@/app/components/ArchiveButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    page?: string;
    q?: string;
    success?: string;
  }>;
}) {
  const { error, page: pageParam = "", success, q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const conditions: SQL[] = [];
  if (query) {
    const term = `%${query.replace(/[%_]/g, "\\$&")}%`;
    conditions.push(
      or(
        like(books.title, term),
        like(books.author, term),
        like(books.isbn, term),
        like(categories.name, term),
      )!,
    );
  }
  const requestedPage = Number(pageParam);
  const safePage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const countResult = await db
    .select({ value: count() })
    .from(books)
    .leftJoin(categories, eq(categories.id, books.categoryId))
    .where(conditions.length ? and(...conditions) : undefined);
  const totalCount = countResult[0].value;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1;
  const rows = await db
    .select({ book: books, category: categories.name, stock: stocks })
    .from(books)
    .leftJoin(categories, eq(categories.id, books.categoryId))
    .leftJoin(stocks, eq(stocks.bookId, books.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(books.title))
    .limit(PAGE_SIZE)
    .offset((currentPage - 1) * PAGE_SIZE);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", String(page));
    return `/admin/books?${params.toString()}`;
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
    <div className="space-y-6">
      <BookAlert error={error} success={success} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Katalog
          </p>
          <h1 className="mt-2 text-4xl font-bold">Kelola buku</h1>
        </div>
        <Link href="/admin/books/new" className="btn-primary">
          Tambah buku
        </Link>
      </div>
      <form
        className="flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4"
        role="search"
      >
        <label className="sr-only" htmlFor="book-search">
          Cari buku
        </label>
        <input
          id="book-search"
          className="input min-w-0 flex-1"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Cari judul, penulis, ISBN, atau kategori"
        />
        <button className="btn-primary">Cari</button>
        {query && (
          <Link className="btn-outline" href="/admin/books">
            Reset
          </Link>
        )}
      </form>
      <p className="text-sm text-muted">{totalCount} buku ditemukan</p>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-muted">
            <tr>
              <th className="p-4">Buku</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Stok (tersedia)</th>
              <th className="p-4">Status</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ book, category, stock }) => (
              <tr key={book.id} className="border-t border-line">
                <td className="p-4">
                  <div className="group/book relative w-fit">
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      style={{ anchorName: `--book-${book.id}` }}
                      className="font-semibold hover:text-brand"
                    >
                      {book.title}
                    </Link>

                    <div
                      style={{ positionAnchor: `--book-${book.id}` }}
                      className="
        invisible fixed z-50 w-48
        rounded-xl border border-line
        bg-white p-2 shadow-xl
        opacity-0 transition-all duration-200
        [position-area:right]
        [position-try-fallbacks:flip-inline]
        group-hover/book:visible
        group-hover/book:opacity-100
      "
                    >
                      <div className="overflow-hidden rounded-lg">
                        <BookCover title={book.title} image={book.image} />
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm font-semibold">
                        {book.title}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted">{book.author}</p>
                </td>
                <td className="p-4">{category ?? "-"}</td>
                <td className="p-4">{formatCurrency(book.price)}</td>
                <td className="p-4">
                  {stock?.totalQuantity ?? 0} ({stock?.availableQuantity ?? 0})
                </td>
                <td className="p-4">{book.status}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      className="btn-outline"
                      href={`/admin/books/${book.id}/edit`}
                    >
                      Ubah
                    </Link>
                    {book.status !== "archived" && (
                      <ArchiveButton bookId={book.id} bookTitle={book.title} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">
            {query
              ? "Buku tidak ditemukan. Coba kata kunci lain."
              : "Belum ada data buku."}
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <nav
          aria-label="Navigasi halaman daftar buku"
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
    </div>
  );
}
