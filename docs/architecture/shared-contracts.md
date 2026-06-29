# Shared Contracts Architecture

## Overview
The `packages/contracts` package acts as the **canonical platform language** — the single source of truth for every contract between services (API, Realtime) and between the platform and its clients (Web, Mobile).

## Directory Layout
Contracts should be organized by domain, reflecting the bounded contexts of the platform.
*Note: Do not create directories prematurely. Create each subdirectory only when the corresponding domain requires shared contracts.*

```text
packages/contracts/src/
├── auth/
│   ├── token-claims.ts
│   └── refresh-request.ts
├── actors/
│   └── actor.types.ts
├── capabilities/
│   └── capability.enum.ts
├── connections/
│   └── connection.events.ts
├── conversations/
│   └── conversation.events.ts
├── events/
│   ├── platform-event.ts
│   └── outbox-event.ts
├── errors/
│   └── error-codes.ts
├── identity/
│   └── identity-state.ts
├── messages/
│   └── message.events.ts
├── participants/
│   └── participant.events.ts
├── personas/
│   └── persona.types.ts
├── policies/
│   └── policy.types.ts
├── presence/
│   └── presence.events.ts
└── websocket/
    ├── client-to-server.ts
    └── server-to-client.ts
```

## Shared Elements
- **Zod Schemas**: Used for API validation and WS payload validation.
- **TypeScript Types/Interfaces**: DTOs, request/response models.
- **Enums**: Identity states, actor types, capabilities.
- **Event Envelopes**: Platform event definitions.
- **Error Codes**: Standardized error mappings.
