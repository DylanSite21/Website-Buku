import { createBook } from "@/actions/books";
import { BookForm } from "@/app/components/book-form";
import { db } from "@/db";
import { categories } from "@/db/schema";

export default async function NewBookPage() {
  const cats = await db.select().from(categories).orderBy(categories.name);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tambah buku</h1>
      <BookForm action={createBook} categories={cats} />
    </div>
  );
}
