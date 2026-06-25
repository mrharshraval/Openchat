import * as React from "react"

export default function AcceptableUsePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Acceptable Use Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          This Acceptable Use Policy outlines the legal restrictions regarding the content and actions you may display while accessing or communicating on the Moots network.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Prohibited Actions</h2>
        <p>
          You agree not to use the services to:
          - Violate local, state, national, or international laws.
          - Exploit, harm, or attempt to exploit minors in any way.
          - Send unsolicited advertisements, spam, chain letters, or phishing links.
          - Impersonate any person, brand, moderator, or Moots staff member.
          - Engage in cyber-attacks, distributed denial of service (DDoS), or scrapers.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Prohibited Content</h2>
        <p>
          You must not transmit or link to:
          - Content promoting self-harm, eating disorders, or suicide.
          - Material depicting animal cruelty or violence.
          - Stolen credentials, credit card details, or illegal substance transactions.
          - Virulent code, Trojan horses, keyloggers, or malicious scripts.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Enforcement</h2>
        <p>
          We monitor connections for compliance and reserves the right to report serious illegal activities directly to law enforcement authorities.
        </p>
      </div>
    </div>
  )
}
