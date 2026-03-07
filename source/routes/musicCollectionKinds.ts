import { Hono } from "@hono/hono";
import { db } from "../database/client.ts";
import { musicCollectionKind } from "../database/schema.ts";
import { eq } from "drizzle-orm";

const musicCollectionKindRoutes = new Hono();

musicCollectionKindRoutes.get("/", async (c) => {
  const all = await db.select().from(musicCollectionKind);
  return c.json(all);
});

musicCollectionKindRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(musicCollectionKind).values(body)
    .returning();
  return c.json(created, 201);
});

musicCollectionKindRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [kind] = await db.select().from(musicCollectionKind).where(
    eq(musicCollectionKind.id, id),
  );
  if (!kind) return c.json({ error: "Not found" }, 404);
  return c.json(kind);
});

musicCollectionKindRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.update(musicCollectionKind).set(body).where(
    eq(musicCollectionKind.id, id),
  );
  return c.body(null, 204);
});

musicCollectionKindRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(musicCollectionKind).where(eq(musicCollectionKind.id, id));
  return c.body(null, 204);
});

export { musicCollectionKindRoutes };
