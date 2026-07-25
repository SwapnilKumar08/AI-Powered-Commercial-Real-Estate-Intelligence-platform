CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`source_hash` text NOT NULL,
	`processing_status` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text,
	`title` text NOT NULL,
	`source` text NOT NULL,
	`source_uri` text,
	`source_hash` text NOT NULL,
	`locator` text NOT NULL,
	`content` text NOT NULL,
	`embedding` text NOT NULL,
	`entities` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `graph_edges` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`relationship` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`confidence` real NOT NULL,
	`evidence_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `outreach_events` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_name` text NOT NULL,
	`email_domain` text NOT NULL,
	`lawful_basis` text NOT NULL,
	`email_status` text NOT NULL,
	`action` text NOT NULL,
	`decision` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`market` text NOT NULL,
	`asset_type` text NOT NULL,
	`asking_price` integer,
	`area_sqft` integer,
	`occupancy` real,
	`cap_rate` real,
	`opportunity_score` integer NOT NULL,
	`latitude` real,
	`longitude` real,
	`attributes` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
