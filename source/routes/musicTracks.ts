import { Hono } from "@hono/hono";
import { db } from "../database/client.ts";
import {
  musicArtists,
  musicLinks,
  musicPlatforms,
  musicTags,
  musicTrackArtists,
  musicTrackLinks,
  musicTracks,
  musicTrackTags,
} from "../database/schema.ts";
import { eq, inArray, sql, asc, desc } from "drizzle-orm";

const musicTrackRoutes = new Hono();

musicTrackRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const sortBy = c.req.query("sortBy") || "id";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const offset = (page - 1) * limit;

  let orderBy;
  if (sortBy === "trackTitle") {
    orderBy = sortOrder === "asc" ? asc(musicTracks.trackTitle) : desc(musicTracks.trackTitle);
  } else {
    orderBy = sortOrder === "asc" ? asc(musicTracks.id) : desc(musicTracks.id);
  }

  const [tracks, totalCountResult] = await Promise.all([
    db.query.musicTracks.findMany({
      limit,
      offset,
      orderBy,
      with: {
        artists: { with: { artist: true } },
        tags: { with: { tag: true } },
        links: { with: { link: { with: { platform: true } } } },
      },
    }),
    db.select({ count: sql<number>`count(*)` }).from(musicTracks),
  ]);

  const totalCount = totalCountResult[0].count;

  const flattenedTracks = tracks.map((t: any) => ({
    ...t,
    artists: t.artists.map((a: any) => a.artist),
    tags: t.tags.map((tag: any) => tag.tag),
    links: t.links.map((l: any) => ({ ...l.link, platform: l.link.platform })),
  }));

  return c.json({
    data: flattenedTracks,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
  });
});

musicTrackRoutes.post("/", async (c) => {
  const {
    artistIds,
    tagIds,
    linkIds,
    newLinks,
    ...trackData
  } = await c.req.json();

  const created = await db.transaction(async (tx) => {
    const [track] = await tx.insert(musicTracks).values(trackData).returning();

    if (artistIds && Array.isArray(artistIds) && artistIds.length > 0) {
      await tx.insert(musicTrackArtists).values(
        artistIds.map((artistId: number) => ({
          trackId: track.id,
          artistId: artistId,
        })),
      );
    }

    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await tx.insert(musicTrackTags).values(
        tagIds.map((tagId: number) => ({
          trackId: track.id,
          tagId: tagId,
        })),
      );
    }

    if (linkIds && Array.isArray(linkIds) && linkIds.length > 0) {
      await tx.insert(musicTrackLinks).values(
        linkIds.map((linkId: number) => ({
          trackId: track.id,
          linkId: linkId,
        })),
      );
    }

    if (newLinks && Array.isArray(newLinks) && newLinks.length > 0) {
      const insertedLinks = await tx.insert(musicLinks).values(
        newLinks.map((link: any) => ({
          musicPlatformId: link.musicPlatformId,
          linkUrl: link.linkUrl,
        })),
      ).returning();

      await tx.insert(musicTrackLinks).values(
        insertedLinks.map((link) => ({
          trackId: track.id,
          linkId: link.id,
        })),
      );
    }

    return track;
  });

  return c.json(created, 201);
});

musicTrackRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const rows = await db
    .select({
      track: musicTracks,
      artist: musicArtists,
      tag: musicTags,
      link: musicLinks,
      platform: musicPlatforms,
    })
    .from(musicTracks)
    .leftJoin(musicTrackArtists, eq(musicTracks.id, musicTrackArtists.trackId))
    .leftJoin(musicArtists, eq(musicTrackArtists.artistId, musicArtists.id))
    .leftJoin(musicTrackTags, eq(musicTracks.id, musicTrackTags.trackId))
    .leftJoin(musicTags, eq(musicTrackTags.tagId, musicTags.id))
    .leftJoin(musicTrackLinks, eq(musicTracks.id, musicTrackLinks.trackId))
    .leftJoin(musicLinks, eq(musicTrackLinks.linkId, musicLinks.id))
    .leftJoin(musicPlatforms, eq(musicLinks.musicPlatformId, musicPlatforms.id))
    .where(eq(musicTracks.id, id));

  if (rows.length === 0) return c.json({ error: "Not found" }, 404);

  const artists = new Map();
  const tags = new Map();
  const links = new Map();

  rows.forEach((r) => {
    if (r.artist) artists.set(r.artist.id, r.artist);
    if (r.tag) tags.set(r.tag.id, r.tag);
    if (r.link) links.set(r.link.id, { ...r.link, platform: r.platform });
  });

  const track = {
    ...rows[0].track,
    artists: Array.from(artists.values()),
    tags: Array.from(tags.values()),
    links: Array.from(links.values()),
  };

  return c.json(track);
});

musicTrackRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const {
    artistIds,
    tagIds,
    linkIds,
    newLinks,
    ...trackData
  } = await c.req.json();

  await db.transaction(async (tx) => {
    if (Object.keys(trackData).length > 0) {
      await tx.update(musicTracks).set(trackData).where(eq(musicTracks.id, id));
    }

    if (artistIds && Array.isArray(artistIds)) {
      await tx.delete(musicTrackArtists).where(
        eq(musicTrackArtists.trackId, id),
      );
      if (artistIds.length > 0) {
        await tx.insert(musicTrackArtists).values(
          artistIds.map((artistId: number) => ({
            trackId: id,
            artistId: artistId,
          })),
        );
      }
    }

    if (tagIds && Array.isArray(tagIds)) {
      await tx.delete(musicTrackTags).where(eq(musicTrackTags.trackId, id));
      if (tagIds.length > 0) {
        await tx.insert(musicTrackTags).values(
          tagIds.map((tagId: number) => ({
            trackId: id,
            tagId: tagId,
          })),
        );
      }
    }

    if (newLinks && Array.isArray(newLinks)) {
      const linkedLinks = await tx
        .select({ linkId: musicTrackLinks.linkId })
        .from(musicTrackLinks)
        .where(eq(musicTrackLinks.trackId, id));

      const existingLinkIds = linkedLinks.map((l) => l.linkId);

      await tx.delete(musicTrackLinks).where(eq(musicTrackLinks.trackId, id));

      if (existingLinkIds.length > 0) {
        await tx.delete(musicLinks).where(
          inArray(musicLinks.id, existingLinkIds),
        );
      }

      if (newLinks.length > 0) {
        const insertedLinks = await tx.insert(musicLinks).values(
          newLinks.map((link: any) => ({
            musicPlatformId: link.musicPlatformId,
            linkUrl: link.linkUrl,
          })),
        ).returning();

        await tx.insert(musicTrackLinks).values(
          insertedLinks.map((link) => ({
            trackId: id,
            linkId: link.id,
          })),
        );
      }
    } else if (linkIds && Array.isArray(linkIds)) {
      await tx.delete(musicTrackLinks).where(eq(musicTrackLinks.trackId, id));
      if (linkIds.length > 0) {
        await tx.insert(musicTrackLinks).values(
          linkIds.map((linkId: number) => ({
            trackId: id,
            linkId: linkId,
          })),
        );
      }
    }
  });

  return c.body(null, 204);
});

musicTrackRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  await db.transaction(async (tx) => {
    const linkedLinks = await tx
      .select({ linkId: musicTrackLinks.linkId })
      .from(musicTrackLinks)
      .where(eq(musicTrackLinks.trackId, id));

    const linkIds = linkedLinks.map((l) => l.linkId);

    await tx.delete(musicTracks).where(eq(musicTracks.id, id));

    if (linkIds.length > 0) {
      await tx.delete(musicLinks).where(inArray(musicLinks.id, linkIds));
    }
  });

  return c.body(null, 204);
});

export { musicTrackRoutes };
