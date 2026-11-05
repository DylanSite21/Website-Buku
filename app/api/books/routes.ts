import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, stocks } from "@/lib/db/schema";
import { bookSchema } from "@/lib/validations/book";
import { eq } from "drizzle-orm";

// GET: Ambil semua buku published
export async function GET(request: Request) {
  try {
    const allBooks = await db.query.books.findMany({
      with: {
        category: true,
        stock: true,
      },
      where: eq(books.status, "published"),
    });

    return NextResponse.json(
      { success: true, data: allBooks },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data buku",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST: Membuat buku baru beserta stok awal (Admin Only)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi input menggunakan Zod
    const validationResult = bookSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          error: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Transaksi database atomik untuk Buku & Stok
    const result = await db.transaction(async (tx) => {
      const [insertedBook] = await tx
        .insert(books)
        .values({
          title: data.title,
          slug,
          categoryId: data.categoryId,
          author: data.author,
          publisher: data.publisher,
          publicationYear: data.publicationYear,
          isbn: data.isbn || null,
          price: data.price,
          description: data.description || null,
          image: data.image || null,
          status: data.status,
        })
        .$returningId();

      await tx.insert(stocks).values({
        bookId: insertedBook.id,
        totalQuantity: data.totalStock,
        availableQuantity: data.totalStock,
        reservedQuantity: 0,
        borrowedQuantity: 0,
      });

      return insertedBook;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Buku dan stok berhasil ditambahkan",
        data: result,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
