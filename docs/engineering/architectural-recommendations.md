# Architectural Recommendations & Standards
> **Date**: 2026-06-28

These are ongoing architectural recommendations that should become standard engineering practice across the platform.

### 💡 REC-01 · Keep JWT Lean — `actorId` Only
Sign tokens with `{ actorId }` only. Remove `userId` and `email` from the payload — they couple the token to the User entity. All resolution happens server-side.

### 💡 REC-02 · Replace `COUNT` + `findMany` with Single Query
```typescript
const conversations = await prisma.conversation.findMany({ where: { ... }, take: limit + 1, ... });
if (conversations.length === 0) return { items: [], nextCursor: null };
```
One DB round trip instead of two.

### 💡 REC-03 · Standardize Soft Delete
`Message` uses `deletedAt`; `Conversation` uses `status: DELETED`. Pick one strategy and apply it consistently. Recommended: `deletedAt DateTime?` on all soft-deleted entities, with partial indexes `WHERE deletedAt IS NULL`.

### 💡 REC-04 · Policy Engine → Data-Driven
Move `POLICIES` from code constants to a `Policy` Prisma model. `Conversation.policyId` becomes a proper FK. This enables per-conversation policy customization without code deploys.

### 💡 REC-05 · `handleDisconnect` Reverse Index
Add `connectionId → sessionId` reverse map in `SessionService` (parallel to what `ConnectionRegistry` already does). Eliminates the O(sessions × connections) linear scan on every disconnect.

### 💡 REC-06 · Remove `any` with Prisma Inference
Leverage Prisma's generated types instead of manually casting or using `any`.
