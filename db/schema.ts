import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 80 }).notNull().unique(),
});

export const books = mysqlTable("books", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 200 }).notNull(),
  author: varchar("author", { length: 150 }).notNull(),
  isbn: varchar("isbn", { length: 20 }).notNull().unique(),
  categoryId: int("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  publishedYear: int("published_year"),
  description: text("description"),
  cover: varchar("cover", { length: 100 }),
  totalCopies: int("total_copies").notNull().default(1),
  availableCopies: int("available_copies").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loans = mysqlTable("loans", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: int("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "restrict" }),
  borrowedAt: datetime("borrowed_at").notNull().defaultNow(),
  dueDate: datetime("due_date").notNull(),
  returnedAt: datetime("returned_at"),
  status: mysqlEnum("status", ["borrowed", "returned"])
    .notNull()
    .default("borrowed"),
});

export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Loan = typeof loans.$inferSelect;
