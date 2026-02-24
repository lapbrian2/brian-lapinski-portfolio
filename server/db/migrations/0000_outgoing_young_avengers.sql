CREATE TABLE `artwork_techniques` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artwork_id` text NOT NULL,
	`technique_id` text NOT NULL,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`technique_id`) REFERENCES `techniques`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `artworks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`medium` text NOT NULL,
	`description` text NOT NULL,
	`src` text NOT NULL,
	`aspect` text NOT NULL,
	`year` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`featured` integer DEFAULT false,
	`raw_prompt` text,
	`mj_version` text,
	`refinement_notes` text,
	`dominant_color` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`ip` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `content` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`section` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'exhibition' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`artwork_id` text,
	`referrer` text,
	`user_agent` text,
	`ip` text,
	`country` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`value` text NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `techniques` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `techniques_name_unique` ON `techniques` (`name`);