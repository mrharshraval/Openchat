# Key Invariants

The following architectural invariants must never be violated by any domain or service within the system:

1. **`Message.senderParticipantId` is the only sender reference** — no `userId` on message rows, ever.
2. **Identity resolves exactly once** — in `MessageSerializer` at the API boundary. Nowhere else.
3. **Services never branch on conversation type** — they call `policyService.assertCapability()`. The policy handles the branching.
4. **Policies are versioned, never mutated** — `policy_anon_stranger_v1` is immutable. Changes create `v2`. Historical conversations keep their original policy semantics.
5. **Persona is stable within a conversation** — same user, same persona, every session. Generated once, stored on `Participant`.
