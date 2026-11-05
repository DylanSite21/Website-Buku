import Link from "next/link";
import { eq } from "drizzle-orm";
import { deleteBook } from "@/actions/books";
import { db } from "@/db";
import { books, categories } from "@/db/schema";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const rows = await db
    .select({ book: books, category: categories.name })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .orderBy(books.title);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelola buku</h1>
        <Link href="/admin/books/new" className="btn-primary">
          Tambah buku
        </Link>
      </div>

      {error === "punya-riwayat" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Buku ini punya riwayat peminjaman sehingga tidak bisa dihapus.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Penulis</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Stok</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ book, category }) => (
              <tr key={book.id} className="border-b border-line last:border-0">
                <td className="p-3 font-medium">{book.title}</td>
                <td className="p-3">{book.author}</td>
                <td className="p-3">{category ?? "-"}</td>
                <td className="p-3">
                  {book.availableCopies}/{book.totalCopies}
                </td>
                <td className="flex justify-end gap-2 p-3">
                  <Link
                    href={`/admin/books/${book.id}/edit`}
                    className="btn-outline"
                  >
                    Ubah
                  </Link>
                  <form action={deleteBook.bind(null, book.id)}>
                    <button className="btn-danger">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
