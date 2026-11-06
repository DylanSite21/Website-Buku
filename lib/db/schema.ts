import {
  mysqlTable,
  varchar,
  text,
  decimal,
  int,
  boolean,
  timestamp,
  datetime,
  uniqueIndex,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { defineRelations } from "drizzle-orm";

// ==========================================
// 1. DEFINISI ENUM
// ==========================================
export const userRoleEnum = mysqlEnum("user_role", ["user", "admin"]);
export const bookStatusEnum = mysqlEnum("book_status", [
  "draft",
  "published",
  "archived",
]);
export const loanStatusEnum = mysqlEnum("loan_status", [
  "pending",
  "approved",
  "rejected",
  "borrowed",
  "returned",
  "overdue",
  "cancelled",
]);
export const paymentMethodEnum = mysqlEnum("payment_method", [
  "bank_transfer",
  "cash",
]);
export const transactionStatusEnum = mysqlEnum("transaction_status", [
  "pending",
  "awaiting_verification",
  "paid",
  "rejected",
  "cancelled",
  "refunded",
]);
export const stockMovementTypeEnum = mysqlEnum("stock_movement_type", [
  "initial",
  "restock",
  "purchase",
  "loan_reserved",
  "loan_issued",
  "loan_returned",
  "loan_released",
  "adjustment",
]);
export const contactMessageStatusEnum = mysqlEnum("contact_message_status", [
  "unread",
  "read",
]);

// ==========================================
// 2. TABEL DATABASE (MYSQL)
// ==========================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum.default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const contactMessages = mysqlTable("contact_messages", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: contactMessageStatusEnum.default("unread").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: datetime("read_at"),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
});

