import { z } from "zod";

export const TokenClaimsSchema = z.object({
  actorId: z.string().min(1),
  // Can add exp, iat later if needed but usually standard jsonwebtoken handles those
});

export type TokenClaims = z.infer<typeof TokenClaimsSchema>;
export * from "./events.js";

// API Validations
export * from "./api/auth.validators.js";
export * from "./api/connections.validators.js";
export * from "./api/conversations.validators.js";
export * from "./api/messages.validators.js";
export * from "./api/users.validators.js";

// Realtime Payloads
export * from "./realtime/ws.payloads.js";
