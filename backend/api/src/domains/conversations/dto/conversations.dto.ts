import { z } from "zod";
import {
  GetUserConversationsSchema,
  UpdateConversationSettingsSchema,
  DeleteConversationSchema,
  RevealIdentityInternalSchema
} from "@moots/contracts";

export interface ConversationSummaryDTO {
  id: string;
  type: string;
  name: string | null;
  status: string;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  unreadCount: number;
  participants: Array<{
    id:       string;
    name:     string | null;
    username: string | null;
    image:    string | null;
    email:    string;
  }>;
  lastMessagePreview: string | null;
  lastMessageId: string | null;
  lastActivityAt: Date | string;
  updatedAt: Date | string;
}

export type GetUserConversationsInput = z.infer<typeof GetUserConversationsSchema>;
export type UpdateConversationSettingsInput = z.infer<typeof UpdateConversationSettingsSchema>;
export type DeleteConversationInput = z.infer<typeof DeleteConversationSchema>;
export type RevealIdentityInternalInput = z.infer<typeof RevealIdentityInternalSchema>["body"];
