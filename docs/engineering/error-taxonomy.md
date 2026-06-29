# Error Taxonomy

## CapabilityDeniedError

```typescript
// CapabilityDeniedError — new error class needed in shared/errors/

export class CapabilityDeniedError extends AppError {
  constructor(context: { capability: Capability; policyId: string }) {
    super({
      statusCode: 403,
      code:       'CAPABILITY_DENIED',
      message:    `Capability '${context.capability}' is not granted by policy '${context.policyId}'`,
      context,
    });
  }
}
```

The HTTP 403 body is machine-readable. The client reads `capability` and `policyId`, then adapts its UI — hides the button, shows a tooltip, or displays an upgrade prompt. No hardcoded client-side capability checks needed.
