import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { auth } from "@apnu/auth";
import { db } from "@apnu/db";
import { message, conversation, conversationParticipant } from "@apnu/db/schema/chat";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// --- Types & Schemas ---
// ... (rest of the preamble is same)

const IncomingMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("message"),
    content: z.string().min(1).max(5000),
    tempId: z.string().optional(),
  }),
  z.object({
    type: z.literal("typing"),
    isTyping: z.boolean(),
  }),
]);

export type IncomingPayload = z.infer<typeof IncomingMessageSchema>;

interface WSContext {
  userId: string;
  userName: string | null;
  userImage: string | null;
  conversationId: string;
}

// Map<conversationId, Set<WebSocket>>
const rooms = new Map<string, Set<any>>();

export { websocket };

const wsRoute = new Hono();

wsRoute.get("/", upgradeWebSocket(async (c) => {
  const token = c.req.query("token");
  const conversationId = c.req.query("conversationId");

  if (!token || !conversationId) {
    return { status: 400, message: "Missing token or conversationId" };
  }

  // 1. Validate Token (Better Auth Session)
  const session = await auth.api.getSession({
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!session || !session.user) {
    return { status: 401, message: "Unauthorized" };
  }

  // 2. SECURITY: Verify Participant Authorization
  const isParticipant = await db.query.conversationParticipant.findFirst({
    where: and(
      eq(conversationParticipant.conversationId, conversationId),
      eq(conversationParticipant.userId, session.user.id)
    ),
  });

  if (!isParticipant) {
    return { status: 403, message: "Forbidden: You are not a participant" };
  }

  return {
    onOpen(_evt, ws) {
      if (!rooms.has(conversationId)) {
        rooms.set(conversationId, new Set());
      }
      rooms.get(conversationId)?.add(ws);
      
      const context = ws.raw as unknown as WSContext;
      context.userId = session.user.id;
      context.userName = session.user.name;
      context.userImage = session.user.image || null;
      context.conversationId = conversationId;
    },
    async onMessage(evt, ws) {
      try {
        const validation = IncomingMessageSchema.safeParse(JSON.parse(evt.data.toString()));
        if (!validation.success) return;

        const data = validation.data;
        const context = ws.raw as unknown as WSContext;
        const room = rooms.get(context.conversationId);

        if (data.type === "message") {
          const [savedMessage] = await db.insert(message).values({
            id: crypto.randomUUID(),
            senderId: context.userId,
            conversationId: context.conversationId,
            content: data.content,
            status: "sent",
          }).returning();

          await db.update(conversation)
            .set({ lastMessageAt: new Date(), updatedAt: new Date() })
            .where(eq(conversation.id, context.conversationId));

          if (room) {
            const payload = JSON.stringify({
              type: "message",
              message: {
                ...savedMessage,
                sender: { id: context.userId, name: context.userName, image: context.userImage }
              },
              tempId: data.tempId,
            });
            room.forEach((client) => {
              if (client.readyState === 1) client.send(payload);
            });
          }
        } else if (data.type === "typing") {
          // Broadcast typing status to others EXCEPT the sender
          if (room) {
            const payload = JSON.stringify({
              type: "typing",
              userId: context.userId,
              isTyping: data.isTyping,
            });
            room.forEach((client) => {
              if (client !== ws && client.readyState === 1) client.send(payload);
            });
          }
        }
      } catch (err) {
        console.error("[WS] Error:", err);
      }
    },
    onClose(_evt, ws) {
      const context = ws.raw as unknown as WSContext;
      const room = rooms.get(context.conversationId);
      if (room) {
        room.delete(ws);
        if (room.size === 0) rooms.delete(context.conversationId);
      }
    },
  };
}));


export default wsRoute;
