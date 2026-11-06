import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActionFeedback } from "@/app/components/action-feedback";
import { deleteCategory, saveCategory } from "@/actions/admin";
import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category] = await db.select({
    category: categories,
    bookCount: count(books.id),
  }).from(categories)
    .leftJoin(books, eq(books.categoryId, categories.id))
    .where(eq(categories.id, id))
    .groupBy(categories.id)
    .limit(1);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/categories" className="text-sm font-semibold text-brand">← Kembali ke kategori</Link>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Kelola kategori</p>
        <h1 className="mt-2 text-4xl font-bold">{category.category.name}</h1>
        <p className="mt-2 text-muted">{category.bookCount} buku menggunakan kategori ini.</p>
      </div>
      <section className="max-w-xl rounded-xl border border-line bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Ubah kategori</h2>
        <ActionFeedback action={saveCategory.bind(null, id)} submitLabel="Simpan perubahan">
          <label className="block">
            <span className="label">Nama kategori</span>
            <input className="input" name="name" defaultValue={category.category.name} maxLength={255} required />
          </label>
          <label className="block">
            <span className="label">Deskripsi</span>
            <textarea className="input" name="description" defaultValue={category.category.description ?? ""} maxLength={5000} />
          </label>
        </ActionFeedback>
      </section>
      <section className="max-w-xl rounded-xl border border-red-100 bg-white p-6">
        <h2 className="text-lg font-bold">Hapus kategori</h2>
        <p className="mt-2 text-sm text-muted">Kategori hanya dapat dihapus jika tidak digunakan oleh buku mana pun.</p>
        <form className="mt-4" action={deleteCategory.bind(null, id)}>
          <button className="btn-danger">Hapus kategori</button>
        </form>
      </section>
    </div>
  );
}
