import Link from "next/link";
import { asc } from "drizzle-orm";
import { createBook } from "@/actions/books";
import { AdminBookForm } from "@/app/components/admin-book-form";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const categoryList = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
  return <div className="space-y-6"><Link href="/admin/books" className="text-sm font-semibold text-brand">← Kembali</Link><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Katalog</p><h1 className="mt-2 text-4xl font-bold">Tambah buku</h1></div>{categoryList.length ? <AdminBookForm action={createBook} categories={categoryList} /> : <p className="rounded-md bg-amber-50 p-4 text-amber-900">Buat kategori sebelum menambahkan buku. <Link className="font-bold" href="/admin/categories">Kelola kategori</Link></p>}</div>;
}
