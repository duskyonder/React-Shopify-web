CREATE TABLE `theme_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(64) NOT NULL,
	`configValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `theme_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `theme_config_configKey_unique` UNIQUE(`configKey`)
);
--> statement-breakpoint
CREATE TABLE `uploaded_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` varchar(64) NOT NULL,
	`slot` varchar(64) NOT NULL,
	`s3Key` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`originalName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploaded_images_id` PRIMARY KEY(`id`)
);
