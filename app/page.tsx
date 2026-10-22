import Link from "next/link";
import { and, eq, like, or } from "drizzle-orm";
import { borrowBook } from "@/actions/loans";
import { db } from "@/db";
import { books, categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/dal";
import { BookCover } from "@/app/components/book-cover";

const errors: Record<string, string> = {
  "stok-habis": "Stok buku ini sudah habis.",
  "sudah-dipinjam": "Kamu sedang meminjam buku ini.",
  "hanya-anggota": "Hanya akun anggota yang bisa meminjam buku.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; error?: string }>;
}) {
  const { q, category, error } = await searchParams;
  const user = await getCurrentUser();

  const conditions = [];
  if (q)
    conditions.push(
      or(like(books.title, `%${q}%`), like(books.author, `%${q}%`)),
    );
  if (category) conditions.push(eq(books.categoryId, Number(category)));

  const [list, cats] = await Promise.all([
    db
      .select({ book: books, category: categories.name })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(books.title),
    db.select().from(categories).orderBy(categories.name),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Katalog buku</h1>
        <p className="text-muted">Cari buku, lalu pinjam selama 7 hari.</p>
      </div>

      {error && errors[error] && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errors[error]}
        </p>
      )}

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul atau penulis"
          className="input max-w-xs"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="input max-w-48"
        >
          <option value="">Semua kategori</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn-primary">Cari</button>
      </form>

      {list.length === 0 ? (
        <p className="text-muted">
          Tidak ada buku yang cocok. Coba kata kunci lain.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ book, category }) => (
            <li
              key={book.id}
              className="flex gap-4 rounded-lg border border-line bg-white p-4"
            >
              <BookCover id={book.id} title={book.title} cover={book.cover} />
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="font-semibold leading-snug">{book.title}</h2>
                <p className="text-sm text-muted">{book.author}</p>
                {category && (
                  <p className="mt-1 text-xs text-muted">{category}</p>
                )}
                <p className="mt-auto pt-2 text-sm">
                  {book.availableCopies > 0
                    ? `${book.availableCopies} dari ${book.totalCopies} tersedia`
                    : "Sedang dipinjam semua"}
                </p>

                {user?.role === "user" ? (
                  <form
                    action={borrowBook.bind(null, book.id)}
                    className="mt-2"
                  >
                    <button
                      className="btn-primary"
                      disabled={book.availableCopies === 0}
                    >
                      Pinjam
                    </button>
                  </form>
                ) : !user ? (
                  <Link href="/login" className="btn-outline mt-2">
                    Masuk untuk meminjam
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
