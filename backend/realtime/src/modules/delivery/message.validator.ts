import { InboundMessageSchema } from "@moots/contracts";
import { structuredLog } from "../../lib/logger.js";
import { ConnectionMetadata } from "../registry/registry.js";
import crypto from "crypto";

export function validateInboundMessage(connectionId: string, rawMessage: string, conn: ConnectionMetadata) {
  const requestId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);
  
  try {
    const json = JSON.parse(rawMessage);
    const validation = InboundMessageSchema.safeParse(json);
    
    if (!validation.success) {
      structuredLog(
        "VALIDATION_FAILED",
        connectionId,
        { requestId, details: JSON.stringify(validation.error.format()) },
        "warn",
        conn
      );
      return { success: false, error: "Invalid message schema", requestId };
    }
    
    return { success: true, data: validation.data, requestId };
  } catch (err: any) {
    structuredLog(
      "PARSE_ERROR",
      connectionId,
      { requestId, details: err.message },
      "error",
      conn
    );
    return { success: false, error: "Malformed JSON message", requestId };
  }
}
