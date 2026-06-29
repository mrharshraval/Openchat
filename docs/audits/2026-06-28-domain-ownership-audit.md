# Domain Ownership Audit
> **Date**: 2026-06-28

## API Domain Status

| Domain | Routes | Controller | Service | Repository | Auth | Issues |
|---|---|---|---|---|---|---|
| `auth` | ✅ | ✅ | ✅ | ✅ | N/A | No refresh endpoint |
| `users` | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| `conversations` | ✅ | ✅ | ✅ | ✅ | ✅ | CRIT-05: `actorId`/`userId` mismatch |
| `connections` | ✅ | ✅ | ✅ | ✅ | ✅ | CRIT-06: `userId` not `actorId` |
| `messages` | ❌ | ❌ | Stub | Stub | N/A | CRIT-03 |
| `policy` | Service only | ❌ | ✅ | Stub | N/A | Correct for internal-only |

## Realtime Service Status

| Responsibility | Status | Classification | Issues |
|---|---|---|---|
| JWT Handshake Auth | ✅ | Security | `any` cast on decoded user |
| Connection Registry | ✅ | Ephemeral | - |
| Matchmaking | ✅ in-memory | Ephemeral | Cannot scale beyond 1 node |
| Message Delivery | 🟡 | Durable | Messages in-memory only — CRIT-03 |
| Identity Reveal | ⚠️ | **Durable** | Forwarded raw — CRIT-02 |
| Connection Events | ⚠️ | **Durable** | Forwarded raw — CRIT-02 |
| Typing Status | ✅ | Ephemeral | Correct boundary |
| Read Receipts | 🟡 | Durable | In-memory only |
| Heartbeat | ✅ | Ephemeral | - |
| Graceful Shutdown | ✅ | Ops | - |
| Metrics | ✅ | Ops | prom-client |
| Redis Pub/Sub | ❌ | Infrastructure | CRIT-04 |
| Per-connection Rate Limiting | ❌ | Security | RT-17 |

## `packages/contracts` Status

| Item | Status |
|---|---|
| `TokenClaims` | ✅ |
| Platform event envelope | ❌ |
| WS client→server event map | ❌ |
| WS server→client event map | ❌ |
| Capability enum | ❌ (lives in API only) |
| Shared error codes | ❌ |
