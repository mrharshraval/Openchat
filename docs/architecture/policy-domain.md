# Policy Domain Architecture

Every feature check in the codebase currently lives as scattered `if/else` conditionals. The Policy Domain eliminates that entirely. Every service asks one question: *does this conversation's policy grant this capability?*

## Capability Enum

Every possible action in Moots is a `Capability`. Policy grants capabilities. Services check capabilities. That's the entire contract.

```typescript
// src/domains/policy/capability.enum.ts

export enum Capability {
  // Identity
  REVEAL_IDENTITY           = 'REVEAL_IDENTITY',
  REQUEST_REVEAL            = 'REQUEST_REVEAL',

  // Messaging
  SEND_TEXT                 = 'SEND_TEXT',
  SEND_MEDIA                = 'SEND_MEDIA',
  SEND_VOICE_NOTE           = 'SEND_VOICE_NOTE',
  DELETE_OWN_MESSAGE        = 'DELETE_OWN_MESSAGE',
  DELETE_ANY_MESSAGE        = 'DELETE_ANY_MESSAGE',  // moderator only

  // Connections
  CREATE_CONNECTION         = 'CREATE_CONNECTION',
  VIEW_PARTICIPANT_PROFILE  = 'VIEW_PARTICIPANT_PROFILE',

  // Real-time
  VOICE_CALL                = 'VOICE_CALL',
  VIDEO_CALL                = 'VIDEO_CALL',
  SCREEN_SHARE              = 'SCREEN_SHARE',

  // Recording & retention
  RECORD_CALL               = 'RECORD_CALL',
  EXPORT_HISTORY            = 'EXPORT_HISTORY',
}
```

## ConversationPolicy

```typescript
// src/domains/policy/conversation-policy.types.ts

export type RevealMechanism = 'MUTUAL_CONSENT' | 'UNILATERAL' | 'DISABLED';
export type RetentionType   = 'EPHEMERAL' | 'PERSISTENT' | 'TIMED';

export interface ConversationPolicy {
  id:      string;
  name:    string;   // 'anonymous_stranger' | 'icebreaker' | 'identified_dm'
  version: number;   // policies are versioned, never mutated

  identityPolicy: {
    defaultState:    IdentityState;
    revealMechanism: RevealMechanism;
    revealExpiry:    number | null;  // seconds; null = no expiry
  };

  retentionPolicy: {
    type:          RetentionType;
    ttlSeconds:    number | null;  // null = forever
    deleteOnLeave: boolean;
  };

  capabilities: Set<Capability>;
}
```

## Policy Presets (v1 launch set)

```typescript
// src/domains/policy/policy-presets.ts

export const POLICIES: Record<string, ConversationPolicy> = {

  ANONYMOUS_STRANGER: {
    id: 'policy_anon_stranger_v1',
    name: 'anonymous_stranger',
    version: 1,
    identityPolicy: {
      defaultState:    'ANONYMOUS',
      revealMechanism: 'MUTUAL_CONSENT',
      revealExpiry:    86400,  // 24h to respond
    },
    retentionPolicy: {
      type:          'PERSISTENT',
      ttlSeconds:    null,
      deleteOnLeave: false,
    },
    capabilities: new Set([
      Capability.SEND_TEXT,
      Capability.SEND_MEDIA,
      Capability.SEND_VOICE_NOTE,
      Capability.REQUEST_REVEAL,
      Capability.REVEAL_IDENTITY,
      Capability.CREATE_CONNECTION,
      Capability.DELETE_OWN_MESSAGE,
    ]),
  },

  ICEBREAKER: {
    id: 'policy_icebreaker_v1',
    name: 'icebreaker',
    version: 1,
    identityPolicy: {
      defaultState:    'ANONYMOUS',
      revealMechanism: 'DISABLED',  // cannot reveal
      revealExpiry:    null,
    },
    retentionPolicy: {
      type:          'EPHEMERAL',
      ttlSeconds:    3600,  // 1h, then gone
      deleteOnLeave: true,
    },
    capabilities: new Set([
      Capability.SEND_TEXT,  // text only
    ]),
  },

  IDENTIFIED_DM: {
    id: 'policy_identified_dm_v1',
    name: 'identified_dm',
    version: 1,
    identityPolicy: {
      defaultState:    'REVEALED',
      revealMechanism: 'UNILATERAL',
      revealExpiry:    null,
    },
    retentionPolicy: {
      type:          'PERSISTENT',
      ttlSeconds:    null,
      deleteOnLeave: false,
    },
    capabilities: new Set([
      Capability.SEND_TEXT,
      Capability.SEND_MEDIA,
      Capability.SEND_VOICE_NOTE,
      Capability.VOICE_CALL,
      Capability.VIDEO_CALL,
      Capability.VIEW_PARTICIPANT_PROFILE,
      Capability.DELETE_OWN_MESSAGE,
      Capability.EXPORT_HISTORY,
    ]),
  },
};
```

## PolicyService — the single enforcement gate

```typescript
// src/domains/policy/policy.service.ts

export class PolicyService {
  async assertCapability(
    conversationId: string,
    capability:     Capability
  ): Promise<void> {
    const policy = await this.getPolicyForConversation(conversationId);

    if (!policy.capabilities.has(capability)) {
      throw new CapabilityDeniedError({
        code:       'CAPABILITY_DENIED',
        capability,
        policyId:   policy.id,
      });
      // Returns HTTP 403 with machine-readable body.
      // Client adapts its UI accordingly — no button, greyed state, tooltip.
    }
  }

  private async getPolicyForConversation(conversationId: string): Promise<ConversationPolicy> {
    const conv = await prisma.conversation.findUniqueOrThrow({
      where:  { id: conversationId },
      select: { policyId: true },
    });
    return POLICIES[conv.policyId]; // fast: policies are static, no DB hit
  }
}
```

## Before vs. After — what services look like

**Before** (current state — scattered conditionals):
```typescript
async function sendMessage(req) {
  const conv = await getConversation(req.conversationId);
  if (conv.isAnonymous && req.contentType === 'IMAGE') throw new Error('...');
  if (conv.type === 'EPHEMERAL' && req.contentType === 'IMAGE') throw new Error('...');
  // ...40 more conditionals scattered across every service
}
```

**After** (every service has exactly one pattern):
```typescript
async function sendMessage(req) {
  const cap = req.contentType === 'TEXT' ? Capability.SEND_TEXT : Capability.SEND_MEDIA;
  await policyService.assertCapability(req.conversationId, cap);
  return messageRepository.insert(req); // proceed — no conditionals
}

async function initiateReveal(req) {
  await policyService.assertCapability(req.conversationId, Capability.REQUEST_REVEAL);
  // proceed
}
```

Adding a new conversation type (communities, voice rooms, professional) = one new `ConversationPolicy` entry. Zero changes to service logic.
