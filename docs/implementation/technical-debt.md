# Technical Debt & Open Critical Issues

## Part II — Critical Issues (Still Open)

### ⚠️ CRIT-01 · No Refresh Tokens

`jwtService.signRefresh()` exists but is never called. Access tokens expire in 15 minutes with no renewal path. Every user is forcibly logged out after 15 minutes. Any active WebSocket connection cannot renew its token without fully reconnecting.

**Fix**:
- `POST /api/auth/refresh` — HTTP-only cookie, issues new access token
- Store refresh tokens in `Session` table with revocation
- WS client re-authenticates before reconnecting

**Priority**: P0 — UX blocker today.

---

### ⚠️ CRIT-02 · RT-08 Still Live — Durable State Mutations in Realtime

`messaging.ts:344–369` still forwards `connection:request`, `connection:accepted`, `connection:removed`, `participant:identity-revealed`, and `participant:identity-hidden` as raw relay events with no validation, no policy check, and no persistence.

```typescript
case "connection:request":
case "connection:accepted":
case "connection:removed":
case "participant:identity-revealed":
case "participant:identity-hidden": {
  partnerConn.ws.send(JSON.stringify({ type, payload })); // No validation. No DB write.
  break;
}
```

> **Service Boundary Rule**: Realtime owns **ephemeral state** — presence, typing, delivery ACKs, session grace timers, matchmaking queue. API owns **durable state** — connections, identity transitions, read counts, message persistence. Any event that mutates a Postgres row must flow through the API, not through Realtime.

These events must become API calls (HTTP or Redis command queue, see Phase 3). This is not a policy preference — it is a data integrity requirement.

**Priority**: P0 — privacy violation and data integrity failure.

---

### ⚠️ CRIT-03 · Messages Domain Is a Stub

The `messages` domain has `MessageSerializer` and `message.types.ts` only. No controller, no route, no service for `POST /api/messages`. No `messagesRouter` in `app.ts`. All messages live in `session.messages[]` in realtime process memory.

**Priority**: P0.

---

### ⚠️ CRIT-04 · API ↔ Realtime Completely Disconnected

No Redis. No domain events. No shared state. One realtime instance maximum. Matchmaking queue lost on restart.

**Priority**: P0.

---

### ⚠️ CRIT-05 · Active Bug — `actorId`/`userId` Mismatch in Conversations

`conversations.service.ts` passes `userId` to `updateParticipantSettings` (which uses `actorId_conversationId` unique key) and finds participants by `p.userId` (which doesn't exist on `Participant` — it has `actorId`). Every authenticated conversation API call silently returns wrong data.

**Priority**: P0 — active bug.

---

### ⚠️ CRIT-06 · `Connection` Model Still `User`-to-`User`

`Connection` references `user1Id/user2Id → User`, not `actorId → Actor`. Guest users cannot form connections. Actor abstraction is incomplete.

**Priority**: P1.

---

### ⚠️ CRIT-07 · `User.isGuest` Ghost Column

`User.isGuest Boolean @default(false)` still exists alongside `Actor.type`. Two sources of truth. All checks must migrate to `Actor.type`.

**Priority**: P1.

---

### ⚠️ CRIT-08 · `join-chat` Has No Ownership Verification

`session.ts` now throws if session doesn't exist (on-demand creation removed ✅). But any authenticated user who knows a `sessionId` can still call `join-chat` and inject themselves as a participant — there is no check that the authenticated `actorId` is in `session.users[]`.

**Priority**: P1.

---

### ⚠️ CRIT-09 · Origin Check Still Prod-Only

```typescript
if (env.NODE_ENV === "production") { // still there
```

**Priority**: P1 — was flagged as P2 in original plan, remains unfixed.

---

## Summary of Action Items by Priority

| Priority | Count | Key Items |
|---|---|---|
| **P0** | 8 | Refresh tokens, `actorId`/`userId` bug, message persistence, RT-08, Redis + Outbox |
| **P1** | 14 | Origin check, `userId` stripping from WS payloads, session ownership, actor Connection, rate limiting, CI, ADRs |
| **P2** | 10 | DI container, tests, OpenAPI, observability, Device model, data-driven policies |
| **P3** | 5 | JWT lean, Platform evolution docs, PLAN.md retirement |
