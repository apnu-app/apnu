import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, doublePrecision, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userLocations = pgTable(
  "user_locations",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    lastSeen: timestamp("last_seen").defaultNow().notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
  },
  (table) => [
      index("location_userId_idx").on(table.userId),
      // GiST indices are usually better for geospatial, but given basic haversine without postgis, 
      // simple indices on lat/lng can sometimes help, but not stringently required for now.
  ],
);

export const userLocationsRelations = relations(userLocations, ({ one }) => ({
  user: one(user, {
    fields: [userLocations.userId],
    references: [user.id],
  }),
}));
