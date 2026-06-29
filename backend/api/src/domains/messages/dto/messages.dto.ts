import { z } from "zod";
import {
  CreateMessageInternalSchema,
  EditMessageInternalSchema,
  ReactionInternalSchema,
  ReadInternalSchema,
} from "@moots/contracts";

export type CreateMessageInternalBody = z.infer<typeof CreateMessageInternalSchema>["body"];
export type EditMessageInternalBody = z.infer<typeof EditMessageInternalSchema>["body"];
export type ReactionInternalBody = z.infer<typeof ReactionInternalSchema>["body"];
export type ReadInternalBody = z.infer<typeof ReadInternalSchema>["body"];
