ALTER TABLE `books` DROP CONSTRAINT `books_category_id_categories_id_fkey`;--> statement-breakpoint
DROP INDEX `books_category_id_categories_id_fkey` ON `books`--> statement-breakpoint
ALTER TABLE `cart_items` DROP CONSTRAINT `cart_items_cart_id_carts_id_fkey`;--> statement-breakpoint
DROP INDEX `cart_items_cart_id_carts_id_fkey` ON `cart_items`--> statement-breakpoint
ALTER TABLE `cart_items` DROP CONSTRAINT `cart_items_book_id_books_id_fkey`;--> statement-breakpoint
DROP INDEX `cart_items_book_id_books_id_fkey` ON `cart_items`--> statement-breakpoint
ALTER TABLE `carts` DROP CONSTRAINT `carts_user_id_users_id_fkey`;--> statement-breakpoint
DROP INDEX `carts_user_id_users_id_fkey` ON `carts`--> statement-breakpoint
ALTER TABLE `loan_items` DROP CONSTRAINT `loan_items_loan_id_loans_id_fkey`;--> statement-breakpoint
DROP INDEX `loan_items_loan_id_loans_id_fkey` ON `loan_items`--> statement-breakpoint
ALTER TABLE `loan_items` DROP CONSTRAINT `loan_items_book_id_books_id_fkey`;--> statement-breakpoint
DROP INDEX `loan_items_book_id_books_id_fkey` ON `loan_items`--> statement-breakpoint
ALTER TABLE `loans` DROP CONSTRAINT `loans_user_id_users_id_fkey`;--> statement-breakpoint
DROP INDEX `loans_user_id_users_id_fkey` ON `loans`--> statement-breakpoint
ALTER TABLE `loans` DROP CONSTRAINT `loans_approved_by_users_id_fkey`;--> statement-breakpoint
DROP INDEX `loans_approved_by_users_id_fkey` ON `loans`--> statement-breakpoint
ALTER TABLE `stock_movements` DROP CONSTRAINT `stock_movements_book_id_books_id_fkey`;--> statement-breakpoint
DROP INDEX `stock_movements_book_id_books_id_fkey` ON `stock_movements`--> statement-breakpoint
ALTER TABLE `stock_movements` DROP CONSTRAINT `stock_movements_user_id_users_id_fkey`;--> statement-breakpoint
DROP INDEX `stock_movements_user_id_users_id_fkey` ON `stock_movements`--> statement-breakpoint
ALTER TABLE `stocks` DROP CONSTRAINT `stocks_book_id_books_id_fkey`;--> statement-breakpoint
DROP INDEX `stocks_book_id_books_id_fkey` ON `stocks`--> statement-breakpoint
ALTER TABLE `transaction_items` DROP CONSTRAINT `transaction_items_transaction_id_transactions_id_fkey`;--> statement-breakpoint
DROP INDEX `transaction_items_transaction_id_transactions_id_fkey` ON `transaction_items`--> statement-breakpoint
ALTER TABLE `transaction_items` DROP CONSTRAINT `transaction_items_book_id_books_id_fkey`;--> statement-breakpoint
DROP INDEX `transaction_items_book_id_books_id_fkey` ON `transaction_items`--> statement-breakpoint
ALTER TABLE `transactions` DROP CONSTRAINT `transactions_user_id_users_id_fkey`;--> statement-breakpoint
DROP INDEX `transactions_user_id_users_id_fkey` ON `transactions`--> statement-breakpoint
ALTER TABLE `transactions` DROP CONSTRAINT `transactions_verified_by_users_id_fkey`;--> statement-breakpoint
DROP INDEX `transactions_verified_by_users_id_fkey` ON `transactions`--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `payment_method` enum('bank_transfer','cash') DEFAULT 'bank_transfer' NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `book_status` enum('draft','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` ADD `loan_status` enum('pending','approved','rejected','borrowed','returned','overdue','cancelled') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `transaction_status` enum('pending','awaiting_verification','paid','rejected','cancelled','refunded') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `user_role` enum('user','admin') DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `loans` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `transactions` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `role`;