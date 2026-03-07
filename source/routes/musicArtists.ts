import { Hono } from "@hono/hono";
import { db } from "../database/client.ts"; // Assume your DB instance is exported here
import { musicArtists } from "../database/schema.ts";
import { eq, sql, asc, desc } from "drizzle-orm";

const musicArtistRoutes = new Hono();

// All these paths will be relative to where we mount this app
musicArtistRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const sortBy = c.req.query("sortBy") || "id";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const offset = (page - 1) * limit;

  let orderBy;
  if (sortBy === "artistName") {
    orderBy = sortOrder === "asc" ? asc(musicArtists.artistName) : desc(musicArtists.artistName);
  } else {
    orderBy = sortOrder === "asc" ? asc(musicArtists.id) : desc(musicArtists.id);
  }

  const [artists, totalCountResult] = await Promise.all([
    db.select().from(musicArtists).limit(limit).offset(offset).orderBy(orderBy),
    db.select({ count: sql<number>`count(*)` }).from(musicArtists),
  ]);

  const totalCount = totalCountResult[0].count;

  return c.json({
    data: artists,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
  });
});

musicArtistRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(musicArtists).values(body).returning();
  return c.json(created, 201);
});

musicArtistRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [artist] = await db.select().from(musicArtists).where(
    eq(musicArtists.id, id),
  );
  if (!artist) return c.json({ error: "Not found" }, 404);
  return c.json(artist);
});

musicArtistRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.update(musicArtists).set(body).where(eq(musicArtists.id, id));
  return c.body(null, 204);
});

musicArtistRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(musicArtists).where(eq(musicArtists.id, id));
  return c.body(null, 204);
});

export { musicArtistRoutes };
