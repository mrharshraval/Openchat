import { z } from "zod";

export const RequestConnectionSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
  }),
});

export const AcceptConnectionSchema = z.object({
  body: z.object({
    connectionId: z.string().min(1, "Connection ID is required"),
  }),
});

export const CreateConnectionInternalSchema = z.object({
  body: z.object({
    actorId1: z.string(),
    actorId2: z.string(),
  }),
});

export const ConnectionActionInternalSchema = z.object({
  body: z.object({
    actorId: z.string(),
  }),
});
