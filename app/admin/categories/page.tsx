import { asc } from "drizzle-orm";
import { ActionFeedback } from "@/app/components/action-feedback";
import { deleteCategory, saveCategory } from "@/actions/admin";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Katalog</p><h1 className="mt-2 text-4xl font-bold">Kategori</h1></div>
      {error === "in-use" && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Kategori yang masih dipakai buku tidak dapat dihapus.</p>}
      <section className="rounded-xl border border-line bg-white p-5"><h2 className="mb-4 text-xl font-bold">Tambah kategori</h2>
        <ActionFeedback action={saveCategory.bind(null, null)} submitLabel="Tambah kategori">
          <label className="block"><span className="label">Nama kategori</span><input className="input" name="name" maxLength={255} required /></label>
          <label className="block"><span className="label">Deskripsi</span><textarea className="input" name="description" maxLength={5000} /></label>
        </ActionFeedback>
      </section>
      <div className="space-y-3">{rows.map((category) => <section key={category.id} className="grid gap-5 rounded-xl border border-line bg-white p-5 md:grid-cols-[1fr_auto]">
        <ActionFeedback action={saveCategory.bind(null, category.id)} submitLabel="Simpan">
          <label className="block"><span className="label">Nama</span><input className="input" name="name" defaultValue={category.name} maxLength={255} required /></label>
          <label className="block"><span className="label">Deskripsi</span><textarea className="input" name="description" defaultValue={category.description ?? ""} maxLength={5000} /></label>
        </ActionFeedback>
        <form action={deleteCategory.bind(null, category.id)}><button className="btn-danger">Hapus kategori</button></form>
      </section>)}</div>
    </div>
  );
}
