"use client";

import { useActionState } from "react";
import { FormSubmit } from "@/app/components/form-submit";
import type { FormState } from "@/lib/types";

type BookFields = {
  title: string;
  categoryId: string;
  author: string;
  publisher: string;
  publicationYear: number;
  isbn: string | null;
  price: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  totalStock: number;
  image: string | null;
};

export function AdminBookForm({
  action,
  categories,
  book,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: { id: string; name: string }[];
  book?: BookFields;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-line bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Judul</span><input className="input" name="title" defaultValue={book?.title} maxLength={255} required /></label>
        <label><span className="label">Kategori</span><select className="input" name="categoryId" defaultValue={book?.categoryId ?? ""} required><option value="" disabled>Pilih kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label><span className="label">Penulis</span><input className="input" name="author" defaultValue={book?.author} maxLength={255} required /></label>
        <label><span className="label">Penerbit</span><input className="input" name="publisher" defaultValue={book?.publisher} maxLength={255} required /></label>
        <label><span className="label">Tahun terbit</span><input className="input" name="publicationYear" type="number" min="1000" max={new Date().getFullYear()} defaultValue={book?.publicationYear ?? new Date().getFullYear()} required /></label>
        <label><span className="label">ISBN</span><input className="input" name="isbn" defaultValue={book?.isbn ?? ""} maxLength={20} /></label>
        <label><span className="label">Harga (IDR)</span><input className="input" name="price" type="number" min="0" step="0.01" defaultValue={book?.price ?? ""} required /></label>
        <label><span className="label">Jumlah stok fisik</span><input className="input" name="totalStock" type="number" min="0" step="1" defaultValue={book?.totalStock ?? 0} required /></label>
        <label><span className="label">Status katalog</span><select className="input" name="status" defaultValue={book?.status ?? "published"}><option value="draft">Draft</option><option value="published">Terbit</option><option value="archived">Arsip</option></select></label>
        <label><span className="label">Sampul (JPG, PNG, WebP, maks. 5 MB)</span><input className="input" name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
      </div>
      <label className="block"><span className="label">Deskripsi</span><textarea className="input min-h-28" name="description" maxLength={10000} defaultValue={book?.description ?? ""} /></label>
      {book?.image && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="removeImage" /> Hapus sampul saat ini</label>}
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
      <FormSubmit>{book ? "Simpan perubahan" : "Tambah buku"}</FormSubmit>
    </form>
  );
}
