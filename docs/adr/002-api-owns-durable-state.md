# ADR-002: API Owns Durable State

**Status**: Accepted

## Context
In early prototypes, the realtime WebSocket service was performing database mutations (e.g., updating user status, creating messages, modifying connections). This led to race conditions, duplicated logic across API and Realtime layers, and missing policy enforcements because the realtime layer lacked the DI container and policy engine used in the REST API.

## Problem
Allowing multiple services to mutate the same Postgres tables bypasses centralized business invariants and makes the system harder to scale, test, and audit.

## Decision
The REST API is the exclusive owner of all durable state. It is the only service permitted to connect to Postgres to perform writes. Any mutation triggered by a realtime client (like sending a message or revealing an identity) must be routed to the API for execution, either via an HTTP call or an asynchronous Redis command queue.

## Consequences
- **Security & Consistency**: The Policy Engine (`PolicyService.assertCapability`) runs on all state mutations reliably.
- **Complexity**: Requires a command queue (or internal HTTP bridge) to let the Realtime service request mutations from the API.
- **Scalability**: API nodes can scale independently to handle the write load.

## Alternatives
- Allow Realtime to write to the DB (Rejected: bypasses policy engine, duplicates domain logic).
