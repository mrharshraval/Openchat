# ADR-006: Outbox Pattern

**Status**: Accepted

## Context
The Moots API needs to publish events to the Realtime service via Redis whenever durable state changes (e.g., a message is sent or a connection is accepted). Historically, developers might write to Postgres and immediately publish to Redis within the same function.

## Problem
Directly publishing to Redis after a database write is not transactionally safe. If the database transaction commits but the Node process crashes before the Redis `PUBLISH` command completes, the event is lost forever. The database state and the event stream drift out of sync.

## Decision
We adopt the **Transactional Outbox Pattern** for all durable events.
1. Within a single Prisma transaction, the API writes the domain entity (e.g., `Message`) AND inserts an event record into a `DomainEvent` (outbox) table.
2. A separate background worker constantly polls or listens to the `DomainEvent` table.
3. The worker reads unpublished events, publishes them to Redis, and then marks them as published in the database.

## Consequences
- **Guaranteed Delivery**: Events are never lost, ensuring At-Least-Once delivery.
- **Complexity**: Requires a dedicated worker process and a new database table.
- **Idempotency**: Because delivery is At-Least-Once, downstream consumers (Realtime service and clients) must be idempotent (using `eventId` for deduplication).

## Alternatives
- Two-Phase Commit (Rejected: too complex, terrible performance).
- Listen/Notify in Postgres (Rejected: scaling limits with many listeners, Redis is better suited for high-throughput fan-out).
