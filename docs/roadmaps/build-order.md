# Build Order

Given the Policy Domain now exists as the foundation, the correct build order is:

| Step | What | Why first |
|------|------|-----------|
| 1 | `Capability` enum + `ConversationPolicy` types + presets | All subsequent code depends on this. Define before writing any feature. |
| 2 | `PolicyService.assertCapability()` | Every service calls this. Write before any service logic. |
| 3 | Schema migration: `policyId` on Conversation, `senderParticipantId` on Message | Database must be correct before business logic. |
| 4 | `Participant` + `Persona` generation | Identity abstraction layer. |
| 5 | `Message` write path + `MessageSerializer` | Privacy-correct read/write. |
| 6 | `IdentityRevealEvent` state machine | `ANONYMOUS → PENDING_REVEAL → REVEALED`. |
| 7 | WebSocket hub + Redis Pub/Sub | Real-time delivery of messages and identity events. |
| 8 | `IdentityContract` generation | Surface policy as human-readable contract at conversation start. |
| 9+ | Notifications, moderation, communities | Plug into foundation — no changes to core. |
