import { z } from "zod";

export interface PlatformEvent<T> {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: string;
  correlationId: string;
  conversationId?: string;
  actorId?: string;
  payload: T;
}

export const ConversationProvisionedEventSchema = z.object({
  conversationId: z.string(),
  actorId1: z.string(),
  actorId2: z.string(),
  policyId: z.string(),
  metadata: z.any().optional(),
});

export const MessageSentEventSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderActorId: z.string(),
  sender: z.object({
    type: z.enum(["profile", "persona"]),
    data: z.any(),
  }),
  content: z.string(),
  createdAt: z.string(),
  replyToId: z.string().nullable().optional(),
});

export const MessageDeletedEventSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
});

export const MessageEditedEventSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
  content: z.string(),
});

export const ReactionUpdatedEventSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
  reactions: z.record(z.string(), z.array(z.string())),
});

export const ParticipantReadEventSchema = z.object({
  conversationId: z.string(),
  actorId: z.string(),
});

export const ConnectionRequestedEventSchema = z.object({
  connectionId: z.string(),
  senderActorId: z.string(),
  receiverActorId: z.string(),
});

export const ConnectionAcceptedEventSchema = z.object({
  connectionId: z.string(),
  actorId1: z.string(),
  actorId2: z.string(),
});

export const ConnectionRemovedEventSchema = z.object({
  connectionId: z.string(),
  actorId1: z.string(),
  actorId2: z.string(),
});

export const IdentityRevealConfirmedEventSchema = z.object({
  conversationId: z.string(),
  actorId: z.string(),
});

export const DomainEventSchema = z.discriminatedUnion("eventType", [
  z.object({ eventType: z.literal("conversation.provisioned"), payload: ConversationProvisionedEventSchema }),
  z.object({ eventType: z.literal("message.sent"), payload: MessageSentEventSchema }),
  z.object({ eventType: z.literal("message.deleted"), payload: MessageDeletedEventSchema }),
  z.object({ eventType: z.literal("message.edited"), payload: MessageEditedEventSchema }),
  z.object({ eventType: z.literal("reaction.updated"), payload: ReactionUpdatedEventSchema }),
  z.object({ eventType: z.literal("participant.read"), payload: ParticipantReadEventSchema }),
  z.object({ eventType: z.literal("connection.requested"), payload: ConnectionRequestedEventSchema }),
  z.object({ eventType: z.literal("connection.accepted"), payload: ConnectionAcceptedEventSchema }),
  z.object({ eventType: z.literal("connection.removed"), payload: ConnectionRemovedEventSchema }),
  z.object({ eventType: z.literal("identity.reveal_confirmed"), payload: IdentityRevealConfirmedEventSchema }),
]);

export type DomainEvent = z.infer<typeof DomainEventSchema>;

export type WSInboundEventType =
  | "join-queue"
  | "cancel-queue"
  | "join-chat"
  | "send-message"
  | "edit-message"
  | "send-reaction"
  | "typing-status"
  | "read-messages"
  | "connection:request"
  | "connection:accepted"
  | "connection:removed"
  | "participant:identity-revealed"
  | "participant:identity-hidden";

export type WSOutboundEventType =
  | "match-found"
  | "waiting"
  | "partner-joined"
  | "chat-history"
  | "message"
  | "message-edited"
  | "reaction-update"
  | "partner-typing"
  | "partner-seen-messages"
  | "connection:request"
  | "connection:accepted"
  | "connection:removed"
  | "participant:identity-revealed"
  | "participant:identity-hidden"
  | "partner-disconnected"
  | "error";
