# ADR-003: Realtime Owns Ephemeral State

**Status**: Accepted

## Context
With the API strictly owning all durable state (ADR-002), the responsibility of the Realtime service needs clear definition. The platform requires high-frequency, low-latency updates for features like typing indicators, presence, matchmaking, and delivery acknowledgments. 

## Problem
Writing high-frequency, transient data (like typing indicators or seconds-long matchmaking states) to a durable PostgreSQL database causes massive write amplification, locking contention, and rapid vacuuming issues. It does not scale.

## Decision
The Realtime service strictly owns all ephemeral state.
This includes:
- Typing indicators
- User presence (online/offline)
- Matchmaking queues
- Ephemeral delivery ACKs
- WebSocket room routing

These states are stored entirely in memory (and eventually Redis for cross-node scale). They are never written to Postgres.

## Consequences
- The database is shielded from high-throughput noise.
- The Realtime service acts as an ultra-fast event router.
- When the Realtime service restarts, ephemeral state is lost. This is acceptable for typing and presence (clients will re-broadcast) but requires Redis to ensure matchmaking queues survive node restarts in the future.

## Alternatives
- Using Postgres for everything (Rejected: will not scale, unnecessary IO overhead).
- Using a hybrid DB approach (Accepted: Redis will be used for shared ephemeral state in Phase 3).
