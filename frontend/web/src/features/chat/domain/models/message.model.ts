export interface Message {
  id: string;
  clientMessageId?: string;
  conversationId?: string;
  senderId?: string;
  sender: "user" | "stranger";
  status?: "SENDING" | "DELIVERED" | "PERSISTED" | "FAILED";
  content: string;
  time: string;
  createdAt?: string;
  updatedAt?: string;
  seen?: boolean;
  edited?: boolean;
  reactions?: Record<string, string[]>;
  replyTo?: {
    id: string;
    sender: "user" | "stranger";
    content: string;
  };
}
