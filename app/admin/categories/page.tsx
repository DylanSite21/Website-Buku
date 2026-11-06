import Link from "next/link";
import { asc, count, eq, like, or } from "drizzle-orm";
import { ActionFeedback } from "@/app/components/action-feedback";
import { saveCategory } from "@/actions/admin";
import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const { error, q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const term = `%${query.replace(/[%_]/g, "\\$&")}%`;
  const rows = await db.select({
    category: categories,
    bookCount: count(books.id),
  }).from(categories)
    .leftJoin(books, eq(books.categoryId, categories.id))
    .where(query ? or(like(categories.name, term), like(categories.description, term)) : undefined)
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Katalog</p>
        <h1 className="mt-2 text-4xl font-bold">Kategori</h1>
        <p className="mt-2 text-muted">Pilih kategori untuk mengubah detailnya.</p>
      </div>
      {error === "in-use" && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Kategori yang masih dipakai buku tidak dapat dihapus.</p>}
      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="mb-4 text-xl font-bold">Tambah kategori</h2>
        <ActionFeedback action={saveCategory.bind(null, null)} submitLabel="Tambah kategori">
          <label className="block"><span className="label">Nama kategori</span><input className="input" name="name" maxLength={255} required /></label>
          <label className="block"><span className="label">Deskripsi</span><textarea className="input" name="description" maxLength={5000} /></label>
        </ActionFeedback>
      </section>
      <form className="flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4" role="search">
        <label className="sr-only" htmlFor="category-search">Cari kategori</label>
        <input id="category-search" className="input min-w-0 flex-1" type="search" name="q" defaultValue={query} placeholder="Cari nama atau deskripsi kategori" />
        <button className="btn-primary">Cari</button>
        {query && <Link className="btn-outline" href="/admin/categories">Reset</Link>}
      </form>
      {rows.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ category, bookCount }) => (
            <li key={category.id}>
              <Link href={`/admin/categories/${category.id}`} className="block h-full rounded-xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-sm">
                <h2 className="text-lg font-bold">{category.name}</h2>
                <p className="mt-2 line-clamp-2 min-h-12 text-sm text-muted">{category.description || "Belum ada deskripsi kategori."}</p>
                <p className="mt-4 text-sm text-muted">{bookCount} buku</p>
                <span className="mt-3 inline-block text-sm font-semibold text-brand">Kelola kategori →</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
          {query ? "Kategori tidak ditemukan. Coba kata kunci lain." : "Belum ada kategori."}
        </p>
      )}
    </div>
  );
}
