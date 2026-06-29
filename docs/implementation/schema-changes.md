# Schema Changes Required

The current `schema.prisma` needs these additions to support the architecture:

## Add `policyId` to `Conversation`

```prisma
model Conversation {
  id                 String             @id @default(cuid())
  type               ConversationType   @default(DIRECT)
  policyId           String             @default("policy_anon_stranger_v1")  // ← NEW
  name               String?
  status             ConversationStatus @default(ACTIVE)
  lastMessagePreview String?
  lastActivityAt     DateTime           @default(now())
  participants       Participant[]
  messages           Message[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([lastActivityAt])
}
```

## Replace `senderId` with `senderParticipantId` on `Message`

```prisma
model Message {
  id                   String      @id @default(cuid())
  conversationId       String
  senderParticipantId  String                    // ← replaces senderId (userId)
  content              String
  contentType          ContentType @default(TEXT) // ← NEW
  clientMessageId      String      @unique         // ← NEW (idempotency)
  replyToId            String?                    // ← NEW
  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt
  deletedAt            DateTime?                  // ← NEW (soft delete)

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       Participant  @relation(fields: [senderParticipantId], references: [id])

  @@index([conversationId, createdAt])
}
```

## Add identity fields to `Participant`

```prisma
model Participant {
  // ...existing fields...
  identityState      IdentityState @default(ANONYMOUS)  // ← replaces identityMode
  persona            Json?                               // ← NEW: { displayName, avatarSeed, color }
  revealInitiatedAt  DateTime?                           // ← NEW
  revealConfirmedAt  DateTime?                           // ← NEW

  messages Message[]  // ← NEW: relation to messages sent by this participant
}
```
