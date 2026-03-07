import { Hono } from "@hono/hono";
import { db } from "../database/client.ts";
import {
  musicArtists,
  musicCollectionArtists,
  musicCollectionContexts,
  musicCollectionLinks,
  musicCollections,
  musicCollectionTags,
  musicLinks,
  musicTrackArtists,
  musicTrackLinks,
  musicTracks,
  musicTrackTags,
} from "../database/schema.ts";
import { eq, inArray, notInArray, sql, asc, desc } from "drizzle-orm";

const musicCollectionRoutes = new Hono();

// Helper to flatten the nested result from db.query
const flattenCollection = (c: any) => ({
  ...c,
  artists: c.artists.map((a: any) => a.artist),
  tags: c.tags.map((t: any) => t.tag),
  contexts: c.contexts.map((ctx: any) => ctx.context),
  links: c.links.map((l: any) => ({ ...l.link, platform: l.link.platform })),
  kind: c.kind ? { ...c.kind, contexts: c.contexts.map((ctx: any) => ctx.context) } : null,
  tracks: c.tracks.map((t: any) => ({
    ...t,
    artists: t.artists.map((a: any) => a.artist),
    tags: t.tags.map((tag: any) => tag.tag),
    links: t.links.map((l: any) => ({ ...l.link, platform: l.link.platform })),
  })),
});

musicCollectionRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const sortBy = c.req.query("sortBy") || "id";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const offset = (page - 1) * limit;

  let orderBy;
  if (sortBy === "collectionTitle") {
    orderBy = sortOrder === "asc" ? asc(musicCollections.collectionTitle) : desc(musicCollections.collectionTitle);
  } else if (sortBy === "collectionDate") {
    orderBy = sortOrder === "asc" 
      ? [asc(musicCollections.collectionDateYear), asc(musicCollections.collectionDateMonth)]
      : [desc(musicCollections.collectionDateYear), desc(musicCollections.collectionDateMonth)];
  } else {
    orderBy = sortOrder === "asc" ? asc(musicCollections.id) : desc(musicCollections.id);
  }

  const [collections, totalCountResult] = await Promise.all([
    db.query.musicCollections.findMany({
      limit,
      offset,
      orderBy,
      with: {
        kind: true,
        artists: { with: { artist: true } },
        tags: { with: { tag: true } },
        contexts: { with: { context: true } },
        links: { with: { link: { with: { platform: true } } } },
        tracks: {
          with: {
            artists: { with: { artist: true } },
            tags: { with: { tag: true } },
            links: { with: { link: { with: { platform: true } } } },
          },
        },
      },
    }),
    db.select({ count: sql<number>`count(*)` }).from(musicCollections),
  ]);

  const totalCount = totalCountResult[0].count;

  return c.json({
    data: collections.map(flattenCollection),
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
  });
});

musicCollectionRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const collection = await db.query.musicCollections.findFirst({
    where: eq(musicCollections.id, id),
    with: {
      kind: true,
      artists: { with: { artist: true } },
      tags: { with: { tag: true } },
      contexts: { with: { context: true } },
      links: { with: { link: { with: { platform: true } } } },
      tracks: {
        with: {
          artists: { with: { artist: true } },
          tags: { with: { tag: true } },
          links: { with: { link: { with: { platform: true } } } },
        },
      },
    },
  });

  if (!collection) return c.json({ error: "Not found" }, 404);
  return c.json(flattenCollection(collection));
});

