# ADR-008: Packages Contracts

**Status**: Accepted

## Context
Moots consists of multiple independently deployed services (API, Realtime) and clients (Web, Mobile). These entities need to communicate using shared data structures (DTOs, JWT payloads, WS events). Historically, these types were duplicated across repositories, leading to drift, missing fields, and type-safety bugs at runtime.

## Problem
How do we ensure that the API, Realtime service, and frontend clients agree on the exact shape of payloads, event structures, error codes, and enums without duplicating code?

## Decision
We introduce a standalone NPM workspace package: `packages/contracts`.
This package acts as the **canonical platform language**. It owns all shared interfaces, Zod schemas, enums, and event envelopes. 

All services and clients must import their types and schemas from `@moots/contracts`. No service may redefine a shared model locally.

## Consequences
- **Type Safety**: End-to-end type safety across the entire platform.
- **Single Source of Truth**: Updating a schema in the contracts package instantly flags compilation errors in any service that hasn't adapted to the new schema.
- **Build Step**: Requires a build step (or TypeScript project references) to compile the contracts package before building the dependent services.

## Alternatives
- OpenAPI generation (Accepted for REST APIs, but doesn't solve WebSocket payloads, JWT structures, or internal Redis event envelopes as cleanly as a shared TS package).
- Code duplication (Rejected: highly prone to errors).
