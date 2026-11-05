"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { books, loans } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { LOAN_DAYS } from "@/lib/utils";

export async function borrowBook(bookId: number) {
  const user = await requireUser();
  if (user.role !== "user") redirect("/?error=hanya-anggota");

  const active = await db
    .select({ id: loans.id })
    .from(loans)
    .where(
      and(
        eq(loans.userId, user.id),
        eq(loans.bookId, bookId),
        eq(loans.status, "borrowed"),
      ),
    )
    .limit(1);
  if (active.length) redirect("/?error=sudah-dipinjam");

  const ok = await db.transaction(async (tx) => {
    // kurangi stok hanya jika masih tersedia (aman dari race condition)
    const [res] = await tx
      .update(books)
      .set({ availableCopies: sql`${books.availableCopies} - 1` })
      .where(and(eq(books.id, bookId), gt(books.availableCopies, 0)));
    if (res.affectedRows === 0) return false;

    await tx.insert(loans).values({
      userId: user.id,
      bookId,
      dueDate: new Date(Date.now() + LOAN_DAYS * 24 * 60 * 60 * 1000),
    });
    return true;
  });

  if (!ok) redirect("/?error=stok-habis");

  revalidatePath("/");
  revalidatePath("/loans");
  redirect("/loans");
}

export async function returnBook(loanId: number) {
  const user = await requireUser();

  const [loan] = await db
    .select()
    .from(loans)
    .where(eq(loans.id, loanId))
    .limit(1);
  if (!loan || loan.status === "returned") return;
  if (user.role !== "admin" && loan.userId !== user.id) return;

  await db.transaction(async (tx) => {
    await tx
      .update(loans)
      .set({ status: "returned", returnedAt: new Date() })
      .where(eq(loans.id, loanId));
    await tx
      .update(books)
      .set({ availableCopies: sql`${books.availableCopies} + 1` })
      .where(eq(books.id, loan.bookId));
  });

  revalidatePath("/");
  revalidatePath("/loans");
  revalidatePath("/admin");
}
