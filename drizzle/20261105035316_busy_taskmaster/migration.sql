CREATE TABLE `books` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`title` varchar(200) NOT NULL,
	`author` varchar(150) NOT NULL,
	`isbn` varchar(20) NOT NULL,
	`category_id` int,
	`published_year` int,
	`description` text,
	`cover` varchar(100),
	`total_copies` int NOT NULL DEFAULT 1,
	`available_copies` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `isbn_unique` UNIQUE INDEX(`isbn`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(80) NOT NULL,
	CONSTRAINT `name_unique` UNIQUE INDEX(`name`)
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`user_id` int NOT NULL,
	`book_id` int NOT NULL,
	`borrowed_at` datetime NOT NULL DEFAULT (now()),
	`due_date` datetime NOT NULL,
	`returned_at` datetime,
	`status` enum('borrowed','returned') NOT NULL DEFAULT 'borrowed'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_category_id_categories_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `loans` ADD CONSTRAINT `loans_book_id_books_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT;