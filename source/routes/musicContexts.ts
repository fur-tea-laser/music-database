import { Hono } from "@hono/hono";
import { db } from "../database/client.ts";
import { musicContexts } from "../database/schema.ts";
import { eq } from "drizzle-orm";

const musicContextRoutes = new Hono();

musicContextRoutes.get("/", async (c) => {
  const all = await db.select().from(musicContexts);
  return c.json(all);
});

musicContextRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(musicContexts).values(body).returning();
  return c.json(created, 201);
});

musicContextRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [context] = await db.select().from(musicContexts).where(
    eq(musicContexts.id, id),
  );
  if (!context) return c.json({ error: "Not found" }, 404);
  return c.json(context);
});

musicContextRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.update(musicContexts).set(body).where(eq(musicContexts.id, id));
  return c.body(null, 204);
});

musicContextRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(musicContexts).where(eq(musicContexts.id, id));
  return c.body(null, 204);
});

export { musicContextRoutes };
