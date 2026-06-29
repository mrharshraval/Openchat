import { Prisma } from "@prisma/client";
import { DomainEvent } from "@moots/contracts";

export class EventBus {
  /**
   * Publishes an event to the Outbox using the current transaction.
   * This ensures that the event is committed atomically with the domain state changes.
   */
  static async publish(
    tx: Prisma.TransactionClient,
    eventType: DomainEvent["eventType"],
    aggregateId: string,
    aggregateType: string,
    payload: any
  ) {
    await tx.domainEvent.create({
      data: {
        eventType,
        aggregateId,
        aggregateType,
        payload,
      },
    });
  }
}
