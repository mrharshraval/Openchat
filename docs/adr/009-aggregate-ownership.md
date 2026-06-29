# ADR-009: Aggregate Ownership

**Status**: Accepted

## Context
As the codebase grows, allowing services and repositories to cross-query any database table freely leads to spaghetti code, unintended side effects, and difficulty refactoring. For example, updating a participant's settings should not inadvertently modify their underlying actor or user profile.

## Problem
Without clear aggregate boundaries, any repository can mutate any entity, leading to a breakdown in domain-driven design, leaked invariants, and highly coupled code. We need strict rules regarding which repository can mutate which entity.

## Decision
We enforce strict **Aggregate Root Ownership** rules:
1. Data mutations must occur through the Aggregate Root's repository.
2. Repositories may only persist their own aggregate root and its owned children.
3. No cross-aggregate FK traversal in a single repository method. Use separate lookups and compose the data in the service layer.

The defined aggregate roots are:
- `Conversation` (owns `Participant`, `Message`, `Persona`, `IdentityState`)
- `Actor` (owns `GuestSession`, `Device`, `Session`)
- `Connection` (owns `ConnectionRequest` implicitly via state machine)

## Consequences
- Repositories become significantly narrower in scope.
- Cross-domain operations must happen at the Service layer, composing multiple repositories.
- Code becomes easier to test, refactor, and reason about.
- May require slightly more boilerplate to orchestrate operations at the service level.

## Alternatives
- Allowing any repository to modify any table (Rejected: unmaintainable, violates DDD).
- Doing all joins strictly in the database for reads (Accepted for reads, but mutations must remain isolated).
