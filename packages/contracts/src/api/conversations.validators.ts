import { z } from "zod";

export const GetUserConversationsSchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit:  z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const UpdateConversationSettingsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Conversation ID is required"),
  }),
  body: z.object({
    isPinned:    z.boolean().optional(),
    isArchived:  z.boolean().optional(),
    isMuted:     z.boolean().optional(),
    unreadCount: z.number().int().min(0).optional(),
  }),
});

export const DeleteConversationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Conversation ID is required"),
  }),
  body: z.object({
    clearOnly: z.boolean().optional(),
  }),
});

export const RevealIdentityInternalSchema = z.object({
  body: z.object({
    actorId: z.string(),
  })
});
