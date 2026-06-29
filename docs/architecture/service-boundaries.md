# Service Responsibility Boundaries

## The Fundamental Rule
**Realtime owns ephemeral state. API owns durable state. No exceptions.**

## Responsibility Matrix

| Responsibility | Owner | Rationale |
|---|---|---|
| Authentication (issue JWT) | API | Persists to `Session` |
| JWT verification | Both | Realtime verifies; API issues |
| Actor/Guest session creation | API | Persists to DB |
| Connection request / acceptance | API | Persists to `Connection` table |
| Conversation creation | API | Persists to `Conversation` table |
| Message persistence | API | Persists to `Message` table |
| Identity state machine | API | Persists `Participant.identityState` |
| Policy enforcement | API | `PolicyService.assertCapability()` |
| Presence (online/offline) | Realtime | Ephemeral; `lastSeenAt` update via API event |
| Typing indicators | Realtime | Ephemeral, never persisted |
| Delivery ACKs | Realtime | Ephemeral per-connection |
| Matchmaking queue | Realtime | Ephemeral → Redis sorted set for scale |
| Room management | Realtime | `conversationId → Set<connectionId>` |
| Reconnection grace timers | Realtime | Ephemeral → Redis TTL for scale |
| Heartbeats | Realtime | Per-connection |
| WS event routing | Realtime | Delivery only |
