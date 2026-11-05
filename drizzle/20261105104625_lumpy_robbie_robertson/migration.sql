CREATE TABLE `cart_items` (
	`id` varchar(36) PRIMARY KEY,
	`cart_id` varchar(36) NOT NULL,
	`book_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_book_unique` UNIQUE INDEX(`cart_id`,`book_id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` varchar(36) PRIMARY KEY,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id_unique` UNIQUE INDEX(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `loan_items` (
	`id` varchar(36) PRIMARY KEY,
	`loan_id` varchar(36) NOT NULL,
	`book_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` varchar(36) PRIMARY KEY,
	`book_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`type` varchar(undefined) NOT NULL,
	`quantity` int NOT NULL,
	`before_quantity` int NOT NULL,
	`after_quantity` int NOT NULL,
	`reference_number` varchar(100),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `stocks` (
	`id` varchar(36) PRIMARY KEY,
	`book_id` varchar(36) NOT NULL,
	`total_quantity` int NOT NULL DEFAULT 0,
	`available_quantity` int NOT NULL DEFAULT 0,
	`reserved_quantity` int NOT NULL DEFAULT 0,
	`borrowed_quantity` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `book_id_unique` UNIQUE INDEX(`book_id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_items` (
	`id` varchar(36) PRIMARY KEY,
	`transaction_id` varchar(36) NOT NULL,
	`book_id` varchar(36) NOT NULL,
	`book_title` varchar(255) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`quantity` int NOT NULL,
	`subtotal` decimal(12,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) PRIMARY KEY,
	`user_id` varchar(36) NOT NULL,
	`invoice_number` varchar(100) NOT NULL,
	`total_amount` decimal(12,2) NOT NULL,
	`payment_method` varchar(undefined) NOT NULL DEFAULT 'bank_transfer',
	`status` varchar(undefined) NOT NULL DEFAULT 'pending',
	`payment_proof` varchar(500),
	`verified_by` varchar(36),
	`verified_at` timestamp,
	`paid_at` timestamp,
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoice_number_unique` UNIQUE INDEX(`invoice_number`)
);
--> statement-breakpoint
ALTER TABLE `loans` DROP CONSTRAINT `loans_book_id_books_id_fkey`;--> statement-breakpoint
DROP INDEX `loans_book_id_books_id_fkey` ON `loans`--> statement-breakpoint
ALTER TABLE `books` DROP CONSTRAINT `books_category_id_categories_id_fkey`;--> statement-breakpoint
DROP INDEX `name_unique` ON `categories`;--> statement-breakpoint
ALTER TABLE `books` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `books` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `books` MODIFY COLUMN `author` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `books` MODIFY COLUMN `isbn` varchar(20);--> statement-breakpoint
ALTER TABLE `books` MODIFY COLUMN `category_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `borrowed_at` timestamp;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `due_date` timestamp;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `returned_at` timestamp;--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `status` varchar(undefined) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(undefined) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `publisher` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `publication_year` int NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `image` varchar(500);--> statement-breakpoint
ALTER TABLE `books` ADD `price` decimal(12,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `status` varchar(undefined) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `categories` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `description` text;--> statement-breakpoint
ALTER TABLE `loans` ADD `loan_number` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` ADD `loan_date` timestamp;--> statement-breakpoint
ALTER TABLE `loans` ADD `approved_by` varchar(36);--> statement-breakpoint
ALTER TABLE `loans` ADD `approved_at` timestamp;--> statement-breakpoint
ALTER TABLE `loans` ADD `rejection_reason` text;--> statement-breakpoint
ALTER TABLE `loans` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `loans` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE UNIQUE INDEX `slug_unique` ON `books` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `loan_number_unique` ON `loans` (`loan_number`);--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_carts_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `loan_items` ADD CONSTRAINT `loan_items_loan_id_loans_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `loan_items` ADD CONSTRAINT `loan_items_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_approved_by_users_id_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_transaction_id_transactions_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_verified_by_users_id_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_category_id_categories_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `published_year`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `cover`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `total_copies`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `available_copies`;--> statement-breakpoint
ALTER TABLE `loans` DROP COLUMN `book_id`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_hash`;