import { randomUUID } from "node:crypto";
import { and, eq, like, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { books, categories, stockMovements, stocks } from "@/lib/db/schema";
import { createSlug } from "@/lib/utils";
import { bookSchema } from "@/lib/validations/book";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("category");
  const conditions = [eq(books.status, "published")];
  if (query) conditions.push(or(
    like(books.title, `%${query}%`),
    like(books.author, `%${query}%`),
    like(books.isbn, `%${query}%`),
  )!);
  if (categoryId) conditions.push(eq(books.categoryId, categoryId));

  const data = await db.select({
    id: books.id, title: books.title, slug: books.slug, author: books.author,
    publisher: books.publisher, publicationYear: books.publicationYear,
    isbn: books.isbn, description: books.description, image: books.image,
    price: books.price, category: categories.name,
    totalQuantity: stocks.totalQuantity, availableQuantity: stocks.availableQuantity,
  }).from(books)
    .leftJoin(categories, eq(categories.id, books.categoryId))
    .leftJoin(stocks, eq(stocks.bookId, books.id))
    .where(and(...conditions))
    .orderBy(books.title);

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const slug = createSlug(data.title);
  const [duplicateSlug] = await db.select({ id: books.id }).from(books).where(eq(books.slug, slug)).limit(1);
  if (duplicateSlug) return NextResponse.json({ success: false, error: "Book title is already in use." }, { status: 409 });
  if (data.isbn) {
    const [duplicateIsbn] = await db.select({ id: books.id }).from(books).where(eq(books.isbn, data.isbn)).limit(1);
    if (duplicateIsbn) return NextResponse.json({ success: false, error: "ISBN is already in use." }, { status: 409 });
  }
  const [category] = await db.select({ id: categories.id }).from(categories)
    .where(eq(categories.id, data.categoryId)).limit(1);
  if (!category) return NextResponse.json({ success: false, error: "Category does not exist." }, { status: 400 });

  const bookId = randomUUID();
  try {
    await db.transaction(async (tx) => {
      await tx.insert(books).values({
        id: bookId, categoryId: data.categoryId, title: data.title, slug,
        isbn: data.isbn || null, author: data.author, publisher: data.publisher,
        publicationYear: data.publicationYear, description: data.description || null,
        image: data.image || null, price: data.price, status: data.status,
      });
      await tx.insert(stocks).values({
        id: randomUUID(), bookId, totalQuantity: data.totalStock,
        availableQuantity: data.totalStock, reservedQuantity: 0, borrowedQuantity: 0,
      });
      await tx.insert(stockMovements).values({
        bookId, userId: user.id, type: "initial", quantity: data.totalStock,
        beforeQuantity: 0, afterQuantity: data.totalStock, notes: "Stok awal buku",
      });
    });
  } catch (error) {
    console.error("Failed to create a book through the API.", error);
    return NextResponse.json({ success: false, error: "Could not create book." }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { id: bookId, slug } }, { status: 201 });
}