musicCollectionRoutes.post("/", async (c) => {
  const {
    musicArtistIds,
    musicTagIds,
    musicContextIds,
    musicLinkIds,
    musicLinks: newMusicLinks,
    tracks,
    ...collectionData
  } = await c.req.json();

  const created = await db.transaction(async (tx) => {
    const [collection] = await tx.insert(musicCollections).values(
      collectionData,
    ).returning();

    // Collection Relations
    if (musicArtistIds?.length) {
      await tx.insert(musicCollectionArtists).values(
        musicArtistIds.map((id: number) => ({
          musicCollectionId: collection.id,
          musicArtistId: id,
        })),
      );
    }
    if (musicTagIds?.length) {
      await tx.insert(musicCollectionTags).values(
        musicTagIds.map((id: number) => ({
          musicCollectionId: collection.id,
          musicTagId: id,
        })),
      );
    }
    if (musicContextIds?.length) {
      await tx.insert(musicCollectionContexts).values(
        musicContextIds.map((id: number) => ({
          musicCollectionId: collection.id,
          musicContextId: id,
        })),
      );
    }
    // Handle Collection Links (create new musicLinks)
    if (newMusicLinks?.length) {
      const insertedLinks = await tx.insert(musicLinks).values(
        newMusicLinks.map((l: any) => ({
          musicPlatformId: l.musicPlatformId,
          linkUrl: l.linkUrl,
        })),
      ).returning();
      await tx.insert(musicCollectionLinks).values(
        insertedLinks.map((l) => ({
          musicCollectionId: collection.id,
          musicLinkId: l.id,
        })),
      );
    }

    // Handle Tracks
    if (tracks && Array.isArray(tracks)) {
      for (const track of tracks) {
        const [newTrack] = await tx.insert(musicTracks).values({
          trackTitle: track.trackTitle,
          trackCollectionId: collection.id,
        }).returning();

        if (track.artistIds?.length) {
          await tx.insert(musicTrackArtists).values(
            track.artistIds.map((id: number) => ({
              trackId: newTrack.id,
              artistId: id,
            })),
          );
        }
        if (track.tagIds?.length) {
          await tx.insert(musicTrackTags).values(
            track.tagIds.map((id: number) => ({
              trackId: newTrack.id,
              tagId: id,
            })),
          );
        }
        if (track.links?.length) {
          const insertedTrackLinks = await tx.insert(musicLinks).values(
            track.links.map((l: any) => ({
              musicPlatformId: l.musicPlatformId,
              linkUrl: l.linkUrl,
            })),
          ).returning();
          await tx.insert(musicTrackLinks).values(
            insertedTrackLinks.map((l) => ({
              trackId: newTrack.id,
              linkId: l.id,
            })),
          );
        }
      }
    }

    return collection;
  });

  return c.json(created, 201);
});

musicCollectionRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const {
    musicArtistIds,
    musicTagIds,
    musicContextIds,
    musicLinks: newMusicLinks,
    tracks,
    ...collectionData
  } = await c.req.json();

  await db.transaction(async (tx) => {
    // Update collection info
    if (Object.keys(collectionData).length > 0) {
      await tx.update(musicCollections).set(collectionData).where(
        eq(musicCollections.id, id),
      );
    }

    // Update Artists
    if (musicArtistIds) {
      await tx.delete(musicCollectionArtists).where(
        eq(musicCollectionArtists.musicCollectionId, id),
      );
      if (musicArtistIds.length > 0) {
        await tx.insert(musicCollectionArtists).values(
          musicArtistIds.map((aid: number) => ({
            musicCollectionId: id,
            musicArtistId: aid,
          })),
        );
      }
    }

    // Update Tags
    if (musicTagIds) {
      await tx.delete(musicCollectionTags).where(
        eq(musicCollectionTags.musicCollectionId, id),
      );
      if (musicTagIds.length > 0) {
        await tx.insert(musicCollectionTags).values(
          musicTagIds.map((tid: number) => ({
            musicCollectionId: id,
            musicTagId: tid,
          })),
        );
      }
    }

    // Update Contexts
    if (musicContextIds) {
      await tx.delete(musicCollectionContexts).where(
        eq(musicCollectionContexts.musicCollectionId, id),
      );
      if (musicContextIds.length > 0) {
        await tx.insert(musicCollectionContexts).values(
          musicContextIds.map((cid: number) => ({
            musicCollectionId: id,
            musicContextId: cid,
          })),
        );
      }
    }

    // Update Collection Links
    if (newMusicLinks) {
      // Find existing links to delete them from musicLinks table
      const existingLinks = await tx
        .select({ id: musicCollectionLinks.musicLinkId })
        .from(musicCollectionLinks)
        .where(eq(musicCollectionLinks.musicCollectionId, id));

      const linkIdsToDelete = existingLinks.map((l) => l.id);

      await tx.delete(musicCollectionLinks).where(
        eq(musicCollectionLinks.musicCollectionId, id),
      );

      if (linkIdsToDelete.length > 0) {
        await tx.delete(musicLinks).where(
          inArray(musicLinks.id, linkIdsToDelete),
        );
      }

      if (newMusicLinks.length > 0) {
        const insertedLinks = await tx.insert(musicLinks).values(
          newMusicLinks.map((l: any) => ({
            musicPlatformId: l.musicPlatformId,
            linkUrl: l.linkUrl,
          })),
        ).returning();
        await tx.insert(musicCollectionLinks).values(
          insertedLinks.map((l) => ({
            musicCollectionId: id,
            musicLinkId: l.id,
          })),
        );
      }
    }

    // Sync Tracks
    if (tracks) {
      const existingTracks = await tx
        .select({ id: musicTracks.id })
        .from(musicTracks)
        .where(eq(musicTracks.trackCollectionId, id));
      const existingTrackIds = existingTracks.map((t) => t.id);

      const incomingTrackIds = tracks
        .filter((t: any) => t.id)
        .map((t: any) => t.id);

      // Delete removed tracks
      const tracksToDelete = existingTrackIds.filter(
        (tid) => !incomingTrackIds.includes(tid),
      );

      // We also need to delete the musicLinks associated with these tracks
      if (tracksToDelete.length > 0) {
        const linksToDelete = await tx
          .select({ id: musicTrackLinks.linkId })
          .from(musicTrackLinks)
          .where(inArray(musicTrackLinks.trackId, tracksToDelete));

        const linkIdsToDelete = linksToDelete.map((l) => l.id);

        await tx.delete(musicTracks).where(
          inArray(musicTracks.id, tracksToDelete),
        );

        if (linkIdsToDelete.length > 0) {
          await tx.delete(musicLinks).where(
            inArray(musicLinks.id, linkIdsToDelete),
          );
        }
      }

      // Upsert tracks
      for (const track of tracks) {
        let trackId = track.id;

        if (trackId) {
          // Update existing track
          await tx.update(musicTracks)
            .set({ trackTitle: track.trackTitle })
            .where(eq(musicTracks.id, trackId));

          // Clear and recreate relations for simplicity
          await tx.delete(musicTrackArtists).where(
            eq(musicTrackArtists.trackId, trackId),
          );
          await tx.delete(musicTrackTags).where(
            eq(musicTrackTags.trackId, trackId),
          );

          // Handle links: find old ones, delete junction, delete links, create new
          const oldLinks = await tx.select({ id: musicTrackLinks.linkId })
            .from(musicTrackLinks)
            .where(eq(musicTrackLinks.trackId, trackId));
          const oldLinkIds = oldLinks.map((l) => l.id);

          await tx.delete(musicTrackLinks).where(
            eq(musicTrackLinks.trackId, trackId),
          );
          if (oldLinkIds.length > 0) {
            await tx.delete(musicLinks).where(
              inArray(musicLinks.id, oldLinkIds),
            );
          }
        } else {
          // Create new track
          const [newTrack] = await tx.insert(musicTracks).values({
            trackTitle: track.trackTitle,
            trackCollectionId: id,
          }).returning();
          trackId = newTrack.id;
        }

        // Insert relations (for both new and updated)
        if (track.artistIds?.length) {
          await tx.insert(musicTrackArtists).values(
            track.artistIds.map((aid: number) => ({
              trackId: trackId,
              artistId: aid,
            })),
          );
        }
        if (track.tagIds?.length) {
          await tx.insert(musicTrackTags).values(
            track.tagIds.map((tid: number) => ({
              trackId: trackId,
              tagId: tid,
            })),
          );
        }
        if (track.links?.length) {
          const insertedLinks = await tx.insert(musicLinks).values(
            track.links.map((l: any) => ({
              musicPlatformId: l.musicPlatformId,
              linkUrl: l.linkUrl,
            })),
          ).returning();
          await tx.insert(musicTrackLinks).values(
            insertedLinks.map((l) => ({
              trackId: trackId,
              linkId: l.id,
            })),
          );
        }
      }
    }
  });

  return c.body(null, 204);
});

musicCollectionRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  await db.transaction(async (tx) => {
    // Collect all links to delete (Collection Links AND Track Links)

    // Collection Links
    const collectionLinks = await tx
      .select({ id: musicCollectionLinks.musicLinkId })
      .from(musicCollectionLinks)
      .where(eq(musicCollectionLinks.musicCollectionId, id));

    // Track Links
    // First find tracks
    const tracks = await tx.select({ id: musicTracks.id }).from(musicTracks)
      .where(eq(musicTracks.trackCollectionId, id));
    const trackIds = tracks.map((t) => t.id);

    let trackLinks: { id: number }[] = [];
    if (trackIds.length > 0) {
      trackLinks = await tx
        .select({ id: musicTrackLinks.linkId })
        .from(musicTrackLinks)
        .where(inArray(musicTrackLinks.trackId, trackIds));
    }

    const allLinkIds = [
      ...collectionLinks.map((l) => l.id),
      ...trackLinks.map((l) => l.id),
    ];

    // Delete collection (cascades to tracks, junctions)
    await tx.delete(musicCollections).where(eq(musicCollections.id, id));

    // Delete orphaned links
    if (allLinkIds.length > 0) {
      await tx.delete(musicLinks).where(inArray(musicLinks.id, allLinkIds));
    }
  });

  return c.body(null, 204);
});

export { musicCollectionRoutes };
