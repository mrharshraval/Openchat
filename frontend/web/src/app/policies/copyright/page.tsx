import * as React from "react"

export default function CopyrightPolicyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Copyright Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          We respect the intellectual property rights of others and expect our users to do the same. We respond to notices of alleged copyright infringement under the Digital Millennium Copyright Act (DMCA).
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Submitting a DMCA Notice</h2>
        <p>
          If you believe that any content on the platform infringes upon your copyright, you may submit a written notification containing:
          - A physical or electronic signature of the copyright owner or authorized representative.
          - Identification of the copyrighted work claimed to have been infringed.
          - Identification of the infringing material and its exact location (URLs or session data details).
          - Your contact info (address, phone number, email).
          - A statement of good faith belief that the dispute has not been authorized by the owner.
          - A statement under penalty of perjury that the information in the notification is accurate.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Send Notices To</h2>
        <p>
          Email: legal@moots.com
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Counter-Notifications</h2>
        <p>
          If your content was removed in error, you may file a counter-notice containing details verifying authorization, sent to our legal desk email.
        </p>
      </div>
    </div>
  )
}
