"use server";

import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { books, loanItems, loans, stockMovements, stocks } from "@/lib/db/schema";
import { requireAdmin, requireUser } from "@/lib/dal";
import { createReference, LOAN_DAYS } from "@/lib/utils";
import type { FormState } from "@/lib/types";

export async function requestLoan(bookId: string, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "user") redirect("/admin");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) redirect("/books?error=quantity");

  const [book] = await db.select({ id: books.id }).from(books)
    .innerJoin(stocks, eq(stocks.bookId, books.id))
    .where(and(eq(books.id, bookId), eq(books.status, "published"), sql`${stocks.availableQuantity} >= ${quantity}`))
    .limit(1);
  if (!book) redirect("/books?error=unavailable");

  const loanId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(loans).values({
      id: loanId,
      userId: user.id,
      loanNumber: createReference("LOAN"),
      status: "pending",
      notes: `Pengajuan ${quantity} eksemplar`,
    });
    await tx.insert(loanItems).values({ id: randomUUID(), loanId, bookId, quantity });
  });
  revalidatePath("/loans");
  redirect("/loans");
}

export async function cancelLoan(loanId: string) {
  const user = await requireUser();
  if (user.role !== "user") redirect("/admin");
  const result = await db.update(loans).set({ status: "cancelled" })
    .where(and(eq(loans.id, loanId), eq(loans.userId, user.id), eq(loans.status, "pending")));
  if (result[0].affectedRows) revalidatePath("/loans");
}

export async function approveLoan(
  loanId: string,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  void state;
  void formData;
  const admin = await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      const [loan] = await tx.select().from(loans)
        .where(eq(loans.id, loanId)).for("update").limit(1);
      if (!loan || loan.status !== "pending") throw new Error("Pengajuan tidak lagi menunggu persetujuan.");
      const items = await tx.select().from(loanItems).where(eq(loanItems.loanId, loanId));
      for (const item of items) {
        const [book] = await tx.select({ status: books.status }).from(books)
          .where(eq(books.id, item.bookId)).for("update").limit(1);
        if (!book || book.status !== "published") throw new Error("Buku tidak lagi tersedia untuk dipinjam.");
        const [stock] = await tx.select().from(stocks)
          .where(eq(stocks.bookId, item.bookId)).for("update").limit(1);
        if (!stock || stock.availableQuantity < item.quantity) {
          throw new Error("Stok tidak mencukupi untuk menyetujui peminjaman.");
        }
        await tx.update(stocks).set({
          availableQuantity: stock.availableQuantity - item.quantity,
          reservedQuantity: stock.reservedQuantity + item.quantity,
          updatedAt: new Date(),
        }).where(eq(stocks.id, stock.id));
        await tx.insert(stockMovements).values({
          bookId: item.bookId, userId: admin.id, type: "loan_reserved",
          quantity: item.quantity, beforeQuantity: stock.totalQuantity,
          afterQuantity: stock.totalQuantity, referenceNumber: loan.loanNumber,
          notes: "Reservasi stok untuk pengajuan yang disetujui",
        });
      }
      await tx.update(loans).set({
        status: "approved", approvedBy: admin.id, approvedAt: new Date(),
      }).where(and(eq(loans.id, loanId), eq(loans.status, "pending")));
    });
  } catch (error) {
    if (error instanceof Error && (
      error.message.startsWith("Pengajuan") ||
      error.message.startsWith("Stok") ||
      error.message.startsWith("Buku")
    )) return { error: error.message };
    throw error;
  }
  revalidatePath("/admin/loans");
  revalidatePath("/loans");
  return { success: "Peminjaman disetujui." };
}

export async function rejectLoan(
  loanId: string,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  void state;
  const admin = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason || reason.length > 1000) {
    return { error: "Alasan penolakan wajib diisi (maksimal 1.000 karakter)." };
  }
  const result = await db.update(loans).set({
    status: "rejected", rejectionReason: reason,
    approvedBy: admin.id, approvedAt: new Date(),
  }).where(and(eq(loans.id, loanId), eq(loans.status, "pending")));
  if (!result[0].affectedRows) return { error: "Pengajuan tidak ditemukan atau sudah diproses." };
  revalidatePath("/admin/loans");
  revalidatePath("/loans");
  return { success: "Pengajuan ditolak." };
}

