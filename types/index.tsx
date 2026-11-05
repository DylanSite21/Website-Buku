import { z } from "zod";
import {
  users,
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
} from "@/lib/db/schema";

// --- Database Entity Types ---
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;

export type Loan = typeof loans.$inferSelect;
export type LoanItem = typeof loanItems.$inferSelect;

export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;

export type StockMovement = typeof stockMovements.$inferSelect;

// --- Auth & Session Types ---
export type UserRole = "user" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// --- API Response Standardized Wrapper ---
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | Record<string, any>;
}
