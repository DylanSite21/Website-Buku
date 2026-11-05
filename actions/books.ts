"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { books, loans } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import type { FormState } from "@/lib/types";
import { deleteCover, saveCover } from "@/lib/uploads";

function parseBook(fd: FormData) {
  const title = String(fd.get("title") ?? "").trim();
  const author = String(fd.get("author") ?? "").trim();
  const isbn = String(fd.get("isbn") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim() || null;
  const categoryId = Number(fd.get("categoryId")) || null;
  const publishedYear = Number(fd.get("publishedYear")) || null;
  const totalCopies = Number(fd.get("totalCopies"));

  if (!title || !author || !isbn)
    return { error: "Judul, penulis, dan ISBN wajib diisi." };
  if (!Number.isInteger(totalCopies) || totalCopies < 1)
    return { error: "Jumlah eksemplar minimal 1." };

  return {
    data: {
      title,
      author,
      isbn,
      description,
      categoryId,
      publishedYear,
      totalCopies,
    },
  };
}

function getCoverFile(fd: FormData) {
  const file = fd.get("cover");
  return file instanceof File && file.size > 0 ? file : null;
}

export async function createBook(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseBook(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { data } = parsed;

  const dup = await db
    .select({ id: books.id })
    .from(books)
    .where(eq(books.isbn, data.isbn))
    .limit(1);
  if (dup.length) return { error: "ISBN sudah dipakai buku lain." };

  let cover: string | null = null;
  const file = getCoverFile(formData);
  if (file) {
    const saved = await saveCover(file);
    if ("error" in saved) return { error: saved.error };
    cover = saved.filename;
  }

  await db
    .insert(books)
    .values({ ...data, cover, availableCopies: data.totalCopies });

  revalidatePath("/");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

export async function updateBook(
  id: number,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseBook(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { data } = parsed;

  const dup = await db
    .select({ id: books.id })
    .from(books)
    .where(and(eq(books.isbn, data.isbn), ne(books.id, id)))
    .limit(1);
  if (dup.length) return { error: "ISBN sudah dipakai buku lain." };

  const [current] = await db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1);
  if (!current) return { error: "Buku tidak ditemukan." };

  const borrowed = current.totalCopies - current.availableCopies;
  if (data.totalCopies < borrowed) {
    return {
      error: `Saat ini ${borrowed} eksemplar sedang dipinjam. Jumlah tidak boleh lebih kecil.`,
    };
  }

  // cover: ganti dengan file baru, hapus, atau biarkan
  let coverUpdate: { cover?: string | null } = {};
  const file = getCoverFile(formData);
  if (file) {
    const saved = await saveCover(file);
    if ("error" in saved) return { error: saved.error };
    coverUpdate = { cover: saved.filename };
  } else if (formData.get("removeCover") === "on") {
    coverUpdate = { cover: null };
  }

  await db
    .update(books)
    .set({
      ...data,
      ...coverUpdate,
      availableCopies: data.totalCopies - borrowed,
    })
    .where(eq(books.id, id));

  if ("cover" in coverUpdate) await deleteCover(current.cover); // buang file lama

  revalidatePath("/");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

export async function deleteBook(id: number) {
  await requireAdmin();

  const [used] = await db
    .select({ n: count() })
    .from(loans)
    .where(eq(loans.bookId, id));
  if (used.n > 0) redirect("/admin/books?error=punya-riwayat");

  const [book] = await db
    .select({ cover: books.cover })
    .from(books)
    .where(eq(books.id, id))
    .limit(1);
  await db.delete(books).where(eq(books.id, id));
  await deleteCover(book?.cover ?? null);

  revalidatePath("/");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}
