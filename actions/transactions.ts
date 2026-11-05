"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { stockMovements, stocks, transactionItems, transactions } from "@/lib/db/schema";
import { requireAdmin, requireUser } from "@/lib/dal";
import { deletePaymentProof, saveImage } from "@/lib/uploads";
import type { FormState } from "@/lib/types";

export async function uploadPaymentProof(
  transactionId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "user") return { error: "Hanya akun user yang dapat mengunggah bukti pembayaran." };
  const [transaction] = await db.select().from(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, user.id))).limit(1);
  if (!transaction) return { error: "Transaksi tidak ditemukan." };
  if (!["pending", "rejected"].includes(transaction.status)) {
    return { error: "Bukti pembayaran tidak dapat diubah pada status transaksi ini." };
  }
  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file bukti pembayaran." };
  const stored = await saveImage(file, "payment-proofs");
  if ("error" in stored) return stored;

  let affectedRows: number;
  try {
    const updated = await db.update(transactions)
      .set({ paymentProof: stored.filename, status: "awaiting_verification", rejectionReason: null })
      .where(and(eq(transactions.id, transaction.id), eq(transactions.userId, user.id), eq(transactions.status, transaction.status)));
    affectedRows = updated[0].affectedRows;
  } catch (error) {
    await deletePaymentProof(stored.filename);
    throw error;
  }
  if (!affectedRows) {
    await deletePaymentProof(stored.filename);
    return { error: "Transaksi berubah saat bukti diunggah. Muat ulang halaman." };
  }
  if (transaction.paymentProof) await deletePaymentProof(transaction.paymentProof);
  revalidatePath(`/transactions/${transaction.invoiceNumber}`);
  revalidatePath("/transactions");
  revalidatePath("/admin/transactions");
  return { success: "Bukti pembayaran terkirim untuk diverifikasi." };
}

export async function verifyTransaction(
  transactionId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (decision !== "paid" && decision !== "rejected") return { error: "Keputusan verifikasi tidak valid." };
  if (decision === "rejected" && (!reason || reason.length > 1000)) {
    return { error: "Alasan penolakan wajib diisi (maksimal 1.000 karakter)." };
  }

  try {
    await db.transaction(async (tx) => {
      const [transaction] = await tx.select().from(transactions)
        .where(eq(transactions.id, transactionId)).for("update").limit(1);
      if (!transaction || transaction.status !== "awaiting_verification" || !transaction.paymentProof) {
        throw new Error("Transaksi tidak siap untuk diverifikasi.");
      }

      if (decision === "paid") {
        const items = await tx.select().from(transactionItems)
          .where(eq(transactionItems.transactionId, transactionId));
        for (const item of items) {
          const [stock] = await tx.select().from(stocks)
            .where(eq(stocks.bookId, item.bookId)).for("update").limit(1);
          if (!stock || stock.availableQuantity < item.quantity || stock.totalQuantity < item.quantity) {
            throw new Error(`Stok buku "${item.bookTitle}" tidak mencukupi. Pembayaran belum dapat disetujui.`);
          }
          await tx.update(stocks).set({
            totalQuantity: stock.totalQuantity - item.quantity,
            availableQuantity: stock.availableQuantity - item.quantity,
            updatedAt: new Date(),
          }).where(eq(stocks.id, stock.id));
          await tx.insert(stockMovements).values({
            bookId: item.bookId, userId: admin.id, type: "purchase", quantity: item.quantity,
            beforeQuantity: stock.totalQuantity, afterQuantity: stock.totalQuantity - item.quantity,
            referenceNumber: transaction.invoiceNumber, notes: "Stok dikurangi setelah pembayaran diverifikasi",
          });
        }
      }

      const now = new Date();
      await tx.update(transactions).set({
        status: decision,
        verifiedBy: admin.id,
        verifiedAt: now,
        paidAt: decision === "paid" ? now : null,
        rejectionReason: decision === "rejected" ? reason : null,
      }).where(and(eq(transactions.id, transactionId), eq(transactions.status, "awaiting_verification")));
    });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Transaksi") || error.message.startsWith("Stok"))) {
      return { error: error.message };
    }
    throw error;
  }
  revalidatePath("/admin/transactions");
  revalidatePath("/transactions");
  revalidatePath("/books");
  return { success: decision === "paid" ? "Pembayaran disetujui." : "Pembayaran ditolak." };
}
