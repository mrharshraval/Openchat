import { registry } from "../registry/registry.js";
import { structuredLog } from "../../lib/logger.js";
import { wsMessagesTotal } from "../../lib/metrics.js";
import { validateInboundMessage } from "./message.validator.js";
import { handleParsedMessage } from "./message.handler.js";

export class MessagingService {
  async handleMessage(connectionId: string, rawMessage: string) {
    const conn = registry.get(connectionId);
    if (!conn) {
      console.error(`Received message for unregistered connection: ${connectionId}`);
      return;
    }

    if (!conn.rateLimiter.allow()) {
      structuredLog("RATE_LIMIT_EXCEEDED", connectionId, { details: "Client sent messages too fast" }, "warn", conn);
      conn.ws.send(JSON.stringify({ type: "error", message: "Rate limit exceeded. Please wait a moment." }));
      return;
    }

    const validation = validateInboundMessage(connectionId, rawMessage, conn);
    if (!validation.success) {
      conn.ws.send(JSON.stringify({ type: "error", message: validation.error }));
      return;
    }

    const parsedMessage = validation.data as { type: string, payload: any };
    const { type, payload } = parsedMessage;
    const actorId = conn.actorId;
    const sessionId = ("sessionId" in payload && payload.sessionId) ? payload.sessionId : "N/A";

    structuredLog(type, connectionId, { requestId: validation.requestId, actorId, sessionId }, "info", conn);
    wsMessagesTotal.inc({ type, direction: "inbound" });

    if (!actorId) return;

    await handleParsedMessage(connectionId, type, payload, conn, validation.requestId!);
  }
}

export const messagingService = new MessagingService();
