import mysql from "mysql2/promise";
import { spawnSync } from "child_process";
import "dotenv/config";

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL tidak ditemukan!");
  }

  const connection = await mysql.createConnection(
    process.env.DATABASE_URL
  );

  try {
    console.log("🗑️  Menghapus seluruh tabel...");

    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    const [rows] = await connection.query(
      `SELECT TABLE_NAME
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()`
    );

    for (const row of rows as { TABLE_NAME: string }[]) {
      await connection.query(
        `DROP TABLE IF EXISTS \`${row.TABLE_NAME}\``
      );
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Seluruh tabel berhasil dihapus.");
  } finally {
    await connection.end();
  }

  console.log("🔄 Menjalankan migration...");

//   const migration = spawnSync(
//     "npx",
//     ["drizzle-kit", "migrate"],
//     { stdio: "inherit", shell: false }
//   );

//   if (migration.status !== 0) {
//     throw new Error("Migration gagal!");
//   }

//   console.log("🌱 Menjalankan seeder...");

//   const seed = spawnSync(
//     "npx",
//     ["tsx", "src/db/seed.ts"],
//     { stdio: "inherit", shell: false }
//   );

//   if (seed.status !== 0) {
//     throw new Error("Seeder gagal!");
//   }

  console.log("🎉 Database berhasil di-reset!");
}

resetDatabase().catch((error) => {
  console.error("❌ Reset database gagal:", error);
  process.exit(1);
});