export const books = mysqlTable("books", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isbn: varchar("isbn", { length: 20 }).unique(),
  author: varchar("author", { length: 255 }).notNull(),
  publisher: varchar("publisher", { length: 255 }).notNull(),
  publicationYear: int("publication_year").notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: bookStatusEnum.default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const stocks = mysqlTable("stocks", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookId: varchar("book_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => books.id, { onDelete: "restrict" }),
  totalQuantity: int("total_quantity").default(0).notNull(),
  availableQuantity: int("available_quantity").default(0).notNull(),
  reservedQuantity: int("reserved_quantity").default(0).notNull(),
  borrowedQuantity: int("borrowed_quantity").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const carts = mysqlTable("carts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cartId: varchar("cart_id", { length: 36 })
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    bookId: varchar("book_id", { length: 36 })
      .notNull()
      .references(() => books.id, { onDelete: "restrict" }),
    quantity: int("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    cartBookUnique: uniqueIndex("cart_book_unique").on(
      table.cartId,
      table.bookId,
    ),
  }),
);

export const loans = mysqlTable("loans", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  loanNumber: varchar("loan_number", { length: 100 }).notNull().unique(),
  status: loanStatusEnum.default("pending").notNull(),
  loanDate: datetime("loan_date"),
  dueDate: datetime("due_date"),
  approvedBy: varchar("approved_by", { length: 36 })
    .references(() => users.id, { onDelete: "set null" }),
  approvedAt: datetime("approved_at"),
  borrowedAt: datetime("borrowed_at"),
  returnedAt: datetime("returned_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const loanItems = mysqlTable("loan_items", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  loanId: varchar("loan_id", { length: 36 })
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  bookId: varchar("book_id", { length: 36 })
    .notNull()
    .references(() => books.id, { onDelete: "restrict" }),
  quantity: int("quantity").notNull().default(1),
});

export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum.default("bank_transfer").notNull(),
  status: transactionStatusEnum.default("pending").notNull(),
  paymentProof: varchar("payment_proof", { length: 500 }),
  verifiedBy: varchar("verified_by", { length: 36 })
    .references(() => users.id, { onDelete: "set null" }),
  verifiedAt: datetime("verified_at"),
  paidAt: datetime("paid_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const transactionItems = mysqlTable("transaction_items", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  transactionId: varchar("transaction_id", { length: 36 })
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  bookId: varchar("book_id", { length: 36 })
    .notNull()
    .references(() => books.id, { onDelete: "restrict" }),
  bookTitle: varchar("book_title", { length: 255 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

export const stockMovements = mysqlTable("stock_movements", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookId: varchar("book_id", { length: 36 })
    .notNull()
    .references(() => books.id, { onDelete: "restrict" }),
  userId: varchar("user_id", { length: 36 })
    .references(() => users.id, { onDelete: "set null" }),
  type: stockMovementTypeEnum.notNull(),
  quantity: int("quantity").notNull(),
  beforeQuantity: int("before_quantity").notNull(),
  afterQuantity: int("after_quantity").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 3. DEFINISI RELASI MENGGUNAKAN defineRelations
// ==========================================

export const appRelations = defineRelations(
  {
    users,
    contactMessages,
    categories,
    books,
    stocks,
    carts,
    cartItems,
    loans,
    loanItems,
    transactions,
    transactionItems,
    stockMovements,
  },
  (r) => ({
    users: {
      contactMessages: r.many.contactMessages({
        from: r.users.id,
        to: r.contactMessages.userId,
      }),
      cart: r.one.carts({
        from: r.users.id,
        to: r.carts.userId,
      }),
      loans: r.many.loans({
        from: r.users.id,
        to: r.loans.userId,
      }),
      transactions: r.many.transactions({
        from: r.users.id,
        to: r.transactions.userId,
      }),
      approvedLoans: r.many.loans({
        from: r.users.id,
        to: r.loans.approvedBy,
      }),
      verifiedTransactions: r.many.transactions({
        from: r.users.id,
        to: r.transactions.verifiedBy,
      }),
      stockMovements: r.many.stockMovements({
        from: r.users.id,
        to: r.stockMovements.userId,
      }),
    },
    contactMessages: {
      user: r.one.users({
        from: r.contactMessages.userId,
        to: r.users.id,
      }),
    },
    categories: {
      books: r.many.books({
        from: r.categories.id,
        to: r.books.categoryId,
      }),
    },
    books: {
      category: r.one.categories({
        from: r.books.categoryId,
        to: r.categories.id,
      }),
      stock: r.one.stocks({
        from: r.books.id,
        to: r.stocks.bookId,
      }),
      cartItems: r.many.cartItems({
        from: r.books.id,
        to: r.cartItems.bookId,
      }),
      loanItems: r.many.loanItems({
        from: r.books.id,
        to: r.loanItems.bookId,
      }),
      transactionItems: r.many.transactionItems({
        from: r.books.id,
        to: r.transactionItems.bookId,
      }),
      stockMovements: r.many.stockMovements({
        from: r.books.id,
        to: r.stockMovements.bookId,
      }),
    },
    stocks: {
      book: r.one.books({
        from: r.stocks.bookId,
        to: r.books.id,
      }),
    },
    carts: {
      user: r.one.users({
        from: r.carts.userId,
        to: r.users.id,
      }),
      items: r.many.cartItems({
        from: r.carts.id,
        to: r.cartItems.cartId,
      }),
    },
    cartItems: {
      cart: r.one.carts({
        from: r.cartItems.cartId,
        to: r.carts.id,
      }),
      book: r.one.books({
        from: r.cartItems.bookId,
        to: r.books.id,
      }),
    },
    loans: {
      user: r.one.users({
        from: r.loans.userId,
        to: r.users.id,
      }),
      approver: r.one.users({
        from: r.loans.approvedBy,
        to: r.users.id,
      }),
      items: r.many.loanItems({
        from: r.loans.id,
        to: r.loanItems.loanId,
      }),
    },
    loanItems: {
      loan: r.one.loans({
        from: r.loanItems.loanId,
        to: r.loans.id,
      }),
      book: r.one.books({
        from: r.loanItems.bookId,
        to: r.books.id,
      }),
    },
    transactions: {
      user: r.one.users({
        from: r.transactions.userId,
        to: r.users.id,
      }),
      verifier: r.one.users({
        from: r.transactions.verifiedBy,
        to: r.users.id,
      }),
      items: r.many.transactionItems({
        from: r.transactions.id,
        to: r.transactionItems.transactionId,
      }),
    },
    transactionItems: {
      transaction: r.one.transactions({
        from: r.transactionItems.transactionId,
        to: r.transactions.id,
      }),
      book: r.one.books({
        from: r.transactionItems.bookId,
        to: r.books.id,
      }),
    },
    stockMovements: {
      book: r.one.books({
        from: r.stockMovements.bookId,
        to: r.books.id,
      }),
      user: r.one.users({
        from: r.stockMovements.userId,
        to: r.users.id,
      }),
    },
  }),
);
