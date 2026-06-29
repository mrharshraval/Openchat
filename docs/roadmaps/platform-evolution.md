# Platform Evolution Roadmap

```text
Current (Phase 1)
     │  JWT auth, Actor model, Policy engine, cursor pagination
     ▼
Phase 2–3 (Near Term)
     │  Message persistence, Redis, Outbox, async command pipeline
     ▼
Phase 4 (Identity Complete)
     │  Actor completeness, Device model, data-driven policies, Persona entity
     ▼
Phase 5–6 (Production Ready)
     │  Full test coverage, CI/CD, observability, BullMQ jobs
     ▼
v1.0 — Horizontally scalable, production-secure, fully event-driven platform
     │
     ▼
Modular Monolith → Extract Bounded Contexts
     │  Presence domain, Matchmaking domain, Moderation domain
     ▼
Event-Driven Platform
     │  All mutations produce domain events; full audit log
     ▼
CQRS Readiness
     │  Read replicas for conversation/message history; write DB for mutations
     ▼
Event Sourcing Readiness
     │  DomainEvent table as append-only ledger; state rebuilt from events
     ▼
Global Multi-Region
     │  Multi-region Postgres (read replicas per region); Redis Cluster
     │  Realtime nodes per region; matchmaking scoped by region
     ▼
Platform Extensions
     │  AI Participants (ActorType.AI) 
     │  Voice/Video (WebRTC signaling gateway)
     │  Push Notifications (Device model + APNs/FCM)
     │  Communities and Organizations
     │  Plugins and SDK
     │  Multi-platform clients (iOS, Android, Web)
```
