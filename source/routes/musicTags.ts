import { Hono } from "@hono/hono";
import { db } from "../database/client.ts";
import { musicTags } from "../database/schema.ts";
import { eq, sql, asc, desc } from "drizzle-orm";

const musicTagRoutes = new Hono();

musicTagRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const sortBy = c.req.query("sortBy") || "id";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const offset = (page - 1) * limit;

  let orderBy;
  if (sortBy === "tagLabel") {
    orderBy = sortOrder === "asc" ? asc(musicTags.tagLabel) : desc(musicTags.tagLabel);
  } else {
    orderBy = sortOrder === "asc" ? asc(musicTags.id) : desc(musicTags.id);
  }

  const [tags, totalCountResult] = await Promise.all([
    db.select().from(musicTags).limit(limit).offset(offset).orderBy(orderBy),
    db.select({ count: sql<number>`count(*)` }).from(musicTags),
  ]);

  const totalCount = totalCountResult[0].count;

  return c.json({
    data: tags,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
  });
});

musicTagRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(musicTags).values(body).returning();
  return c.json(created, 201);
});

musicTagRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [tag] = await db.select().from(musicTags).where(eq(musicTags.id, id));
  if (!tag) return c.json({ error: "Not found" }, 404);
  return c.json(tag);
});

musicTagRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.update(musicTags).set(body).where(eq(musicTags.id, id));
  return c.body(null, 204);
});

musicTagRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(musicTags).where(eq(musicTags.id, id));
  return c.body(null, 204);
});

export { musicTagRoutes };
