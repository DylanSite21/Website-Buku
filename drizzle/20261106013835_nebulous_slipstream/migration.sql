CREATE TABLE `contact_messages` (
	`id` varchar(36) PRIMARY KEY,
	`user_id` varchar(36) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`contact_message_status` enum('unread','read') NOT NULL DEFAULT 'unread',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`read_at` datetime,
	CONSTRAINT `contact_messages_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
