import { redisSub } from "../../lib/redis.js";
import { logger } from "../../lib/logger.js";
import { DomainEventSchema } from "@moots/contracts";
import { handleDomainEvent } from "./events.js";

export function initializeEventListener() {
  logger.info("Initializing Redis Pub/Sub Event Listener...");

  redisSub.psubscribe("moots:event:*", (err) => {
    if (err) {
      logger.error({ err }, "Failed to subscribe to moots:event:*");
    } else {
      logger.info("Subscribed to moots:event:*");
    }
  });

  redisSub.on("pmessage", (pattern, channel, message) => {
    try {
      const envelope = JSON.parse(message);
      
      // Validate incoming Redis payloads using Zod schemas
      const validation = DomainEventSchema.safeParse({
        eventType: envelope.eventType,
        payload: envelope.payload,
      });

      if (!validation.success) {
        logger.error({ errors: validation.error.format(), channel, envelope }, "Received malformed Pub/Sub Event");
        return;
      }

      logger.debug({ eventType: validation.data.eventType, channel }, "Received Pub/Sub Event");

      handleDomainEvent(validation.data);

    } catch (err: any) {
      logger.error({ err, message }, "Error parsing or handling Pub/Sub message");
    }
  });
}
