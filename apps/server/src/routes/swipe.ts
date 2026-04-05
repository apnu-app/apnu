import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "@apnu/db";
import { profile, swipe, match } from "@apnu/db/schema/swipe";
import { user } from "@apnu/db/schema/auth";
import { and, eq, inArray, notInArray, or, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const swipeRoute = new Hono<{
  Variables: {
    user: typeof user.$inferSelect;
  };
}>();

// ─── Validation schemas ───────────────────────────────────────────────────────

const swipeActionSchema = z.object({
  swipedId: z.string().min(1),
  direction: z.enum(["like", "pass", "superlike"]),
});

// ─── GET /api/swipe/feed ──────────────────────────────────────────────────────
swipeRoute.get("/feed", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    // Get my profile for gender preference + location context
    const myProfileRows = await db
      .select({
        interestedIn: profile.interestedIn,
        college: profile.college,
        city: profile.city,
      })
      .from(profile)
      .where(eq(profile.userId, currentUser.id))
      .limit(1);

    const myProfile = myProfileRows[0];
    const myInterestedIn = myProfile?.interestedIn ?? "both";
    const myCollege = myProfile?.college ?? null;
    const myCity = myProfile?.city ?? null;

    // IDs I've already swiped
    const swipedRows = await db
      .select({ id: swipe.swipedId })
      .from(swipe)
      .where(eq(swipe.swiperId, currentUser.id));
    const swipedIds = swipedRows.map((r) => r.id);

    // IDs I'm already matched with
    const matchedRows = await db
      .select({ u1: match.user1Id, u2: match.user2Id })
      .from(match)
      .where(
        and(
          eq(match.isActive, true),
          or(
            eq(match.user1Id, currentUser.id),
            eq(match.user2Id, currentUser.id)
          )
        )
      );
    const matchedIds = matchedRows.map((r) =>
      r.u1 === currentUser.id ? r.u2 : r.u1
    );

    const excludedIds = [currentUser.id, ...swipedIds, ...matchedIds];

    // Gender filter
    const genderCondition =
      myInterestedIn !== "both"
        ? eq(profile.gender, myInterestedIn)
        : undefined;

    // Order: same college = 1 (best), same city = 2, else 3
    const orderExpr = sql<number>`
      CASE
        WHEN ${profile.college} = ${myCollege ?? ""} AND ${myCollege} IS NOT NULL THEN 1
        WHEN ${profile.city} = ${myCity ?? ""} AND ${myCity} IS NOT NULL THEN 2
        ELSE 3
      END,
      RANDOM()
    `;

    const profiles = await db
      .select({
        userId: profile.userId,
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        photos: profile.photos,
        college: profile.college,
        course: profile.course,
        year: profile.year,
        city: profile.city,
        gender: profile.gender,
      })
      .from(profile)
      .where(
        and(
          notInArray(profile.userId, excludedIds),
          eq(profile.isProfileComplete, true),
          genderCondition
        )
      )
      .orderBy(orderExpr)
      .limit(20);

    return c.json({ profiles });
  } catch (error) {
    console.error("[Swipe Feed Error]:", error);
    return c.json({ error: "Failed to load feed" }, 500);
  }
});

// ─── POST /api/swipe/action ───────────────────────────────────────────────────
swipeRoute.post("/action", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const validation = swipeActionSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: "Invalid input", details: validation.error.format() }, 400);
  }

  const { swipedId, direction } = validation.data;

  try {
    let matchResult: {
      matched: boolean;
      matchId?: string;
      matchedProfile?: {
        userId: string;
        name: string;
        photos: string[] | null;
        college: string | null;
      } | null;
    } = { matched: false };

    // Atomic: swipe insert + optional match creation (Drizzle skill: use transactions)
    await db.transaction(async (tx) => {
      // Upsert swipe — conflict on unique (swiperId, swipedId) → update direction
      await tx
        .insert(swipe)
        .values({
          id: nanoid(),
          swiperId: currentUser.id,
          swipedId,
          direction,
        })
        .onConflictDoUpdate({
          target: [swipe.swiperId, swipe.swipedId],
          set: {
            direction,
            createdAt: new Date(),
          },
        });

      if (direction === "like" || direction === "superlike") {
        // Check for reverse like
        const reverseSwipe = await tx
          .select({ id: swipe.id })
          .from(swipe)
          .where(
            and(
              eq(swipe.swiperId, swipedId),
              eq(swipe.swipedId, currentUser.id),
              inArray(swipe.direction, ["like", "superlike"])
            )
          )
          .limit(1);

        if (reverseSwipe.length > 0) {
          // Guard: don't create duplicate match
          const existingMatch = await tx
            .select({ id: match.id })
            .from(match)
            .where(
              or(
                and(
                  eq(match.user1Id, currentUser.id),
                  eq(match.user2Id, swipedId)
                ),
                and(
                  eq(match.user1Id, swipedId),
                  eq(match.user2Id, currentUser.id)
                )
              )
            )
            .limit(1);

          if (existingMatch.length === 0) {
            // Consistent ordering for UNIQUE (user1Id, user2Id)
            const [u1, u2] =
              currentUser.id < swipedId
                ? [currentUser.id, swipedId]
                : [swipedId, currentUser.id];

            const matchId = nanoid();
            await tx.insert(match).values({
              id: matchId,
              user1Id: u1,
              user2Id: u2,
              isActive: true,
            });

            const matchedProfileRows = await tx
              .select({
                userId: profile.userId,
                name: profile.name,
                photos: profile.photos,
                college: profile.college,
              })
              .from(profile)
              .where(eq(profile.userId, swipedId))
              .limit(1);

            matchResult = {
              matched: true,
              matchId,
              matchedProfile: matchedProfileRows[0] ?? null,
            };
          }
        }
      }
    });

    return c.json(matchResult);
  } catch (error) {
    console.error("[Swipe Action Error]:", error);
    return c.json({ error: "Swipe action failed" }, 500);
  }
});

// ─── GET /api/swipe/matches ───────────────────────────────────────────────────
swipeRoute.get("/matches", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    // Fetch all active matches — join profile for the OTHER user
    const allMatches = await db
      .select({
        matchId: match.id,
        user1Id: match.user1Id,
        user2Id: match.user2Id,
        createdAt: match.createdAt,
      })
      .from(match)
      .where(
        and(
          eq(match.isActive, true),
          or(
            eq(match.user1Id, currentUser.id),
            eq(match.user2Id, currentUser.id)
          )
        )
      );

    if (allMatches.length === 0) return c.json({ matches: [] });

    const otherUserIds = allMatches.map((m) =>
      m.user1Id === currentUser.id ? m.user2Id : m.user1Id
    );

    // Fetch profiles for all other users
    const otherProfiles = await db
      .select({
        userId: profile.userId,
        name: profile.name,
        photos: profile.photos,
        college: profile.college,
      })
      .from(profile)
      .where(inArray(profile.userId, otherUserIds));

    const profileMap = new Map(otherProfiles.map((p) => [p.userId, p]));

    const matches = allMatches.map((m) => {
      const otherId = m.user1Id === currentUser.id ? m.user2Id : m.user1Id;
      const otherProfile = profileMap.get(otherId);
      return {
        matchId: m.matchId,
        userId: otherId,
        name: otherProfile?.name ?? "Unknown",
        photos: otherProfile?.photos ?? null,
        college: otherProfile?.college ?? null,
        lastActivity: m.createdAt,
      };
    });

    return c.json({ matches });
  } catch (error) {
    console.error("[Swipe Matches Error]:", error);
    return c.json({ error: "Failed to load matches" }, 500);
  }
});

export default swipeRoute;
