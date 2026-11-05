import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { books, categories, stockMovements, stocks, users } from "./schema";

const sampleCategories = [
  { name: "Fiksi", slug: "fiksi" },
  { name: "Teknologi", slug: "teknologi" },
  { name: "Sejarah", slug: "sejarah" },
  { name: "Pengembangan Diri", slug: "pengembangan-diri" },
];

const sampleBooks = [
  { title: "Laskar Pelangi", slug: "laskar-pelangi", author: "Andrea Hirata", publisher: "Bentang Pustaka", isbn: "9789793062792", category: "Fiksi", year: 2005, price: "85000.00", description: "Kisah sepuluh anak di Belitung yang berjuang untuk sekolah.", quantity: 3 },
  { title: "Bumi Manusia", slug: "bumi-manusia", author: "Pramoedya Ananta Toer", publisher: "Lentera Dipantara", isbn: "9789799731234", category: "Sejarah", year: 1980, price: "95000.00", description: "Novel pertama Tetralogi Buru.", quantity: 2 },
  { title: "Clean Code", slug: "clean-code", author: "Robert C. Martin", publisher: "Prentice Hall", isbn: "9780132350884", category: "Teknologi", year: 2008, price: "250000.00", description: "Panduan menulis kode yang mudah dibaca dan dirawat.", quantity: 2 },
  { title: "Atomic Habits", slug: "atomic-habits", author: "James Clear", publisher: "Penguin Random House", isbn: "9780735211292", category: "Pengembangan Diri", year: 2018, price: "125000.00", description: "Panduan praktis membangun kebiasaan yang lebih baik.", quantity: 4 },
];

const demoAccounts = [
  {
    name: "Administrator Demo",
    email: "admin@bukuruang.test",
    password: "Admin123!Demo",
    role: "admin" as const,
  },
  {
    name: "Pengguna Demo",
    email: "user@bukuruang.test",
    password: "User123!Demo",
    role: "user" as const,
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeder demo hanya boleh dijalankan di environment non-production.");
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diatur.");
  const connection = await mysql.createConnection(url);
  const db = drizzle({ client: connection });

  try {
    for (const category of sampleCategories) {
      const [existing] = await db.select({ id: categories.id }).from(categories)
        .where(eq(categories.slug, category.slug)).limit(1);
      if (!existing) await db.insert(categories).values({ id: randomUUID(), ...category });
    }

    const categoryRows = await db.select().from(categories);
    const categoryId = new Map(categoryRows.map((category) => [category.name, category.id]));
    for (const item of sampleBooks) {
      const [existing] = await db.select({ id: books.id }).from(books)
        .where(eq(books.slug, item.slug)).limit(1);
      if (existing) continue;
      const categoryIdValue = categoryId.get(item.category);
      if (!categoryIdValue) throw new Error(`Kategori ${item.category} tidak ditemukan.`);

      const bookId = randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(books).values({
          id: bookId, categoryId: categoryIdValue, title: item.title,
          slug: item.slug, author: item.author, publisher: item.publisher,
          isbn: item.isbn, publicationYear: item.year, price: item.price,
          description: item.description, status: "published",
        });
        await tx.insert(stocks).values({
          id: randomUUID(), bookId, totalQuantity: item.quantity,
          availableQuantity: item.quantity, reservedQuantity: 0, borrowedQuantity: 0,
        });
        await tx.insert(stockMovements).values({
          bookId, type: "initial", quantity: item.quantity, beforeQuantity: 0,
          afterQuantity: item.quantity, notes: "Stok awal dari data contoh",
        });
      });
    }

    for (const account of demoAccounts) {
      const [existingAccount] = await db.select({
        id: users.id,
        role: users.role,
        password: users.password,
        isActive: users.isActive,
      }).from(users)
        .where(eq(users.email, account.email)).limit(1);
      if (existingAccount) {
        if (existingAccount.role !== account.role) {
          throw new Error(`Email demo ${account.email} sudah digunakan untuk role lain.`);
        }
        if (!existingAccount.isActive || !(await bcrypt.compare(account.password, existingAccount.password))) {
          throw new Error(`Akun demo ${account.email} sudah ada tetapi kredensialnya tidak cocok atau akun nonaktif; data tidak diubah.`);
        }
        continue;
      }

      await db.insert(users).values({
        id: randomUUID(),
        name: account.name,
        email: account.email,
        password: await bcrypt.hash(account.password, 12),
        role: account.role,
      });
    }
    console.log("Seed selesai. Katalog dan akun demo siap; data yang sudah ada tidak dihapus atau ditimpa.");
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error("Seed gagal:", error);
  process.exitCode = 1;
});
