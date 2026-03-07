CREATE TABLE `musicArtists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artistName` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `musicCollectionArtists` (
	`musicCollectionId` integer NOT NULL,
	`musicArtistId` integer NOT NULL,
	PRIMARY KEY(`musicCollectionId`, `musicArtistId`),
	FOREIGN KEY (`musicCollectionId`) REFERENCES `musicCollections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`musicArtistId`) REFERENCES `musicArtists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicCollectionContexts` (
	`musicCollectionId` integer NOT NULL,
	`musicContextId` integer NOT NULL,
	PRIMARY KEY(`musicCollectionId`, `musicContextId`),
	FOREIGN KEY (`musicCollectionId`) REFERENCES `musicCollections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`musicContextId`) REFERENCES `musicContexts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicCollectionKind` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collectionLabel` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `musicCollectionLinks` (
	`musicCollectionId` integer NOT NULL,
	`musicLinkId` integer NOT NULL,
	PRIMARY KEY(`musicCollectionId`, `musicLinkId`),
	FOREIGN KEY (`musicCollectionId`) REFERENCES `musicCollections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`musicLinkId`) REFERENCES `musicLinks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicCollectionTags` (
	`musicCollectionId` integer NOT NULL,
	`musicTagId` integer NOT NULL,
	PRIMARY KEY(`musicCollectionId`, `musicTagId`),
	FOREIGN KEY (`musicCollectionId`) REFERENCES `musicCollections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`musicTagId`) REFERENCES `musicTags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicCollections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collectionTitle` text NOT NULL,
	`collectionCoverUrl` text NOT NULL,
	`collectionNotes` text NOT NULL,
	`collectionDateYear` integer NOT NULL,
	`collectionDateMonth` integer NOT NULL,
	`collectionKindId` integer NOT NULL,
	FOREIGN KEY (`collectionKindId`) REFERENCES `musicCollectionKind`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `musicContexts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contextLabel` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `musicLinks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`musicPlatformId` integer NOT NULL,
	`linkUrl` text NOT NULL,
	FOREIGN KEY (`musicPlatformId`) REFERENCES `musicPlatforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `musicPlatforms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platformName` text NOT NULL,
	`platformLabel` text NOT NULL,
	`platformUrl` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `musicTags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tagLabel` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `musicTrackArtists` (
	`trackId` integer NOT NULL,
	`artistId` integer NOT NULL,
	PRIMARY KEY(`trackId`, `artistId`),
	FOREIGN KEY (`trackId`) REFERENCES `musicTracks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artistId`) REFERENCES `musicArtists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicTrackLinks` (
	`trackId` integer NOT NULL,
	`linkId` integer NOT NULL,
	PRIMARY KEY(`trackId`, `linkId`),
	FOREIGN KEY (`trackId`) REFERENCES `musicTracks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`linkId`) REFERENCES `musicLinks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicTrackTags` (
	`trackId` integer NOT NULL,
	`tagId` integer NOT NULL,
	PRIMARY KEY(`trackId`, `tagId`),
	FOREIGN KEY (`trackId`) REFERENCES `musicTracks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `musicTags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicTracks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trackTitle` text NOT NULL,
	`trackCollectionId` integer NOT NULL,
	FOREIGN KEY (`trackCollectionId`) REFERENCES `musicCollections`(`id`) ON UPDATE no action ON DELETE cascade
);
