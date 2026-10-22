import "dotenv/config";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { books, categories, loans, users } from "./schema";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle({ client: connection });

  // hapus sesuai urutan foreign key
  await db.delete(loans);
  await db.delete(books);
  await db.delete(categories);
  await db.delete(users);

  await db.insert(users).values([
    {
      name: "Admin Perpustakaan",
      email: "admin@perpus.test",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "admin",
    },
    {
      name: "Budi Santoso",
      email: "budi@perpus.test",
      passwordHash: await bcrypt.hash("user123", 10),
      role: "user",
    },
  ]);

  await db
    .insert(categories)
    .values([
      { name: "Fiksi" },
      { name: "Teknologi" },
      { name: "Sejarah" },
      { name: "Pengembangan Diri" },
    ]);

  const cats = await db.select().from(categories);
  const cat = (name: string) => cats.find((c) => c.name === name)!.id;

  await db.insert(books).values([
    {
      title: "Laskar Pelangi",
      author: "Andrea Hirata",
      isbn: "9789793062792",
      categoryId: cat("Fiksi"),
      publishedYear: 2005,
      totalCopies: 3,
      availableCopies: 3,
      description:
        "Kisah sepuluh anak di Belitung yang berjuang untuk sekolah.",
    },
    {
      title: "Bumi Manusia",
      author: "Pramoedya Ananta Toer",
      isbn: "9789799731234",
      categoryId: cat("Sejarah"),
      publishedYear: 1980,
      totalCopies: 2,
      availableCopies: 2,
      description: "Novel pertama Tetralogi Buru.",
    },
    {
      title: "Pulang",
      author: "Tere Liye",
      isbn: "9786020322032",
      categoryId: cat("Fiksi"),
      publishedYear: 2015,
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      categoryId: cat("Teknologi"),
      publishedYear: 2008,
      totalCopies: 2,
      availableCopies: 2,
      description: "Panduan menulis kode yang mudah dibaca dan dirawat.",
    },
    {
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt, David Thomas",
      isbn: "9780135957059",
      categoryId: cat("Teknologi"),
      publishedYear: 2019,
      totalCopies: 1,
      availableCopies: 1,
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "9780735211292",
      categoryId: cat("Pengembangan Diri"),
      publishedYear: 2018,
      totalCopies: 4,
      availableCopies: 4,
    },
    {
      title: "Filosofi Teras",
      author: "Henry Manampiring",
      isbn: "9786024125189",
      categoryId: cat("Pengembangan Diri"),
      publishedYear: 2018,
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: "Sapiens",
      author: "Yuval Noah Harari",
      isbn: "9786024246945",
      categoryId: cat("Sejarah"),
      publishedYear: 2011,
      totalCopies: 2,
      availableCopies: 2,
    },
  ]);

  console.log("Seed selesai.");
  await connection.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
