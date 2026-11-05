import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { archiveBook } from "@/actions/books";
import { db } from "@/lib/db";
import { books, categories, stocks } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const rows = await db.select({ book: books, category: categories.name, stock: stocks })
    .from(books).leftJoin(categories, eq(categories.id, books.categoryId))
    .leftJoin(stocks, eq(stocks.bookId, books.id)).orderBy(asc(books.title));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Katalog</p><h1 className="mt-2 text-4xl font-bold">Kelola buku</h1></div>
        <Link href="/admin/books/new" className="btn-primary">Tambah buku</Link>
      </div>
      {error === "active-loan" && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Buku masih memiliki peminjaman aktif dan tidak dapat diarsipkan.</p>}
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-muted"><tr><th className="p-4">Buku</th><th className="p-4">Kategori</th><th className="p-4">Harga</th><th className="p-4">Stok (tersedia)</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr></thead>
          <tbody>{rows.map(({ book, category, stock }) => <tr key={book.id} className="border-t border-line">
            <td className="p-4"><p className="font-semibold">{book.title}</p><p className="text-xs text-muted">{book.author}</p></td>
            <td className="p-4">{category ?? "-"}</td><td className="p-4">{formatCurrency(book.price)}</td>
            <td className="p-4">{stock?.totalQuantity ?? 0} ({stock?.availableQuantity ?? 0})</td><td className="p-4">{book.status}</td>
            <td className="p-4"><div className="flex gap-2"><Link className="btn-outline" href={`/admin/books/${book.id}/edit`}>Ubah</Link>{book.status !== "archived" && <form action={archiveBook.bind(null, book.id)}><button className="btn-danger">Arsipkan</button></form>}</div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
