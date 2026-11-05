"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Book } from "@/db/schema";
import type { FormState } from "@/lib/types";
import { SubmitButton } from "./submit-button";
import { BookCover } from "./book-cover";

type Props = {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  categories: { id: number; name: string }[];
  book?: Book;
};

export function BookForm({ action, categories, book }: Props) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-4 rounded-lg border border-line bg-white p-6"
    >
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label className="label" htmlFor="title">
          Judul
        </label>
        <input
          id="title"
          name="title"
          defaultValue={book?.title}
          className="input"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="author">
            Penulis
          </label>
          <input
            id="author"
            name="author"
            defaultValue={book?.author}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="isbn">
            ISBN
          </label>
          <input
            id="isbn"
            name="isbn"
            defaultValue={book?.isbn}
            className="input"
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="categoryId">
            Kategori
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={book?.categoryId ?? ""}
            className="input"
          >
            <option value="">Tanpa kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="publishedYear">
            Tahun terbit
          </label>
          <input
            id="publishedYear"
            name="publishedYear"
            type="number"
            defaultValue={book?.publishedYear ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="totalCopies">
            Jumlah eksemplar
          </label>
          <input
            id="totalCopies"
            name="totalCopies"
            type="number"
            min={1}
            defaultValue={book?.totalCopies ?? 1}
            className="input"
            required
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="cover">
          Sampul buku
        </label>
        {book?.cover && (
          <div className="mb-2 flex items-center gap-3">
            <BookCover
              id={book.id}
              title={book.title}
              cover={book.cover}
              className="h-28 w-20"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeCover" /> Hapus sampul ini
            </label>
          </div>
        )}
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="input"
        />
        <p className="mt-1 text-xs text-muted">
          JPG, PNG, atau WebP, maksimal 2 MB. Kosongkan jika tidak ingin
          mengubah.
        </p>
      </div>
      <div>
        <label className="label" htmlFor="description">
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={book?.description ?? ""}
          className="input"
        />
      </div>

      <div className="flex gap-2">
        <SubmitButton>Simpan buku</SubmitButton>
        <Link href="/admin/books" className="btn-outline">
          Batal
        </Link>
      </div>
    </form>
  );
}
