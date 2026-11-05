import { db } from "@/lib/db";
import { stocks, stockMovements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class StockService {
  /**
   * Mengubah atau menyesuaikan stok dengan mencatat audit trail (Stock Movements)
   */
  static async adjustStock(params: {
    bookId: string;
    userId?: string;
    type:
      | "initial"
      | "restock"
      | "purchase"
      | "loan_reserved"
      | "loan_issued"
      | "loan_returned"
      | "loan_released"
      | "adjustment";
    quantityChange: number; // Positif untuk penambahan, negatif untuk pengurangan
    referenceNumber?: string;
    notes?: string;
  }) {
    return await db.transaction(async (tx) => {
      // Ambil data stok saat ini dengan row locking (jika didukung) atau fetch biasa
      const [currentStock] = await tx
        .select()
        .from(stocks)
        .where(eq(stocks.bookId, params.bookId))
        .limit(1);

      if (!currentStock) {
        throw new Error("Data stok untuk buku ini tidak ditemukan");
      }

      const beforeQty = currentStock.totalQuantity;
      const afterQty = beforeQty + params.quantityChange;

      if (afterQty < 0) {
        throw new Error("Stok tidak mencukupi untuk melakukan operasi ini");
      }

      // Update tabel stocks
      await tx
        .update(stocks)
        .set({
          totalQuantity: afterQty,
          availableQuantity:
            currentStock.availableQuantity + params.quantityChange,
          updatedAt: new Date(),
        })
        .where(eq(stocks.bookId, params.bookId));

      // Catat ke audit trail stock_movements
      await tx.insert(stockMovements).values({
        bookId: params.bookId,
        userId: params.userId || null,
        type: params.type,
        quantity: Math.abs(params.quantityChange),
        beforeQuantity: beforeQty,
        afterQuantity: afterQty,
        referenceNumber: params.referenceNumber || null,
        notes: params.notes || null,
      });

      return { beforeQty, afterQty };
    });
  }
}
