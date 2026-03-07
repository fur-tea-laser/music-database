import { Hono } from "@hono/hono";
import { assertEquals } from "jsr:@std/assert";
import {
  musicCollectionKind,
  musicCollectionLinks,
  musicCollections,
  musicLinks,
  musicPlatforms,
} from "../database/schema.ts";
import { eq } from "drizzle-orm";

Deno.test("Music Collections API", async (t) => {
  // Setup: Set DB_URL to test.db BEFORE importing client
  Deno.env.set("DB_URL", "file:test.db");

  // Dynamic import to ensure env var is picked up
  const { db } = await import("../database/client.ts");
  const { musicCollectionRoutes } = await import("./musicCollections.ts");

  // Push schema to test DB
  const pushCommand = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "npm:drizzle-kit",
      "push",
      "--config=drizzle.test.config.ts",
    ],
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await pushCommand.output();
  if (code !== 0) {
    console.error(new TextDecoder().decode(stderr));
    throw new Error("Failed to push schema to test DB");
  }

  // Clear tables to be safe
  await db.delete(musicCollectionLinks);
  await db.delete(musicLinks);
  await db.delete(musicCollections);
  await db.delete(musicPlatforms);
  await db.delete(musicCollectionKind);

  // Seed reference data
  const [platform] = await db.insert(musicPlatforms).values({
    platformName: "TestPlatform",
    platformLabel: "Test Platform",
    platformUrl: "http://test.com",
  }).returning();

  const [kind] = await db.insert(musicCollectionKind).values({
    collectionLabel: "Test Kind",
  }).returning();

  const app = new Hono();
  app.route("/music-collections", musicCollectionRoutes);

  await t.step("POST / creates collection and links", async () => {
    const payload = {
      collectionTitle: "Test Album",
      collectionCoverUrl: "http://cover.url",
      collectionNotes: "Test Notes",
      collectionDateYear: 2023,
      collectionDateMonth: 1,
      collectionKindId: kind.id,
      musicLinks: [
        { musicPlatformId: platform.id, linkUrl: "http://link1.com" },
        { musicPlatformId: platform.id, linkUrl: "http://link2.com" },
      ],
    };

    const res = await app.request("/music-collections", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    assertEquals(res.status, 201);
    const body = await res.json();
    assertEquals(body.collectionTitle, "Test Album");
    const collectionId = body.id;

    // Verify links created
    const links = await db.select().from(musicLinks);
    // There might be links from previous runs if file persists, but we cleared tables.
    // In this step we expect 2.
    assertEquals(links.length, 2);
    assertEquals(links[0].linkUrl, "http://link1.com");

    // Verify junction
    const junctions = await db.select().from(musicCollectionLinks).where(
      eq(musicCollectionLinks.musicCollectionId, collectionId),
    );
    assertEquals(junctions.length, 2);
  });

  await t.step("DELETE / removes collection and associated links", async () => {
    // Create new collection
    const [collection] = await db.insert(musicCollections).values({
      collectionTitle: "To Delete",
      collectionCoverUrl: "http://cover.url",
      collectionNotes: "Delete Notes",
      collectionDateYear: 2023,
      collectionDateMonth: 1,
      collectionKindId: kind.id,
    }).returning();

    // Create link
    const [link] = await db.insert(musicLinks).values({
      musicPlatformId: platform.id,
      linkUrl: "http://delete-me.com",
    }).returning();

    // Link them
    await db.insert(musicCollectionLinks).values({
      musicCollectionId: collection.id,
      musicLinkId: link.id,
    });

    // Verify exists
    let l = await db.select().from(musicLinks).where(
      eq(musicLinks.id, link.id),
    );
    assertEquals(l.length, 1);

    // Delete
    const res = await app.request(`/music-collections/${collection.id}`, {
      method: "DELETE",
    });
    assertEquals(res.status, 204);

    // Verify link is gone
    l = await db.select().from(musicLinks).where(eq(musicLinks.id, link.id));
    assertEquals(l.length, 0);

    // Verify collection is gone
    const c = await db.select().from(musicCollections).where(
      eq(musicCollections.id, collection.id),
    );
    assertEquals(c.length, 0);
  });

  await t.step("PATCH / updates collection and syncs links", async () => {
    // 1. Create a collection with an initial link
    const [collection] = await db.insert(musicCollections).values({
      collectionTitle: "Original Title",
      collectionCoverUrl: "http://original.url",
      collectionNotes: "Original Notes",
      collectionDateYear: 2023,
      collectionDateMonth: 1,
      collectionKindId: kind.id,
    }).returning();

    const [oldLink] = await db.insert(musicLinks).values({
      musicPlatformId: platform.id,
      linkUrl: "http://old-link.com",
    }).returning();

    await db.insert(musicCollectionLinks).values({
      musicCollectionId: collection.id,
      musicLinkId: oldLink.id,
    });

    // 2. Patch it with a new title and a DIFFERENT link
    const payload = {
      collectionTitle: "Updated Title",
      musicLinks: [
        { musicPlatformId: platform.id, linkUrl: "http://new-link.com" },
      ],
    };

    const res = await app.request(`/music-collections/${collection.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    assertEquals(res.status, 204);

    // 3. Verify title updated
    const [updatedCollection] = await db.select().from(musicCollections).where(
      eq(musicCollections.id, collection.id),
    );
    assertEquals(updatedCollection.collectionTitle, "Updated Title");

    // 4. Verify old link is DELETED
    const oldLinks = await db.select().from(musicLinks).where(
      eq(musicLinks.id, oldLink.id),
    );
    assertEquals(oldLinks.length, 0);

    // 5. Verify new link is CREATED and ASSOCIATED
    const currentLinks = await db.select().from(musicLinks);
    // We might have links from other steps if they weren't cleaned up perfectly,
    // but since we clear tables at start of test and steps are sequential:
    // POST step created 2 links.
    // DELETE step created 1 and deleted it.
    // So we expect 2 (from POST) + 1 (new one) = 3 total links in DB?
    // Let's just check for the specific new link.
    const newLinkInDb = currentLinks.find((l) =>
      l.linkUrl === "http://new-link.com"
    );
    assertEquals(!!newLinkInDb, true);

    const junctions = await db.select().from(musicCollectionLinks).where(
      eq(musicCollectionLinks.musicCollectionId, collection.id),
    );
    assertEquals(junctions.length, 1);
    assertEquals(junctions[0].musicLinkId, newLinkInDb!.id);
  });

  await t.step("GET / supports sorting", async () => {
    // Clear all collections
    await db.delete(musicCollectionLinks);
    await db.delete(musicCollections);

    // Create 3 collections with distinct titles and dates
    await db.insert(musicCollections).values([
      {
        collectionTitle: "Album B",
        collectionCoverUrl: "http://cover.url",
        collectionNotes: "Notes",
        collectionDateYear: 2022,
        collectionDateMonth: 6,
        collectionKindId: kind.id,
      },
      {
        collectionTitle: "Album A",
        collectionCoverUrl: "http://cover.url",
        collectionNotes: "Notes",
        collectionDateYear: 2023,
        collectionDateMonth: 1,
        collectionKindId: kind.id,
      },
      {
        collectionTitle: "Album C",
        collectionCoverUrl: "http://cover.url",
        collectionNotes: "Notes",
        collectionDateYear: 2021,
        collectionDateMonth: 12,
        collectionKindId: kind.id,
      },
    ]);

    // Test: Sort by Title ASC
    const resAsc = await app.request("/music-collections?sortBy=collectionTitle&sortOrder=asc");
    const bodyAsc = await resAsc.json();
    assertEquals(bodyAsc.data[0].collectionTitle, "Album A");
    assertEquals(bodyAsc.data[1].collectionTitle, "Album B");
    assertEquals(bodyAsc.data[2].collectionTitle, "Album C");

    // Test: Sort by Date DESC
    const resDateDesc = await app.request("/music-collections?sortBy=collectionDate&sortOrder=desc");
    const bodyDateDesc = await resDateDesc.json();
    assertEquals(bodyDateDesc.data[0].collectionTitle, "Album A"); // 2023-01
    assertEquals(bodyDateDesc.data[1].collectionTitle, "Album B"); // 2022-06
    assertEquals(bodyDateDesc.data[2].collectionTitle, "Album C"); // 2021-12
  });

  // Cleanup
  // We can delete the db file, but client might hold lock.
  // Deno sqlite client usually doesn't hold lock if just querying.
  try {
    await Deno.remove("test.db");
    await Deno.remove("test.db-journal").catch(() => {});
  } catch (e) {
    console.log("Could not remove test.db (might be locked/busy):", e);
  }
});
