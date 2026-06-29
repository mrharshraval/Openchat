# Platform Event Architecture

## Event Pipeline Overview
The Moots event pipeline connects the API (durable state) to the Realtime service (ephemeral state and delivery). It guarantees that any durable mutation is eventually and reliably broadcast to connected clients without dropping events on node failure.

```text
Client Request
     │
     ▼
API (business logic)
     │
     ▼
 ┌─────────────────────────────────────────┐
 │  Single Prisma Transaction              │
 │   ├── Write to domain table (Message,   │
 │   │   Connection, Participant, etc.)    │
 │   └── Write to OutboxEvent table        │
 └─────────────────────────────────────────┘
     │
     ▼
Outbox Worker (polling or trigger)
     │
     ▼
Redis Pub/Sub  (moots:event:*)
     │
     ▼
Realtime Service (subscriber)
     │
     ▼
Connected WS Clients (room broadcast)
```

## Redis Command Queue
When a realtime client initiates a mutation (e.g., sending a message), Realtime enqueues a command to Redis. The API consumes this command, performs the durable write, and publishes the result.

```text
Realtime receives "send-message" from client
     │
     ▼
Redis Command Queue  (moots:command:send_message)
     │
     ▼
API Worker consumes command
     │
     ▼
 ┌──────────────────────────────────┐
 │  Transaction                     │
 │   ├── Insert Message             │
 │   ├── Update Conversation.last*  │
 │   └── Insert OutboxEvent         │
 └──────────────────────────────────┘
     │
     ▼
Outbox Worker → Redis → Realtime → Clients
```

## Redis Channel Naming Convention

**Events (API → Realtime):**
```text
moots:event:message.sent
moots:event:message.edited
moots:event:message.deleted
moots:event:reaction.updated
moots:event:conversation.created
moots:event:participant.typing        # ephemeral — no Outbox needed
moots:event:participant.read
moots:event:identity.reveal_initiated
moots:event:identity.reveal_confirmed
moots:event:connection.requested
moots:event:connection.accepted
moots:event:presence.online           # ephemeral
moots:event:presence.offline          # ephemeral
moots:event:matchmaking.matched
```

**Commands (Realtime → API):**
```text
moots:command:send_message
moots:command:edit_message
moots:command:send_reaction
moots:command:mark_read
moots:command:connection_request
moots:command:connection_accept
moots:command:connection_remove
moots:command:identity_reveal
```

## Platform Event Envelope

```typescript
// packages/contracts/src/events.ts
interface PlatformEvent<T> {
  eventId:        string;     // CUID2 — for deduplication
  eventType:      string;     // 'message.sent'
  version:        number;     // schema version
  occurredAt:     string;     // ISO-8601
  correlationId:  string;     // requestId for end-to-end tracing
  conversationId?: string;    // room routing hint for Realtime
  actorId?:       string;     // target actor for direct delivery
  payload:        T;
}
```
