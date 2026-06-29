# Database Evolution Audit
> **Date**: 2026-06-28

## Current State Findings

| Item | Finding | Action |
|---|---|---|
| `User.isGuest` | Ghost column — two sources of truth alongside `Actor.type` | Remove; migrate to `Actor.type` |
| `Message.clientMessageId` uses `@default(uuid())` | Inconsistent — all other IDs use CUID (`@default(cuid())`) | Align to CUID or justify the divergence |
| `Connection` references `User`, not `Actor` | Incomplete Actor abstraction | Migrate to `actor1Id/actor2Id` |
| Cascade rules | `onDelete: Cascade` on critical paths is correct; verify `Message` → `Participant` cascade is intentional (should be soft-delete) | Switch Message FK to `SetNull` + soft delete |
| Soft delete | `Message.deletedAt` exists ✅; `Conversation` uses `status: DELETED` not `deletedAt` | Standardize: all soft deletes use `deletedAt` timestamp |
| Outbox table | Missing | Add `DomainEvent` outbox table in Phase 3 |
| Audit tables | Missing | Add `AuditLog` for auth events, capability denials, WS auth failures |
| Partial indexes | None present | Add `WHERE deletedAt IS NULL` partial indexes on `Message` |
| `@@index([lastActivityAt])` | ✅ Present on `Conversation` | - |
| `@@index([conversationId, createdAt])` | ✅ Present on `Message` | - |
| `@@unique([actorId, conversationId])` | ✅ Present on `Participant` | - |
