"use server";

import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { books, categories, users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/dal";
import { createSlug } from "@/lib/utils";
import { StockService } from "@/lib/services/stock.service";
import type { FormState } from "@/lib/types";

export async function saveCategory(
  categoryId: string | null,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (name.length < 2 || name.length > 255) return { error: "Nama kategori harus 2–255 karakter." };
  const slug = createSlug(name);
  const [duplicate] = await db.select({ id: categories.id }).from(categories)
    .where(categoryId
      ? and(eq(categories.slug, slug), ne(categories.id, categoryId))
      : eq(categories.slug, slug))
    .limit(1);
  if (duplicate) return { error: "Nama kategori sudah digunakan." };
  if (categoryId) {
    await db.update(categories).set({ name, slug, description: description || null })
      .where(eq(categories.id, categoryId));
  } else {
    await db.insert(categories).values({ id: randomUUID(), name, slug, description: description || null });
  }
  revalidatePath("/admin/categories");
  if (categoryId) revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/books");
  redirect(categoryId ? `/admin/categories/${categoryId}` : "/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const [inUse] = await db.select({ id: books.id }).from(books)
    .where(eq(books.categoryId, categoryId)).limit(1);
  if (inUse) redirect("/admin/categories?error=in-use");
  await db.delete(categories).where(eq(categories.id, categoryId));
  revalidatePath("/admin/categories");
  revalidatePath("/books");
  redirect("/admin/categories");
}

export async function changeStock(bookId: string, _: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const quantity = Number(formData.get("quantity"));
  const mode = String(formData.get("mode") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (mode !== "restock" && mode !== "adjustment") return { error: "Jenis perubahan stok tidak valid." };
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10000 || (mode === "restock" && quantity === 0)) {
    return { error: "Jumlah harus bilangan bulat antara 1 dan 10.000 (penyesuaian boleh 0)." };
  }
  if (notes.length > 1000) return { error: "Catatan maksimal 1.000 karakter." };

  try {
    await StockService.changeStock({
      bookId, userId: admin.id, mode, quantity, notes: notes || undefined,
    });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Stok fisik") || error.message.startsWith("Data stok"))) {
      return { error: error.message };
    }
    throw error;
  }
  revalidatePath("/admin/stocks");
  revalidatePath(`/admin/stocks/${bookId}`);
  revalidatePath("/books");
  return { success: "Stok berhasil diperbarui." };
}

export async function toggleUserStatus(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) redirect("/admin/users?error=self");
  const [target] = await db.select().from(users).where(and(eq(users.id, userId), ne(users.role, "admin"))).limit(1);
  if (target) {
    await db.update(users).set({ isActive: !target.isActive, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.role, "user")));
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
