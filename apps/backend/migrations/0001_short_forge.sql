PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` integer
);
--> statement-breakpoint
INSERT INTO `__new_tag`("id", "name", "slug") SELECT "id", "name", "slug" FROM `tag`;--> statement-breakpoint
DROP TABLE `tag`;--> statement-breakpoint
ALTER TABLE `__new_tag` RENAME TO `tag`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `tag_slug_idx` ON `tag` (`slug`);--> statement-breakpoint
CREATE INDEX `tag_name_idx` ON `tag` (`name`);