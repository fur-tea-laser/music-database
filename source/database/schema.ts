import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const musicCollections = sqliteTable("musicCollections", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  collectionTitle: text("collectionTitle").notNull(),
  collectionCoverUrl: text("collectionCoverUrl").notNull(),
  collectionNotes: text("collectionNotes").notNull(),
  collectionDateYear: integer("collectionDateYear").notNull(),
  collectionDateMonth: integer("collectionDateMonth").notNull(),
  collectionKindId: integer("collectionKindId").references(() =>
    musicCollectionKind.id
  ).notNull(),
});

export const musicArtists = sqliteTable("musicArtists", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  artistName: text("artistName").notNull(),
});

export const musicCollectionArtists = sqliteTable("musicCollectionArtists", {
  musicCollectionId: integer("musicCollectionId").notNull().references(
    () => musicCollections.id,
    { onDelete: "cascade" },
  ),
  musicArtistId: integer("musicArtistId").notNull().references(
    () => musicArtists.id,
    { onDelete: "cascade" },
  ),
}, (t) => ({
  pk: primaryKey({ columns: [t.musicCollectionId, t.musicArtistId] }),
}));

export const musicTags = sqliteTable("musicTags", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  tagLabel: text("tagLabel").notNull(),
});

export const musicCollectionTags = sqliteTable("musicCollectionTags", {
  musicCollectionId: integer("musicCollectionId").notNull().references(
    () => musicCollections.id,
    { onDelete: "cascade" },
  ),
  musicTagId: integer("musicTagId").notNull().references(() => musicTags.id, {
    onDelete: "cascade",
  }),
}, (t) => ({
  pk: primaryKey({ columns: [t.musicCollectionId, t.musicTagId] }),
}));

export const musicContexts = sqliteTable("musicContexts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  contextLabel: text("contextLabel").notNull(),
});

export const musicCollectionContexts = sqliteTable("musicCollectionContexts", {
  musicCollectionId: integer("musicCollectionId").notNull().references(
    () => musicCollections.id,
    { onDelete: "cascade" },
  ),
  musicContextId: integer("musicContextId").notNull().references(
    () => musicContexts.id,
    { onDelete: "cascade" },
  ),
}, (t) => ({
  pk: primaryKey({ columns: [t.musicCollectionId, t.musicContextId] }),
}));

export const musicCollectionKind = sqliteTable("musicCollectionKind", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  collectionLabel: text("collectionLabel").notNull(),
});

export const musicLinks = sqliteTable("musicLinks", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  musicPlatformId: integer("musicPlatformId").notNull().references(() =>
    musicPlatforms.id
  ),
  linkUrl: text("linkUrl").notNull(),
});

export const musicCollectionLinks = sqliteTable("musicCollectionLinks", {
  musicCollectionId: integer("musicCollectionId").notNull().references(
    () => musicCollections.id,
    { onDelete: "cascade" },
  ),
  musicLinkId: integer("musicLinkId").notNull().references(
    () => musicLinks.id,
    { onDelete: "cascade" },
  ),
}, (t) => ({
  pk: primaryKey({ columns: [t.musicCollectionId, t.musicLinkId] }),
}));

export const musicPlatforms = sqliteTable("musicPlatforms", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  platformName: text("platformName").notNull(),
  platformLabel: text("platformLabel").notNull(),
  platformUrl: text("platformUrl").notNull(),
});

export const musicTracks = sqliteTable("musicTracks", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  trackTitle: text("trackTitle").notNull(),
  trackCollectionId: integer("trackCollectionId").notNull().references(
    () => musicCollections.id,
    { onDelete: "cascade" },
  ),
});

export const musicTrackArtists = sqliteTable("musicTrackArtists", {
  trackId: integer("trackId").notNull().references(
    () => musicTracks.id,
    { onDelete: "cascade" },
  ),
  artistId: integer("artistId").notNull().references(
    () => musicArtists.id,
    { onDelete: "cascade" },
  ),
}, (t) => ({
  pk: primaryKey({ columns: [t.trackId, t.artistId] }),
}));

export const musicTrackLinks = sqliteTable("musicTrackLinks", {
  trackId: integer("trackId").notNull().references(
    () => musicTracks.id,
    { onDelete: "cascade" },
  ),
  linkId: integer("linkId").notNull().references(
    () => musicLinks.id,
    { onDelete: "cascade" },
  ),
}, (t) => ({
  pk: primaryKey({ columns: [t.trackId, t.linkId] }),
}));

