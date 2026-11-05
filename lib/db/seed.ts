import "dotenv/config";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  categories,
  books,
  stocks,
  loans,
  loanItems,
  carts,
  cartItems,
  transactions,
  transactionItems,
  stockMovements,
} from "./schema";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle({ client: connection });

  console.log("Menghapus data lama...");
  // Hapus data berurutan dari tabel anak ke tabel induk (menghindari foreign key constraint error)
  await db.delete(stockMovements);
  await db.delete(transactionItems);
  await db.delete(transactions);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(loanItems);
  await db.delete(loans);
  await db.delete(stocks);
  await db.delete(books);
  await db.delete(categories);
  await db.delete(users);

  console.log("Memasukkan data users...");
  await db.insert(users).values([
    {
      name: "Admin Perpustakaan",
      email: "admin@perpus.test",
      password: await bcrypt.hash("admin123", 10), // Sesuai kolom "password" di schema
      role: "admin",
    },
    {
      name: "Budi Santoso",
      email: "budi@perpus.test",
      password: await bcrypt.hash("user123", 10), // Sesuai kolom "password" di schema
      role: "user",
    },
  ]);

  console.log("Memasukkan data categories...");
  await db.insert(categories).values([
    { name: "Fiksi", slug: "fiksi" },
    { name: "Teknologi", slug: "teknologi" },
    { name: "Sejarah", slug: "sejarah" },
    { name: "Pengembangan Diri", slug: "pengembangan-diri" },
  ]);

  const cats = await db.select().from(categories);
  const cat = (name: string) => cats.find((c) => c.name === name)!.id;

  console.log("Memasukkan data books & stocks...");
  // Daftar buku beserta jumlah stok awalnya
  const bookData = [
    {
      title: "Laskar Pelangi",
      slug: "laskar-pelangi",
      author: "Andrea Hirata",
      publisher: "Bentang Pustaka",
      isbn: "9789793062792",
      categoryId: cat("Fiksi"),
      publicationYear: 2005,
      price: "85000.00",
      description:
        "Kisah sepuluh anak di Belitung yang berjuang untuk sekolah.",
      totalStock: 3,
    },
    {
      title: "Bumi Manusia",
      slug: "bumi-manusia",
      author: "Pramoedya Ananta Toer",
      publisher: "Lentera Dipantara",
      isbn: "9789799731234",
      categoryId: cat("Sejarah"),
      publicationYear: 1980,
      price: "95000.00",
      description: "Novel pertama Tetralogi Buru.",
      totalStock: 2,
    },
    {
      title: "Pulang",
      slug: "pulang",
      author: "Tere Liye",
      publisher: "Republika Penerbit",
      isbn: "9786020322032",
      categoryId: cat("Fiksi"),
      publicationYear: 2015,
      price: "79000.00",
      totalStock: 2,
    },
    {
      title: "Clean Code",
      slug: "clean-code",
      author: "Robert C. Martin",
      publisher: "Prentice Hall",
      isbn: "9780132350884",
      categoryId: cat("Teknologi"),
      publicationYear: 2008,
      price: "250000.00",
      description: "Panduan menulis kode yang mudah dibaca dan dirawat.",
      totalStock: 2,
    },
    {
      title: "The Pragmatic Programmer",
      slug: "the-pragmatic-programmer",
      author: "Andrew Hunt, David Thomas",
      publisher: "Addison-Wesley Professional",
      isbn: "9780135957059",
      categoryId: cat("Teknologi"),
      publicationYear: 2019,
      price: "300000.00",
      totalStock: 1,
    },
    {
      title: "Atomic Habits",
      slug: "atomic-habits",
      author: "James Clear",
      publisher: "Penguin Random House",
      isbn: "9780735211292",
      categoryId: cat("Pengembangan Diri"),
      publicationYear: 2018,
      price: "125000.00",
      totalStock: 4,
    },
    {
      title: "Filosofi Teras",
      slug: "filosofi-teras",
      author: "Henry Manampiring",
      publisher: "Kompas",
      isbn: "9786024125189",
      categoryId: cat("Pengembangan Diri"),
      publicationYear: 2018,
      price: "98000.00",
      totalStock: 3,
    },
    {
      title: "Sapiens",
      slug: "sapiens",
      author: "Yuval Noah Harari",
      publisher: "KPG",
      isbn: "9786024246945",
      categoryId: cat("Sejarah"),
      publicationYear: 2011,
      price: "145000.00",
      totalStock: 2,
    },
  ];

  // Masukkan buku satu per satu untuk mendapatkan ID-nya, lalu buat stok dan stock_movement-nya
  for (const item of bookData) {
    const [insertedBook] = await db
      .insert(books)
      .values({
        title: item.title,
        slug: item.slug,
        author: item.author,
        publisher: item.publisher,
        isbn: item.isbn,
        categoryId: item.categoryId,
        publicationYear: item.publicationYear,
        price: item.price,
        description: item.description ?? null,
        status: "published",
      })
      .$returningId();

    // Buat data stok di tabel stocks (karena relasi buku -> stok terpisah)
    await db.insert(stocks).values({
      bookId: insertedBook.id,
      totalQuantity: item.totalStock,
      availableQuantity: item.totalStock, // Stok awal semuanya available
      reservedQuantity: 0,
      borrowedQuantity: 0,
    });

    // Catat audit stok awal ke stock_movements
    await db.insert(stockMovements).values({
      bookId: insertedBook.id,
      type: "initial",
      quantity: item.totalStock,
      beforeQuantity: 0,
      afterQuantity: item.totalStock,
      notes: "Stok awal saat seeding database",
    });
  }

  console.log("Seed selesai dengan sukses!");
  await connection.end();
}

main().catch((e) => {
  console.error("Terjadi kesalahan saat seeding:", e);
  process.exit(1);
});
