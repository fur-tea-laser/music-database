import { Hono } from "@hono/hono";
import { db } from "../database/client.ts";
import { musicLinks, musicPlatforms } from "../database/schema.ts";
import { eq, sql, asc, desc } from "drizzle-orm";

const musicLinkRoutes = new Hono();

musicLinkRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const sortBy = c.req.query("sortBy") || "id";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const offset = (page - 1) * limit;

  let orderBy;
  if (sortBy === "linkUrl") {
    orderBy = sortOrder === "asc" ? asc(musicLinks.linkUrl) : desc(musicLinks.linkUrl);
  } else {
    orderBy = sortOrder === "asc" ? asc(musicLinks.id) : desc(musicLinks.id);
  }

  const [links, totalCountResult] = await Promise.all([
    db.query.musicLinks.findMany({
      limit,
      offset,
      orderBy,
      with: {
        platform: true,
      },
    }),
    db.select({ count: sql<number>`count(*)` }).from(musicLinks),
  ]);

  const totalCount = totalCountResult[0].count;

  return c.json({
    data: links,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
  });
});

musicLinkRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(musicLinks).values(body).returning();
  return c.json(created, 201);
});

musicLinkRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [row] = await db
    .select({
      link: musicLinks,
      platform: musicPlatforms,
    })
    .from(musicLinks)
    .leftJoin(musicPlatforms, eq(musicLinks.musicPlatformId, musicPlatforms.id))
    .where(eq(musicLinks.id, id));

  if (!row) return c.json({ error: "Not found" }, 404);

  const result = {
    ...row.link,
    platform: row.platform,
  };

  return c.json(result);
});

musicLinkRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.update(musicLinks).set(body).where(eq(musicLinks.id, id));
  return c.body(null, 204);
});

musicLinkRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(musicLinks).where(eq(musicLinks.id, id));
  return c.body(null, 204);
});

export { musicLinkRoutes };
