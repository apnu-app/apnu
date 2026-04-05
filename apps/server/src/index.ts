import { auth } from "@apnu/auth";
import { env } from "@apnu/env/server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createFactory } from "hono/factory";
import { user } from "@apnu/db/schema/auth";

import usersRoute from "./routes/users";
import conversationsRoute from "./routes/conversations";
import locationRoute from "./routes/location";

import wsRoute, { websocket } from "./routes/ws";

type Env = {
  Variables: {
    user: typeof user.$inferSelect;
    session: any;
  };
};

const factory = createFactory<Env>();
const app = factory.createApp();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Error] ${c.req.method} ${c.req.url}:`, err);
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? undefined : err.message,
    },
    500
  );
});

// Auth Middleware mapping
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth")) {
    return next();
  }
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  c.set("session", session);
  return next();
});

// Not Found Handler
app.notFound((c) => {
  return c.json({ error: "Not Found", path: c.req.path }, 404);
});

// Auth Route
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Feature Routes - Chained for RPC support
const routes = app
  .route("/api/users", usersRoute)
  .route("/api/conversations", conversationsRoute)
  .route("/api/location", locationRoute)
  .route("/api/ws", wsRoute);

app.get("/", (c) => {
  return c.text("Apnu API is running");
});

// Special export for Bun to handle WebSockets
export default {
  fetch: app.fetch,
  websocket,
};
export type AppType = typeof routes;


