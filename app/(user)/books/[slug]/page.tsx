import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { addToCart } from "@/actions/cart";
import { requestLoan } from "@/actions/loans";
import { BookCover } from "@/app/components/book-cover";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { books, categories, stocks } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [result, user] = await Promise.all([
    db
      .select({ book: books, category: categories.name, stock: stocks })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .leftJoin(stocks, eq(books.id, stocks.bookId))
      .where(eq(books.slug, slug))
      .limit(1),
    getCurrentUser(),
  ]);

  const row = result[0];

  if (!row || row.book.status !== "published") notFound();

  const availableStock = row.stock?.availableQuantity ?? 0;
  const isAvailable = availableStock > 0;

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="transition hover:text-brand">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/books" className="transition hover:text-brand">
            Katalog Buku
          </Link>
          <span>/</span>
          <span className="max-w-[180px] truncate font-medium text-ink">
            {row.book.title}
          </span>
        </nav>

        {/* Book detail */}
        <section className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Cover */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-brand/5 blur-2xl" />

            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-white p-3 shadow-xl">
                <BookCover title={row.book.title} image={row.book.image} />
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="flex flex-col pt-2">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand">
                {row.category ?? "Koleksi Buku"}
              </span>

              <span className="text-sm text-muted">
                {availableStock} eksemplar tersedia
              </span>
            </div>

            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {row.book.title}
            </h1>

            <p className="mt-4 text-base text-muted sm:text-lg">
              Ditulis oleh{" "}
              <span className="font-semibold text-ink">
                {row.book.author}
              </span>
            </p>

            {/* Price */}
            <div className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Harga buku
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-brand">
                {formatCurrency(row.book.price)}
              </p>

              <p className="mt-2 text-xs text-muted">
                Harga pembelian per eksemplar
              </p>
            </div>

            {/* Specifications */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-ink">
                Informasi Buku
              </h2>

              <dl className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Penerbit", value: row.book.publisher || "-" },
                  {
                    label: "Tahun Terbit",
                    value: row.book.publicationYear || "-",
                  },
                  { label: "ISBN", value: row.book.isbn || "-" },
                  {
                    label: "Stok Tersedia",
                    value: `${availableStock} eksemplar`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-line bg-white p-4"
                  >
                    <dt className="text-xs text-muted">{item.label}</dt>
                    <dd className="mt-2 break-words text-sm font-semibold text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-ink">
                Deskripsi Buku
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-8 text-muted">
                {row.book.description || "Belum ada deskripsi untuk buku ini."}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-9 border-t border-line pt-7">
              {user?.role === "user" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <form
                    action={addToCart.bind(null, row.book.id)}
                    className="flex flex-col gap-3"
                  >
                    <label
                      htmlFor="purchase-quantity"
                      className="text-xs font-semibold text-muted"
                    >
                      Jumlah pembelian
                    </label>

                    <input
                      id="purchase-quantity"
                      aria-label="Jumlah pembelian"
                      className="input w-full"
                      type="number"
                      name="quantity"
                      min="1"
                      max="20"
                      defaultValue="1"
                    />

                    <button
                      className="btn-primary w-full justify-center py-3"
                      disabled={!isAvailable}
                    >
                      <span>+</span>
                      Tambah ke Keranjang
                    </button>
                  </form>

                  <form
                    action={requestLoan.bind(null, row.book.id)}
                    className="flex flex-col gap-3"
                  >
                    <label
                      htmlFor="loan-quantity"
                      className="text-xs font-semibold text-muted"
                    >
                      Jumlah peminjaman
                    </label>

                    <input
                      id="loan-quantity"
                      aria-label="Jumlah peminjaman"
                      className="input w-full"
                      type="number"
                      name="quantity"
                      min="1"
                      max="5"
                      defaultValue="1"
                    />

                    <button
                      className="btn-outline w-full justify-center py-3"
                      disabled={!isAvailable}
                    >
                      Ajukan Peminjaman
                    </button>
                  </form>
                </div>
              ) : user?.role === "admin" ? (
                <Link
                  className="btn-outline inline-flex justify-center px-6 py-3"
                  href="/admin/books"
                >
                  Kelola Buku
                </Link>
              ) : (
                <div className="rounded-2xl border border-line bg-white p-5">
                  <h3 className="font-bold text-ink">
                    Ingin memiliki atau meminjam buku ini?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Masuk ke akun kamu untuk menikmati layanan pembelian dan
                    peminjaman buku.
                  </p>

                  <Link
                    href="/login"
                    className="btn-primary mt-5 inline-flex w-full justify-center py-3 sm:w-auto sm:px-10"
                  >
                    Masuk Sekarang
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/books"
              className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand"
            >
              <span>←</span> Kembali ke katalog buku
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
