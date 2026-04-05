import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@apnu/db";
import { userLocations } from "@apnu/db/schema/location";
import { user } from "@apnu/db/schema/auth";
import { eq, and, sql } from "drizzle-orm";
import type { AppType } from "../index";

const locationRoute = new Hono<AppType["_def"]["env"]>();

// POST /api/location/update
locationRoute.post(
  "/update",
  zValidator(
    "json",
    z.object({
      latitude: z.number(),
      longitude: z.number(),
      isVisible: z.boolean().optional(),
    }),
  ),
  async (c) => {
    const session = c.get("session");
    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { latitude, longitude, isVisible } = c.req.valid("json");
    
    await db
      .insert(userLocations)
      .values({
        userId: session.user.id,
        latitude,
        longitude,
        isVisible: isVisible ?? true,
        lastSeen: new Date(),
      })
      .onConflictDoUpdate({
        target: userLocations.userId,
        set: {
          latitude,
          longitude,
          isVisible: isVisible ?? true,
          lastSeen: new Date(),
        },
      });

    return c.json({ ok: true });
  },
);

// GET /api/location/nearby
locationRoute.get(
  "/nearby",
  zValidator(
    "query",
    z.object({
      lat: z.string(),
      lng: z.string(),
      radius: z.string().optional(),
    }),
  ),
  async (c) => {
    const session = c.get("session");
    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { lat, lng, radius } = c.req.valid("query");
    const radiusKm = Number(radius) || 5;
    const reqLat = Number(lat);
    const reqLng = Number(lng);

    if (isNaN(reqLat) || isNaN(reqLng)) {
      return c.json({ error: "Invalid coordinates" }, 400);
    }

    // Haversine formula
    const distanceScore = sql<number>`
      (6371 * acos(
        cos(radians(${reqLat})) * cos(radians(${userLocations.latitude})) *
        cos(radians(${userLocations.longitude}) - radians(${reqLng})) +
        sin(radians(${reqLat})) * sin(radians(${userLocations.latitude}))
      ))
    `;

    // 10 minutes ago
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

    const nearbyUsers = await db
      .select({
        userId: userLocations.userId,
        name: user.name,
        image: user.image,
        latitude: userLocations.latitude,
        longitude: userLocations.longitude,
        distanceKm: distanceScore,
      })
      .from(userLocations)
      .innerJoin(user, eq(userLocations.userId, user.id))
      .where(
        and(
          sql`${distanceScore} <= ${radiusKm}`,
          sql`${userLocations.lastSeen} > ${tenMinsAgo}`,
          eq(userLocations.isVisible, true),
          sql`${userLocations.userId} != ${session.user.id}`
        )
      )
      .orderBy(distanceScore)
      .limit(50);

    return c.json({ users: nearbyUsers });
  },
);

export default locationRoute;
