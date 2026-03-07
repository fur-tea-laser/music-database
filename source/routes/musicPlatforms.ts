import { Hono } from "@hono/hono";
import { db } from "../database/client.ts";
import { musicPlatforms } from "../database/schema.ts";
import { eq } from "drizzle-orm";

const musicPlatformRoutes = new Hono();

musicPlatformRoutes.get("/", async (c) => {
  const all = await db.select().from(musicPlatforms);
  return c.json(all);
});

musicPlatformRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(musicPlatforms).values(body).returning();
  return c.json(created, 201);
});

musicPlatformRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [platform] = await db.select().from(musicPlatforms).where(
    eq(musicPlatforms.id, id),
  );
  if (!platform) return c.json({ error: "Not found" }, 404);
  return c.json(platform);
});

musicPlatformRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.update(musicPlatforms).set(body).where(eq(musicPlatforms.id, id));
  return c.body(null, 204);
});

musicPlatformRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(musicPlatforms).where(eq(musicPlatforms.id, id));
  return c.body(null, 204);
});

export { musicPlatformRoutes };