export const musicTrackTags = sqliteTable("musicTrackTags", {
  trackId: integer("trackId").notNull().references(
    () => musicTracks.id,
    { onDelete: "cascade" },
  ),
  tagId: integer("tagId").notNull().references(
    () => musicTags.id,
    { onDelete: "cascade" },
  ),
}, (t) => ({
  pk: primaryKey({ columns: [t.trackId, t.tagId] }),
}));

// Relations

export const musicCollectionsRelations = relations(
  musicCollections,
  ({ one, many }) => ({
    kind: one(musicCollectionKind, {
      fields: [musicCollections.collectionKindId],
      references: [musicCollectionKind.id],
    }),
    artists: many(musicCollectionArtists),
    tags: many(musicCollectionTags),
    contexts: many(musicCollectionContexts),
    links: many(musicCollectionLinks),
    tracks: many(musicTracks),
  }),
);

export const musicCollectionArtistsRelations = relations(
  musicCollectionArtists,
  ({ one }) => ({
    collection: one(musicCollections, {
      fields: [musicCollectionArtists.musicCollectionId],
      references: [musicCollections.id],
    }),
    artist: one(musicArtists, {
      fields: [musicCollectionArtists.musicArtistId],
      references: [musicArtists.id],
    }),
  }),
);

export const musicCollectionTagsRelations = relations(
  musicCollectionTags,
  ({ one }) => ({
    collection: one(musicCollections, {
      fields: [musicCollectionTags.musicCollectionId],
      references: [musicCollections.id],
    }),
    tag: one(musicTags, {
      fields: [musicCollectionTags.musicTagId],
      references: [musicTags.id],
    }),
  }),
);

export const musicCollectionContextsRelations = relations(
  musicCollectionContexts,
  ({ one }) => ({
    collection: one(musicCollections, {
      fields: [musicCollectionContexts.musicCollectionId],
      references: [musicCollections.id],
    }),
    context: one(musicContexts, {
      fields: [musicCollectionContexts.musicContextId],
      references: [musicContexts.id],
    }),
  }),
);

export const musicCollectionLinksRelations = relations(
  musicCollectionLinks,
  ({ one }) => ({
    collection: one(musicCollections, {
      fields: [musicCollectionLinks.musicCollectionId],
      references: [musicCollections.id],
    }),
    link: one(musicLinks, {
      fields: [musicCollectionLinks.musicLinkId],
      references: [musicLinks.id],
    }),
  }),
);

export const musicLinksRelations = relations(musicLinks, ({ one, many }) => ({
  platform: one(musicPlatforms, {
    fields: [musicLinks.musicPlatformId],
    references: [musicPlatforms.id],
  }),
}));

export const musicTracksRelations = relations(musicTracks, ({ one, many }) => ({
  collection: one(musicCollections, {
    fields: [musicTracks.trackCollectionId],
    references: [musicCollections.id],
  }),
  artists: many(musicTrackArtists),
  tags: many(musicTrackTags),
  links: many(musicTrackLinks),
}));

export const musicTrackArtistsRelations = relations(
  musicTrackArtists,
  ({ one }) => ({
    track: one(musicTracks, {
      fields: [musicTrackArtists.trackId],
      references: [musicTracks.id],
    }),
    artist: one(musicArtists, {
      fields: [musicTrackArtists.artistId],
      references: [musicArtists.id],
    }),
  }),
);

export const musicTrackTagsRelations = relations(musicTrackTags, ({ one }) => ({
  track: one(musicTracks, {
    fields: [musicTrackTags.trackId],
    references: [musicTracks.id],
  }),
  tag: one(musicTags, {
    fields: [musicTrackTags.tagId],
    references: [musicTags.id],
  }),
}));

export const musicTrackLinksRelations = relations(
  musicTrackLinks,
  ({ one }) => ({
    track: one(musicTracks, {
      fields: [musicTrackLinks.trackId],
      references: [musicTracks.id],
    }),
    link: one(musicLinks, {
      fields: [musicTrackLinks.linkId],
      references: [musicLinks.id],
    }),
  }),
);
