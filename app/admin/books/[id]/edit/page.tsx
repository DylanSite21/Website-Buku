import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { updateBook } from "@/actions/books";
import { BookForm } from "@/app/components/book-form";
import { db } from "@/db";
import { books, categories } from "@/db/schema";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = Number(id);
  if (!Number.isInteger(bookId)) notFound();

  const [[book], cats] = await Promise.all([
    db.select().from(books).where(eq(books.id, bookId)).limit(1),
    db.select().from(categories).orderBy(categories.name),
  ]);
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ubah buku</h1>
      <BookForm
        action={updateBook.bind(null, book.id)}
        categories={cats}
        book={book}
      />
    </div>
  );
}
