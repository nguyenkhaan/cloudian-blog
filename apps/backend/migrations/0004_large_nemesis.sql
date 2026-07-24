PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chat_message` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`user_id` integer,
	`role` text NOT NULL,
	`chat_session_id` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chat_session_id`) REFERENCES `chat_session`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_chat_message`("id", "content", "user_id", "role", "chat_session_id", "created_at") SELECT "id", "content", "user_id", 'user' AS "role", CAST("chat_session_id" AS integer) AS "chat_session_id", "created_at" FROM `chat_message`;--> statement-breakpoint
DROP TABLE `chat_message`;--> statement-breakpoint
ALTER TABLE `__new_chat_message` RENAME TO `chat_message`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `chat_session` ADD `user_id` integer REFERENCES user(id);