export async function issueLoan(
  loanId: string,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  void state;
  void formData;
  const admin = await requireAdmin();
  let issued: boolean;
  try {
    issued = await db.transaction(async (tx) => {
      const [loan] = await tx.select().from(loans)
        .where(eq(loans.id, loanId)).for("update").limit(1);
      if (!loan || loan.status !== "approved") return false;
      const items = await tx.select().from(loanItems).where(eq(loanItems.loanId, loanId));
      for (const item of items) {
        const [stock] = await tx.select().from(stocks)
          .where(eq(stocks.bookId, item.bookId)).for("update").limit(1);
        if (!stock || stock.reservedQuantity < item.quantity) throw new Error("Reservasi stok tidak valid.");
        await tx.update(stocks).set({
          reservedQuantity: stock.reservedQuantity - item.quantity,
          borrowedQuantity: stock.borrowedQuantity + item.quantity,
          updatedAt: new Date(),
        }).where(eq(stocks.id, stock.id));
        await tx.insert(stockMovements).values({
          bookId: item.bookId, userId: admin.id, type: "loan_issued",
          quantity: item.quantity, beforeQuantity: stock.totalQuantity,
          afterQuantity: stock.totalQuantity, referenceNumber: loan.loanNumber,
          notes: "Buku diserahkan kepada peminjam",
        });
      }
      const now = new Date();
      await tx.update(loans).set({
        status: "borrowed", borrowedAt: now, loanDate: now,
        dueDate: new Date(now.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000),
      }).where(and(eq(loans.id, loanId), eq(loans.status, "approved")));
      return true;
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Reservasi")) return { error: error.message };
    throw error;
  }
  if (!issued) return { error: "Pengajuan belum disetujui atau tidak ditemukan." };
  revalidatePath("/admin/loans");
  revalidatePath("/loans");
  return { success: "Pengambilan buku dicatat." };
}

export async function returnLoan(
  loanId: string,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  void state;
  void formData;
  const admin = await requireAdmin();
  let returned: boolean;
  try {
    returned = await db.transaction(async (tx) => {
      const [loan] = await tx.select().from(loans)
        .where(eq(loans.id, loanId)).for("update").limit(1);
      if (!loan || loan.status !== "borrowed") return false;
      const items = await tx.select().from(loanItems).where(eq(loanItems.loanId, loanId));
      for (const item of items) {
        const [stock] = await tx.select().from(stocks)
          .where(eq(stocks.bookId, item.bookId)).for("update").limit(1);
        if (!stock || stock.borrowedQuantity < item.quantity) {
          throw new Error("Jumlah stok pinjaman tidak valid.");
        }
        await tx.update(stocks).set({
          availableQuantity: stock.availableQuantity + item.quantity,
          borrowedQuantity: stock.borrowedQuantity - item.quantity,
          updatedAt: new Date(),
        }).where(eq(stocks.id, stock.id));
        await tx.insert(stockMovements).values({
          bookId: item.bookId, userId: admin.id, type: "loan_returned",
          quantity: item.quantity, beforeQuantity: stock.totalQuantity,
          afterQuantity: stock.totalQuantity, referenceNumber: loan.loanNumber,
          notes: "Buku dikembalikan",
        });
      }
      await tx.update(loans).set({ status: "returned", returnedAt: new Date() })
        .where(and(eq(loans.id, loanId), eq(loans.status, "borrowed")));
      return true;
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Jumlah stok")) return { error: error.message };
    throw error;
  }
  if (!returned) return { error: "Pinjaman belum diambil atau sudah dikembalikan." };
  revalidatePath("/admin/loans");
  revalidatePath("/loans");
  return { success: "Pengembalian buku dicatat." };
}
