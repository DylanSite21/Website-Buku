ALTER TABLE `loans` MODIFY COLUMN `loan_date` datetime;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `due_date` datetime;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `approved_at` datetime;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `borrowed_at` datetime;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `returned_at` datetime;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `verified_at` datetime;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `paid_at` datetime;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_category_id_categories_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_carts_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `loan_items` ADD CONSTRAINT `loan_items_loan_id_loans_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `loan_items` ADD CONSTRAINT `loan_items_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_approved_by_users_id_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_transaction_id_transactions_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_verified_by_users_id_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;