import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL belum diisi. Pastikan ada di file .env.");
}

const globalForDb = globalThis as unknown as { pool?: mysql.Pool };
const pool = globalForDb.pool ?? mysql.createPool(url);
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

// Workaround: drizzle RC membaca pool.config, tapi PromisePool tidak
// mengeksposnya. Arahkan ke config koneksi milik pool aslinya.
const raw = pool as any;
if (!raw.config) {
  Object.defineProperty(raw, "config", {
    value: raw.pool.config.connectionConfig,
    configurable: true,
  });
}

export const db = drizzle({ client: pool });
