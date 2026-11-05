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

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [result, user] = await Promise.all([
    db.select({ book: books, category: categories.name, stock: stocks })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .leftJoin(stocks, eq(books.id, stocks.bookId))
      .where(eq(books.slug, slug)).limit(1),
    getCurrentUser(),
  ]);
  const row = result[0];
  if (!row || row.book.status !== "published") notFound();

  return (
    <article className="grid gap-10 md:grid-cols-[320px_1fr]">
      <BookCover title={row.book.title} image={row.book.image} />
      <div>
        <Link href="/books" className="text-sm font-semibold text-brand">← Kembali ke katalog</Link>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-brand">{row.category ?? "Koleksi Buku"}</p>
        <h1 className="mt-2 text-4xl font-bold">{row.book.title}</h1>
        <p className="mt-2 text-lg text-muted">oleh {row.book.author}</p>
        <p className="mt-5 text-2xl font-bold">{formatCurrency(row.book.price)}</p>
        <dl className="mt-6 grid max-w-xl grid-cols-2 gap-4 border-y border-line py-5 text-sm">
          <div><dt className="text-muted">Penerbit</dt><dd className="mt-1 font-medium">{row.book.publisher}</dd></div>
          <div><dt className="text-muted">Tahun terbit</dt><dd className="mt-1 font-medium">{row.book.publicationYear}</dd></div>
          <div><dt className="text-muted">ISBN</dt><dd className="mt-1 font-medium">{row.book.isbn ?? "-"}</dd></div>
          <div><dt className="text-muted">Tersedia</dt><dd className="mt-1 font-medium">{row.stock?.availableQuantity ?? 0} eksemplar</dd></div>
        </dl>
        <p className="mt-6 whitespace-pre-line leading-7 text-muted">{row.book.description || "Belum ada deskripsi untuk buku ini."}</p>
        {user?.role === "user" ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <form action={addToCart.bind(null, row.book.id)} className="flex items-center gap-2">
              <input aria-label="Jumlah pembelian" className="input w-20" type="number" name="quantity" min="1" max="20" defaultValue="1" />
              <button className="btn-primary" disabled={!row.stock?.availableQuantity}>Tambah ke keranjang</button>
            </form>
            <form action={requestLoan.bind(null, row.book.id)} className="flex items-center gap-2">
              <input aria-label="Jumlah peminjaman" className="input w-20" type="number" name="quantity" min="1" max="5" defaultValue="1" />
              <button className="btn-outline" disabled={!row.stock?.availableQuantity}>Ajukan pinjam</button>
            </form>
          </div>
        ) : user?.role === "admin" ? (
          <Link className="btn-outline mt-8" href="/admin/books">Kelola buku</Link>
        ) : (
          <Link href="/login" className="btn-primary mt-8">Masuk untuk membeli atau meminjam</Link>
        )}
      </div>
    </article>
  );
}