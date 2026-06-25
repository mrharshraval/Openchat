import * as React from "react"

export default function LegalRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Law Enforcement & Legal Requests</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          These guidelines outline how Moots responds to disclosure requests, subpoenas, and legal demands from law enforcement and government agencies.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Privacy and Disclosures</h2>
        <p>
          We do not disclose user records, IP addresses, or metadata to law enforcement except in response to valid legal processes, such as subpoenas, search warrants, or court orders, or in emergency threat-to-life situations.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Required Demands</h2>
        <p>
          - **Non-Content Information**: Subpoenas or court orders are required for basic subscriber logs (registration details, transaction info, connection dates).
          - **Content Information**: A search warrant issued under the Stored Communications Act (or equivalent local criminal warrants) is required to disclose stored chat segments.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Submit Requests To</h2>
        <p>
          All legal and law enforcement requests must be sent from official government domains, addressed to legal@moots.com.
        </p>
      </div>
    </div>
  )
}
