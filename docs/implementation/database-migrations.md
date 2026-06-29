# Required Database Migrations (Phase 3)

Based on the 2026-06-28 Database Audit, the following schema additions and fixes are required.

## 1. Outbox and Audit Tables

Add these models to support the Event Pipeline and observability requirements:

```prisma
model DomainEvent {
  id             String   @id @default(cuid())
  eventType      String
  aggregateId    String
  aggregateType  String
  payload        Json
  publishedAt    DateTime?
  occurredAt     DateTime @default(now())

  @@index([publishedAt])   // outbox worker queries unpublished
  @@index([occurredAt])
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  event      String   // 'AUTH_SUCCESS', 'AUTH_FAILURE', 'CAPABILITY_DENIED'
  metadata   Json
  ip         String?
  occurredAt DateTime @default(now())

  @@index([actorId])
  @@index([occurredAt])
}
```

## 2. Refactoring Tasks
- **Remove `User.isGuest`**: Migrate entirely to `Actor.type`.
- **`Message.clientMessageId`**: Align to CUID (`@default(cuid())`).
- **`Connection` model**: Migrate to `actor1Id` / `actor2Id`.
- **Cascades**: Switch `Message` → `Participant` FK cascade to `SetNull` + soft delete.
- **Soft Deletes**: Standardize soft deletes using `deletedAt` across all models (e.g., replace `Conversation.status: DELETED` with `deletedAt`).
- **Partial Indexes**: Add partial indexes on `Message` where `deletedAt IS NULL` (Note: Prisma partial indexes require specific DB-level syntax or manual SQL migrations depending on Prisma version capabilities).
