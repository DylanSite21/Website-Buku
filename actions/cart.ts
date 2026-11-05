"use server";

import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { books, cartItems, carts, stocks, transactionItems, transactions } from "@/lib/db/schema";
import { requireUser } from "@/lib/dal";
import { addMoney, createReference, multiplyMoney } from "@/lib/utils";
import type { FormState } from "@/lib/types";

export async function addToCart(bookId: string, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "user") redirect("/admin");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) redirect("/books?error=quantity");

  const added = await db.transaction(async (tx) => {
    const [book] = await tx.select({ id: books.id, available: stocks.availableQuantity }).from(books)
      .innerJoin(stocks, eq(stocks.bookId, books.id))
      .where(and(eq(books.id, bookId), eq(books.status, "published"), sql`${stocks.availableQuantity} >= ${quantity}`))
      .for("update").limit(1);
    if (!book) return false;

    await tx.insert(carts).values({ id: randomUUID(), userId: user.id })
      .onDuplicateKeyUpdate({ set: { userId: user.id } });
    const [cart] = await tx.select().from(carts)
      .where(eq(carts.userId, user.id)).for("update").limit(1);
    if (!cart) return false;

    const [existing] = await tx.select().from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.bookId, bookId))).for("update").limit(1);
    if (existing) {
      if (existing.quantity + quantity > Math.min(book.available, 20)) return false;
      await tx.update(cartItems).set({ quantity: sql`${cartItems.quantity} + ${quantity}` })
        .where(eq(cartItems.id, existing.id));
    } else {
      await tx.insert(cartItems).values({ id: randomUUID(), cartId: cart.id, bookId, quantity });
    }
    return true;
  });

  if (!added) redirect("/books?error=unavailable");
  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateCartItem(itemId: string, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "user") redirect("/admin");
  const quantity = Number(formData.get("quantity"));
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) redirect("/cart?error=quantity");
  await db.update(cartItems).set({ quantity }).where(and(
    eq(cartItems.id, itemId),
    sql`${cartItems.cartId} IN (SELECT ${carts.id} FROM ${carts} WHERE ${carts.userId} = ${user.id})`,
  ));
  revalidatePath("/cart");
}

export async function removeCartItem(itemId: string) {
  const user = await requireUser();
  if (user.role !== "user") redirect("/admin");
  await db.delete(cartItems).where(and(
    eq(cartItems.id, itemId),
    sql`${cartItems.cartId} IN (SELECT ${carts.id} FROM ${carts} WHERE ${carts.userId} = ${user.id})`,
  ));
  revalidatePath("/cart");
}

export async function checkout(state: FormState, formData: FormData): Promise<FormState> {
  void state;
  void formData;
  const user = await requireUser();
  if (user.role !== "user") redirect("/admin");
  const result = await db.transaction(async (tx) => {
    const [cart] = await tx.select().from(carts).where(eq(carts.userId, user.id)).for("update").limit(1);
    if (!cart) return { error: "Keranjang Anda masih kosong." } as const;
    const cartRows = await tx.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).for("update");
    if (!cartRows.length) return { error: "Keranjang Anda masih kosong." } as const;

    const lines: {
      item: (typeof cartRows)[number];
      book: typeof books.$inferSelect;
      subtotal: string;
    }[] = [];
    for (const item of cartRows) {
      const [book] = await tx.select().from(books).where(eq(books.id, item.bookId)).for("update").limit(1);
      const [stock] = await tx.select().from(stocks).where(eq(stocks.bookId, item.bookId)).for("update").limit(1);
      if (!book || book.status !== "published" || !stock || stock.availableQuantity < item.quantity) {
        return { error: "Stok salah satu buku tidak mencukupi. Perbarui keranjang dan coba lagi." } as const;
      }
      try {
        lines.push({ item, book, subtotal: multiplyMoney(book.price, item.quantity) });
      } catch (error) {
        if (error instanceof RangeError) return { error: error.message } as const;
        throw error;
      }
    }

    const invoiceNumber = createReference("INV");
    let totalAmount: string;
    try {
      totalAmount = addMoney(lines.map((line) => line.subtotal));
    } catch (error) {
      if (error instanceof RangeError) return { error: error.message } as const;
      throw error;
    }
    const transactionId = randomUUID();
    await tx.insert(transactions).values({
      id: transactionId, userId: user.id, invoiceNumber, totalAmount,
      paymentMethod: "bank_transfer", status: "pending",
    });
    await tx.insert(transactionItems).values(lines.map(({ book, item, subtotal }) => ({
      id: randomUUID(), transactionId, bookId: book.id, bookTitle: book.title,
      price: book.price, quantity: item.quantity,
      subtotal,
    })));
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return { invoiceNumber } as const;
  });

  if ("error" in result) return result;
  revalidatePath("/cart");
  revalidatePath("/transactions");
  redirect(`/transactions/${result.invoiceNumber}`);
}
