import { z } from "zod";
import {
  RequestConnectionSchema,
  AcceptConnectionSchema,
  CreateConnectionInternalSchema,
  ConnectionActionInternalSchema
} from "@moots/contracts";

export type RequestConnectionInput = z.infer<typeof RequestConnectionSchema>["body"];
export type AcceptConnectionInput = z.infer<typeof AcceptConnectionSchema>["body"];
export type CreateConnectionInternalInput = z.infer<typeof CreateConnectionInternalSchema>["body"];
export type ConnectionActionInternalInput = z.infer<typeof ConnectionActionInternalSchema>["body"];

