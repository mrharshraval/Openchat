# Message Domain Architecture

## Message model — `senderParticipantId` only

The strongest privacy guarantee is a schema-level one, not a runtime check.

```typescript
// src/domains/messages/message.types.ts

export interface Message {
  id:                  string;
  conversationId:      string;
  senderParticipantId: string;    // ← ONLY this. senderUserId NEVER appears.
  content:             string;    // EncryptedBlob in production
  contentType:         ContentType;
  replyToId:           string | null;
  clientMessageId:     string;    // idempotency key — client-generated UUID
  sentAt:              Date;
  deletedAt:           Date | null;
}
```

> **Why this matters**: A message row in the database can never be trivially joined to a user row. There is no `senderUserId` column to leak. Identity resolution is a runtime concern, not a storage concern.

## MessageSerializer — the one place identity resolves

Resolution happens exactly once, at the API boundary. Services and the DB never see resolved identity.

```typescript
// src/domains/messages/message.serializer.ts

export class MessageSerializer {
  serialize(
    message:    Message,
    revealMap:  Map<string, IdentityState>,  // participantId → state
    personaMap: Map<string, Persona>,         // participantId → persona
    profileMap: Map<string, UserProfile>,     // participantId → profile (only if REVEALED)
  ): SerializedMessage {

    const state  = revealMap.get(message.senderParticipantId);
    const sender = state === 'REVEALED'
      ? { type: 'profile', data: profileMap.get(message.senderParticipantId) }
      : { type: 'persona', data: personaMap.get(message.senderParticipantId) };

    return {
      id:      message.id,
      sender,               // resolved once, here, never elsewhere
      content: message.content,
      sentAt:  message.sentAt,
    };
  }
}
```

**The history implication**: when two strangers reveal identity after a week of conversation, old messages do not change in the database. The serializer simply resolves them differently on the next read. The client sees the real name retroactively. No backfill, no data rewrite, no race conditions.
