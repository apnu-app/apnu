import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ─── Profiles ────────────────────────────────────────────────────────────────

export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  bio: text("bio"),
  gender: text("gender"), // male | female | other
  interestedIn: text("interested_in"), // male | female | both
  photos: text("photos").array(), // text[] of URLs, max 6
  college: text("college"),
  course: text("course"),
  year: integer("year"),
  city: text("city"),
  isProfileComplete: boolean("is_profile_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Swipes ──────────────────────────────────────────────────────────────────

export const swipe = pgTable(
  "swipe",
  {
    id: text("id").primaryKey(),
    swiperId: text("swiper_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    swipedId: text("swiped_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    direction: text("direction").notNull(), // like | pass | superlike
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("swipe_swiper_swiped_unique_idx").on(
      table.swiperId,
      table.swipedId
    ),
    index("swipe_swiperId_idx").on(table.swiperId),
    index("swipe_swipedId_idx").on(table.swipedId),
  ]
);

// ─── Matches ─────────────────────────────────────────────────────────────────

export const match = pgTable(
  "match",
  {
    id: text("id").primaryKey(),
    user1Id: text("user1_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    user2Id: text("user2_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("match_user1_user2_unique_idx").on(table.user1Id, table.user2Id),
    index("match_user1Id_idx").on(table.user1Id),
    index("match_user2Id_idx").on(table.user2Id),
  ]
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));

export const swipeRelations = relations(swipe, ({ one }) => ({
  swiper: one(user, {
    fields: [swipe.swiperId],
    references: [user.id],
    relationName: "swiper",
  }),
  swiped: one(user, {
    fields: [swipe.swipedId],
    references: [user.id],
    relationName: "swiped",
  }),
}));

export const matchRelations = relations(match, ({ one }) => ({
  user1: one(user, {
    fields: [match.user1Id],
    references: [user.id],
    relationName: "matchUser1",
  }),
  user2: one(user, {
    fields: [match.user2Id],
    references: [user.id],
    relationName: "matchUser2",
  }),
}));

// Extend user relations to include swipes and matches
export const userSwipeRelations = relations(user, ({ many, one }) => ({
  profile: one(profile, {
    fields: [user.id],
    references: [profile.userId],
  }),
  swipesMade: many(swipe, { relationName: "swiper" }),
  swipesReceived: many(swipe, { relationName: "swiped" }),
  matchesAsUser1: many(match, { relationName: "matchUser1" }),
  matchesAsUser2: many(match, { relationName: "matchUser2" }),
}));

// ─── Exported Types ───────────────────────────────────────────────────────────

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
export type Swipe = typeof swipe.$inferSelect;
export type Match = typeof match.$inferSelect;
