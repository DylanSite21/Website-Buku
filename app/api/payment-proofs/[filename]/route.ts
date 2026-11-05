import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { transactions } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { filename } = await params;
  if (!/^[0-9a-f-]+\.(jpg|png|webp)$/i.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [transaction] = await db.select({ id: transactions.id, userId: transactions.userId }).from(transactions)
    .where(eq(transactions.paymentProof, filename)).limit(1);
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && transaction.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const bytes = await readFile(path.join(process.cwd(), "uploads", "payment-proofs", filename));
    const contentType = filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw error;
  }
}
