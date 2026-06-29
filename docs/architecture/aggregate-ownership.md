# Aggregate Root Ownership

## Overview
Defining aggregate boundaries prevents a large class of bugs — cross-boundary queries, leaked invariants, and repository responsibility creep.

## Aggregate Roots and Owned Entities

```text
Conversation  ─── owns ───▶  Participant
                                   │
                                   ├──── owns ────▶  Persona (JSON → future entity)
                                   └──── owns ────▶  IdentityState (state machine)

Conversation  ─── owns ───▶  Message
                                   └──── references ──▶  Participant (by senderParticipantId)

Actor  ────────── owns ───▶  GuestSession (GUEST type only)
Actor  ────────── owns ───▶  Device (future)
Actor  ────────── owns ───▶  Authentication (via Session table)

Connection  ───── owns ───▶  ConnectionRequest (implicit via status FSM)
```

## Enforcement Rules
- Repositories may only persist their own aggregate root and its owned children.
- `MessageRepository` may not write to `Participant` — that goes through `ParticipantRepository`.
- `ConversationRepository` may not query `Actor` directly — it resolves through `Participant`.
- No cross-aggregate FK traversal in a single repository method (use separate lookups and compose in the service layer).
