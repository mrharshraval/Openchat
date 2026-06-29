# Long-Term Architecture Assessment
> **Date**: 2026-06-28

| Capability | Today | Blocker |
|---|---|---|
| Millions of concurrent users | ❌ | No Redis, single realtime node |
| Horizontal scaling | ❌ | In-memory state |
| Multiple realtime nodes | ❌ | No shared state |
| Multiple API nodes | ✅ | Stateless + Prisma pool |
| AI participants | 🟡 | `ActorType.AI` in schema; no impl |
| Voice / Video | ❌ | WebRTC signaling not present |
| Push notifications | ❌ | No `Device` model |
| Mobile clients | 🟡 | JWT works; no push token |
| Multiple devices | ❌ | No `Device` entity |
| Feature flags | ❌ | Not present |
| Zero-downtime deploys | 🟡 | API yes; realtime loses in-memory state on deploy |
| Event sourcing readiness | ❌ | No EventBus, no Outbox |
| CQRS readiness | 🟡 | Schema supports it; no read/write split |
| Outbox pattern | ❌ | Not present |
| Moderation | ❌ | No domain |
| Organizations / Communities | ❌ | No domain |
| Search | ❌ | No domain |
