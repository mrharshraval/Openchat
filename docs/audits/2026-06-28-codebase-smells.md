# Codebase Smell Catalogue
> **Date**: 2026-06-28

## API

| ID | Location | Issue |
|---|---|---|
| S-01 | `conversations.service.ts:18` | `.find(p => p.userId === userId)` — `userId` doesn't exist on `Participant` |
| S-02 | `conversations.service.ts:48` | Passes `userId` to `updateParticipantSettings`; should be `actorId` |
| S-03 | `conversations.repository.ts:7` | `COUNT` + `findMany` double-query; replace with single `findMany` + empty-check |
| S-04 | `container.ts` | DI only covers Auth; all other domains `new X()` inline |
| S-05 | `auth.service.ts:133` | JWT embeds `userId` + `email` + `actorId`; should be `actorId` only |
| S-06 | `jwt.service.ts:12` | 15m access token with no refresh path |
| S-07 | `schema.prisma:88` | `User.isGuest` ghost column |
| S-08 | `policy-engine.service.ts:38` | `Object.values(POLICIES)` O(n) scan; use `Map` keyed by `policyId` |
| S-09 | `conversations.service.ts` | `new ConversationsRepository()` bypasses DI container |
| S-10 | `messaging.ts:18` | `console.error` used directly — RT-11 not fully fixed |

## Realtime

| ID | Location | Issue |
|---|---|---|
| S-11 | `server.ts:92` | `(decodedUser as any).userId \|\| decodedUser.actorId` — leaky `any`; `TokenClaims` should be authoritative |
| S-12 | `types.ts` | All payload schemas accept `userId` from client; should be stripped — actorId comes from registry only |
| S-13 | `messaging.ts:57` | Variable `userId` actually holds `actorId`; rename to avoid confusion |
| S-14 | `session.ts:11` | `messages: any[]` — untyped |
| S-15 | `session.ts:103–130` | `handleDisconnect` is O(sessions × connections); add `connectionId → sessionId` reverse map |
