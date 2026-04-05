import { Hono } from "hono";
import { db } from "@apnu/db";
import { user } from "@apnu/db/schema/auth";
import { and, ne, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { z } from "zod";

const usersRoute = new Hono<{
  Variables: {
    user: typeof user.$inferSelect;
  };
}>();

const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
});

// GET /api/users/search?q=...
usersRoute.get("/search", authMiddleware, async (c) => {
  const query = c.req.query();
  const validation = searchQuerySchema.safeParse(query);

  if (!validation.success) {
    return c.json({ error: "Invalid query parameters", details: validation.error.format() }, 400);
  }

  const { q } = validation.data;
  const currentUser = c.get("user");

  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    if (!q.trim()) return c.json([]);

    const formattedQuery = q.trim().split(/\s+/).map(term => `${term}:*`).join(" & ");

    const results = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(
        and(
          ne(user.id, currentUser.id),
          sql`to_tsvector('english', coalesce(${user.name}, '') || ' ' || coalesce(${user.email}, '')) @@ to_tsquery('english', ${formattedQuery})`
        )
      )
      .limit(20);

    return c.json(results);
  } catch (error) {
    console.error("[Users Search Error]:", error);
    try {
      const fallbackResults = await db
        .select({ id: user.id, name: user.name, email: user.email, image: user.image })
        .from(user)
        .where(and(ne(user.id, currentUser.id), sql`${user.name} ILIKE ${`%${q}%`}`))
        .limit(20);
      return c.json(fallbackResults);
    } catch (fallbackError) {
      return c.json({ error: "Search failed unexpectedly" }, 500);
    }
  }
});

export default usersRoute;



