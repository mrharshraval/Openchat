# ADR-004: Universal Actor Identity

**Status:** Accepted
**Priority:** Critical (Platform Foundation)
**Supersedes:** Guest Session Architecture

## Context
Moots is a privacy-first, anonymous-first messaging platform built around conversations rather than user profiles. To support anonymous users, registered users, future OAuth providers, organizations, AI participants, and additional identity providers without future architectural rewrites, the authentication and identity systems must be redesigned around a Universal Actor Identity Architecture.

## Core Principle
> **Authentication proves an identity. Identity belongs to an Actor. Actors participate in conversations. Personas determine how Actors appear inside conversations.**

Authentication, identity, conversations, and presentation become independent concerns.

## Goals
* Supports anonymous users without compromising security.
* Preserves conversation history across browser refreshes.
* Allows guest → registered promotion without data migration.
* Supports multiple authentication providers.
* Supports future AI participants.
* Supports organizations and enterprise accounts.
* Maintains privacy-by-design.
* Follows Domain-Driven Design and aligns with enterprise practices.

## Decision: Core Design Principles

### 1. Actor is Permanent
An Actor represents a permanent platform entity. Actors own sessions, devices, conversation participation, connections, moderation history, preferences, and audit history. Actors are never recreated when authentication methods change.

### 2. Identity is Replaceable
Identity represents how an Actor authenticates (Guest, Credentials, OAuth, Passkey, AI). Multiple identities may belong to a single Actor.

### 3. Sessions are Infrastructure
Sessions represent authenticated access. Sessions do not know Actor specifics and only reference Actors.

### 4. Conversation Identity is Independent
Platform identity and conversation identity are distinct.
```text
Identity Provider ──▶ Identity ──▶ Actor ──▶ Participant ──▶ Persona ──▶ Identity State
```
* **Identity**: How an Actor authenticates.
* **Actor**: Who exists on the platform.
* **Participant**: Who joins a conversation.
* **Persona**: How the participant appears.
* **Identity State**: Level of identity revealed (Anonymous, Partially Revealed, Fully Revealed).

## Consequences
* **Extensibility**: Adding new auth methods (OAuth, Passkeys) simply means adding a new Identity row linked to an Actor.
* **Guest Promotion**: A guest user promotes to a registered user by adding a new Identity to their existing Actor. All conversation history and connections remain perfectly intact with no data migration.
* **Privacy**: The Persona model strictly isolates how a user is perceived in a specific conversation from their global platform identity.
