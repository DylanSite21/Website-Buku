import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stockMovements, stocks } from "@/lib/db/schema";

type StockChange = {
  bookId: string;
  userId?: string;
  mode: "restock" | "adjustment";
  quantity: number;
  notes?: string;
};

export class StockService {
  static async changeStock(params: StockChange) {
    if (
      !Number.isInteger(params.quantity) ||
      params.quantity < 0 ||
      (params.mode === "restock" && params.quantity === 0)
    ) {
      throw new Error("Jumlah stok tidak valid.");
    }

    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(stocks)
        .where(eq(stocks.bookId, params.bookId)).for("update").limit(1);
      if (!current) throw new Error("Data stok untuk buku ini tidak ditemukan.");

      const committed = current.reservedQuantity + current.borrowedQuantity;
      const totalQuantity = params.mode === "restock"
        ? current.totalQuantity + params.quantity
        : params.quantity;
      if (totalQuantity < committed) {
        throw new Error(`Stok fisik tidak boleh kurang dari ${committed} eksemplar yang dipinjam atau direservasi.`);
      }

      await tx.update(stocks).set({
        totalQuantity,
        availableQuantity: totalQuantity - committed,
        updatedAt: new Date(),
      }).where(eq(stocks.id, current.id));
      await tx.insert(stockMovements).values({
        bookId: params.bookId,
        userId: params.userId ?? null,
        type: params.mode,
        quantity: Math.abs(totalQuantity - current.totalQuantity),
        beforeQuantity: current.totalQuantity,
        afterQuantity: totalQuantity,
        notes: params.notes ?? null,
      });

      return { beforeQuantity: current.totalQuantity, afterQuantity: totalQuantity };
    });
  }
}
