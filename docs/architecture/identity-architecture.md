# Identity & Session Architecture

## Authentication Architecture

```text
Identity Provider (Guest/Credentials/OAuth/Passkey/AI)
        │
        ▼
    Identity
        │
        ▼
      Actor
        │
        ▼
     Device
        │
        ▼
     Session
        │
        ▼
   Credentials
        │
        ▼
  Access / Refresh Tokens
```

## Session & Device Models
* **Session Model**: Actor-centric (id, actorId, deviceId, sessionToken, expiresAt, revokedAt). Sessions handle auth, refresh, revocation, and device tracking, and must not store business state.
* **Device Model**: Aggregate for push notifications, trusted devices, session ownership, and multi-device login (id, actorId, deviceIdentifier, platform, browser, OS). Fingerprinting is prohibited.

## Token & Refresh Models
* **Session Token**: Long-lived, HTTP-only. Restarts session, reissues access tokens, and authenticates refresh operations.
* **Access Token**: Short-lived, used for API and WebSocket authentication.
* **Refresh Flow**: Access token expires ──▶ Client requests refresh ──▶ Session validated ──▶ New Access Token issued (preserves Actor and Session).

## Guest Lifecycle
1. **Arrival**: Landing page ──▶ Guest Identity & Actor created ──▶ Session created ──▶ Access token issued ──▶ Instant chat.
2. **Active Session**: Guest survives refresh, tab close, browser restart, and WS reconnect via Session.
3. **Upgrade**: Guest registers ──▶ Create new identity (Email/OAuth) ──▶ Link to existing Actor (preserves all history/relations) ──▶ Revoke old session. No data migration.
4. **Cleanup**: Inactive guest-only resources cleaned up after configurable retention periods.

## Authorization & Policy
Authentication determines *Who you are*. Policy Engine determines *What you can do*. Capabilities are resolved using Identity, Actor, Participant, Conversation State, and the Policy Engine.

## Conversation Architecture
```text
Conversation ──▶ Participants ──▶ Personas ──▶ Identity State
```
Conversation identity is independent of authentication identity.

## Architectural Rules
* **API**: Owns authentication, identity, actors, sessions, devices, conversations, policies, and database persistence.
* **Realtime**: Owns WS connection lifecycle, presence, matchmaking, event delivery, rooms, and connection state. Must never create business entities.
* **Frontend**: Owns presentation, UI state, token requests, and connection lifecycle. Must never generate tokens or identities.
* **Contracts**: Owns all DTOs, events, commands, enums, payloads, and schemas. All contracts originate from `packages/contracts`.

## Identity Domain

### IdentityState — a progression, not a binary

```typescript
// src/domains/identity/identity-state.types.ts

export type IdentityState =
  | 'ANONYMOUS'       // no identity information shared
  | 'PENDING_REVEAL'  // one party initiated, waiting on other
  | 'REVEALED'        // both parties confirmed
  | 'VERIFIED'        // revealed + third-party verified (future)
  | 'ORGANIZATION';   // business/brand identity (future)

// State machine: valid transitions only
// ANONYMOUS → PENDING_REVEAL → REVEALED (→ VERIFIED)
// PENDING_REVEAL → ANONYMOUS (request rejected/expired)
```

### Persona

```typescript
// src/domains/identity/persona.types.ts

export interface Persona {
  participantId: string;
  displayName:   string;   // e.g. "Anonymous Penguin #4"
  avatarSeed:    string;   // deterministic avatar generation seed
  color:         string;   // hex — consistent within a conversation
}
```

The persona is generated once when a `Participant` row is created. It is stable — the same user always appears as the same persona within the same conversation, even across sessions. This prevents re-identification through persona-hopping.

### IdentityContract

Generated from `ConversationPolicy`. Shown to both parties before the first message. Legally meaningful — joining the conversation constitutes acceptance.

```typescript
// src/domains/identity/identity-contract.types.ts

export type ContractTerm = {
  label:       string;   // short UI label: "Mutual consent required"
  description: string;   // tooltip / detail: full explanation
  value:       string;   // machine-readable: "MUTUAL_CONSENT"
};

export interface IdentityContract {
  conversationId:          string;
  policyId:                string;
  policyVersion:           number;

  terms: {
    reveal:      ContractTerm;
    connections: ContractTerm;
    retention:   ContractTerm;
    media:       ContractTerm;
    recording:   ContractTerm;
    encryption:  ContractTerm;
    moderation:  ContractTerm;
  };

  // Implicit consent — joining = accepting
  acceptedByParticipantIds: string[];
  generatedAt:              Date;
}
```
