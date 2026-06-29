# Moots Platform — Principal Engineer Architecture Review (v2)
> **Scope**: `backend/api`, `backend/realtime`, `packages/contracts`
> **Standard**: Enterprise-grade distributed systems engineering
> **Date**: 2026-06-28 · Revised post peer-review

---

## Executive Summary

The Moots platform has undergone significant foundational progress since the original audit in `implementation_plan.md`. JWT authentication is live end-to-end, the Actor model is partially implemented in the schema, the Policy Engine exists with capability-based presets, and the realtime service has been migrated to TypeScript with pino and prom-client.

However, the most critical structural gap remains: **the two services are not connected through a reliable event pipeline.** No Redis, no Outbox, no domain events. All business logic in the realtime service that touches durable state (connections, identity reveals, read receipts) still bypasses the API entirely. The messages domain is a stub. The platform is in Phase 1.5 of a 7-phase roadmap.

This revision incorporates peer-review feedback to:
- Elevate the **Outbox pattern** to first-class status in Phase 3
- Define **Aggregate Root ownership** explicitly  
- Expand the **`packages/contracts` vision** as the canonical platform contract
- Mark **internal HTTP** as a transitional bridge, not an end-state
- Add a **database evolution** review
- Name every **ADR** rather than deferring them
- Add a **long-term platform evolution roadmap**

---

## Scorecard

| Dimension | Score | Rationale |
|---|---|---|
| **Overall Architecture** | **4.5 / 10** | Strong schema & policy layer; fundamentally incomplete integration layer |
| **API Architecture** | **5.5 / 10** | Good domain structure, DI container, pino, auth middleware; but actorId/userId mismatch and no refresh tokens |
| **Realtime Architecture** | **3.5 / 10** | JWT, TypeScript, metrics — good; still in-memory only, RT-08 still live |
| **Database Architecture** | **5.5 / 10** | Advanced schema; but `isGuest` ghost column, UUID/CUID inconsistency, no Outbox table, no audit tables |
| **Security Score** | **5.0 / 10** | JWT exists; rate limiting exists; but no refresh tokens, origin check prod-only |
| **Scalability Score** | **2.5 / 10** | No Redis = single realtime node cap; no shared state |
| **Maintainability Score** | **6.0 / 10** | Clean folder structure; partial DI; `any` types present; zero tests |
| **Privacy Architecture** | **7.0 / 10** | Actor model, identity state machine, MessageSerializer, and policy presets are best-in-class for this stage |
| **Developer Experience** | **4.5 / 10** | Good conventions; no tests; no CI; PLAN.md stale |

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Completed |
| 🟡 | Partially completed |
| ❌ | Missing |
| ⚠️ | Architectural issue or regression |
| 🔄 | Recommendation: implementation plan change |
| 💡 | New architectural recommendation |

---

## Part I — What Changed Since the Original Audit

### ✅ Completed

- **RT-01**: JWT verification on WS handshake — `verifyToken` from `@moots/contracts`, query param `?token=`
- **RT-04**: Realtime fully migrated to TypeScript
- **RT-05**: Message IDs use `crypto.randomUUID()`
- **RT-06**: Timestamps use `new Date().toISOString()`
- **RT-09**: Zod aligned to `^4.4.3` across both services
- **RT-16**: `userToIds` reverse index in `ConnectionRegistry`
- **RT-20**: `structuredLog` extracted from `messaging.ts` → `lib/logger.ts`
- **P1.1**: JWT middleware (`authenticate.middleware.ts`) with `req.user` augmentation
- **P1.3**: CORS whitelist via `env.ALLOWED_ORIGINS`
- **P1.4**: Rate limiting (`authRateLimiter`, `readRateLimiter`) on all routes
- **P1.5**: OTP uses `crypto.randomInt()` — CSPRNG
- **P1.6**: Multi-step writes wrapped in `prisma.$transaction()`
- **P2.1**: pino logger in API
- **P2.4**: `BaseRepository` + `TransactionClient` abstraction
- **P2.6–P2.9**: Realtime TypeScript, Zod v4, pino, prom-client metrics
- **P2.12**: Reverse index in `ConnectionRegistry`
- **P3.3**: Policy domain, `Capability` enum, `PolicyService.assertCapability()`, 4 presets
- **P3.4 partial**: `MessageSerializer` + `IdentityState` enum in schema
- **P3.5a–c partial**: `GuestSession`, `Actor`, `ActorType` in schema; guest login and promotion in `AuthService`
- **Schema**: `Participant.actorId`, `Participant.persona`, `Participant.identityState`, `Conversation.policyId`, `Message.senderParticipantId`, `Message.deletedAt`
- **P2.8 partial**: `packages/contracts` bootstrapped with `TokenClaims`
- **Conversation Retrieval**: `findConversationSummaries` with cursor pagination, `lastMessagePreview/lastActivityAt` denormalized on `Conversation`

### 🟡 Partially Completed

- **P2.3**: DI container covers Auth only; conversations/connections use `new X()` inline
- **P3.5**: Actor model in schema; `resolveIdentity` chain not wired into message fetch
- **P3.6**: No `EventBus`, no Redis publisher, no domain events
- **packages/contracts**: `TokenClaims` only — no WS events, no platform event envelopes
