"use server";

import { randomUUID } from "node:crypto";
import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { books, categories, loanItems, loans, stockMovements, stocks } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/dal";
import { createSlug } from "@/lib/utils";
import { deleteCover, saveImage } from "@/lib/uploads";
import { bookSchema } from "@/lib/validations/book";
import type { FormState } from "@/lib/types";

function parseBook(formData: FormData) {
  return bookSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    author: String(formData.get("author") ?? "").trim(),
    publisher: String(formData.get("publisher") ?? "").trim(),
    publicationYear: Number(formData.get("publicationYear")),
    isbn: String(formData.get("isbn") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    totalStock: Number(formData.get("totalStock")),
    description: String(formData.get("description") ?? "").trim(),
    status: String(formData.get("status") ?? "published"),
  });
}

async function getCover(formData: FormData) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { filename: null };
  return saveImage(file, "covers");
}

export async function createBook(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = parseBook(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data buku tidak valid." };
  const data = parsed.data;
  const slug = createSlug(data.title);
  if (!slug) return { error: "Judul buku tidak valid." };
  const [duplicate] = await db.select({ id: books.id }).from(books).where(eq(books.slug, slug)).limit(1);
  if (duplicate) return { error: "Judul menghasilkan slug yang sudah digunakan." };
  if (data.isbn) {
    const [existingIsbn] = await db.select({ id: books.id }).from(books).where(eq(books.isbn, data.isbn)).limit(1);
    if (existingIsbn) return { error: "ISBN sudah digunakan buku lain." };
  }
  const [category] = await db.select({ id: categories.id }).from(categories)
    .where(eq(categories.id, data.categoryId)).limit(1);
  if (!category) return { error: "Kategori tidak ditemukan." };
  const cover = await getCover(formData);
  if ("error" in cover) return cover;

  const bookId = randomUUID();
  try {
    await db.transaction(async (tx) => {
      await tx.insert(books).values({
        id: bookId, categoryId: data.categoryId, title: data.title, slug,
        isbn: data.isbn || null, author: data.author, publisher: data.publisher,
        publicationYear: data.publicationYear, description: data.description || null,
        image: cover.filename, price: data.price, status: data.status,
      });
      await tx.insert(stocks).values({
        id: randomUUID(), bookId, totalQuantity: data.totalStock,
        availableQuantity: data.totalStock, reservedQuantity: 0, borrowedQuantity: 0,
      });
      await tx.insert(stockMovements).values({
        bookId, userId: admin.id, type: "initial", quantity: data.totalStock,
        beforeQuantity: 0, afterQuantity: data.totalStock, notes: "Stok awal buku",
      });
    });
  } catch (error) {
    if (cover.filename) await deleteCover(cover.filename);
    throw error;
  }
  revalidatePath("/books");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

export async function updateBook(bookId: string, _: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = parseBook(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data buku tidak valid." };
  const data = parsed.data;
  const slug = createSlug(data.title);
  const [duplicate] = await db.select({ id: books.id }).from(books)
    .where(and(eq(books.slug, slug), ne(books.id, bookId))).limit(1);
  if (duplicate) return { error: "Judul menghasilkan slug yang sudah digunakan." };
  if (data.isbn) {
    const [existingIsbn] = await db.select({ id: books.id }).from(books)
      .where(and(eq(books.isbn, data.isbn), ne(books.id, bookId))).limit(1);
    if (existingIsbn) return { error: "ISBN sudah digunakan buku lain." };
  }
  const [current] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
  if (!current) return { error: "Buku tidak ditemukan." };
  const [category] = await db.select({ id: categories.id }).from(categories)
    .where(eq(categories.id, data.categoryId)).limit(1);
  if (!category) return { error: "Kategori tidak ditemukan." };

  const cover = await getCover(formData);
  if ("error" in cover) return cover;
  const image = cover.filename ?? (formData.get("removeImage") === "on" ? null : current.image);
  if (data.status === "archived") {
    const [activeLoan] = await db.select({ id: loans.id }).from(loans)
      .innerJoin(loanItems, eq(loanItems.loanId, loans.id))
      .where(and(eq(loanItems.bookId, bookId), inArray(loans.status, ["pending", "approved", "borrowed"])))
      .limit(1);
    if (activeLoan) {
      if (cover.filename) await deleteCover(cover.filename);
      return { error: "Buku dengan peminjaman aktif tidak dapat diarsipkan." };
    }
  }
  let stockError: string | null = null;
  try {
    await db.transaction(async (tx) => {
      const [currentStock] = await tx.select().from(stocks)
        .where(eq(stocks.bookId, bookId)).for("update").limit(1);
      if (!currentStock) throw new Error("Data stok tidak ditemukan.");
      const committed = currentStock.reservedQuantity + currentStock.borrowedQuantity;
      if (data.totalStock < committed) {
        throw new Error(`Jumlah stok minimal ${committed} karena ada buku yang dipinjam atau direservasi.`);
      }

      await tx.update(books).set({
        categoryId: data.categoryId, title: data.title, slug, isbn: data.isbn || null,
        author: data.author, publisher: data.publisher, publicationYear: data.publicationYear,
        description: data.description || null, price: data.price, status: data.status, image,
      }).where(eq(books.id, bookId));
      await tx.update(stocks).set({
        totalQuantity: data.totalStock,
        availableQuantity: data.totalStock - committed,
        updatedAt: new Date(),
      }).where(eq(stocks.bookId, bookId));
      if (data.totalStock !== currentStock.totalQuantity) {
        await tx.insert(stockMovements).values({
          bookId, userId: admin.id, type: "adjustment",
          quantity: Math.abs(data.totalStock - currentStock.totalQuantity),
          beforeQuantity: currentStock.totalQuantity, afterQuantity: data.totalStock,
          notes: "Penyesuaian stok melalui perubahan data buku",
        });
      }
    });
  } catch (error) {
    if (cover.filename) await deleteCover(cover.filename);
    if (error instanceof Error && (error.message.startsWith("Jumlah stok") || error.message.startsWith("Data stok"))) {
      stockError = error.message;
    } else {
      throw error;
    }
  }
  if (stockError) return { error: stockError };
  if ((cover.filename || !image) && current.image) await deleteCover(current.image);
  revalidatePath("/books");
  revalidatePath(`/books/${current.slug}`);
  revalidatePath(`/books/${slug}`);
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

export async function archiveBook(bookId: string) {
  await requireAdmin();
  const [active] = await db.select({ id: loans.id }).from(loans)
    .innerJoin(loanItems, eq(loanItems.loanId, loans.id))
    .where(and(eq(loanItems.bookId, bookId), inArray(loans.status, ["pending", "approved", "borrowed"])))
    .limit(1);
  if (active) redirect("/admin/books?error=active-loan");
  await db.update(books).set({ status: "archived" }).where(eq(books.id, bookId));
  revalidatePath("/books");
  revalidatePath("/admin/books");
  redirect("/admin/books");
}
