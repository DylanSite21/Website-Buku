import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateBook } from "@/actions/books";
import { AdminBookForm } from "@/app/components/admin-book-form";
import { db } from "@/lib/db";
import { books, categories, stocks } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [[row], categoryList] = await Promise.all([
    db.select({ book: books, stock: stocks }).from(books).leftJoin(stocks, eq(stocks.bookId, books.id)).where(eq(books.id, id)).limit(1),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
  ]);
  if (!row || !row.stock) notFound();
  return <div className="space-y-6"><Link href="/admin/books" className="text-sm font-semibold text-brand">← Kembali</Link><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Katalog</p><h1 className="mt-2 text-4xl font-bold">Ubah buku</h1></div><AdminBookForm action={updateBook.bind(null, id)} categories={categoryList} book={{...row.book, totalStock: row.stock.totalQuantity}} /></div>;
}
