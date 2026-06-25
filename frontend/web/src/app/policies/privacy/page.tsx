import * as React from "react"

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          At Moots, we prioritize user privacy. This policy outlines what data we collect, why we collect it, and your rights regarding your personal information.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Data We Collect</h2>
        <p>
          - **Guest Users**: We assign a randomized temporary user ID and collect optional interest tags.
          - **Registered Users**: We collect email addresses and encrypted passwords.
          - **Technical Logs**: We collect IP addresses, browser agents, and timestamps for connection logging, matchmaking, and security audit trails.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Chat Transcripts</h2>
        <p>
          Real-time chats are delivered end-to-end. We do not persistently store chat transcript content on our database unless an active session is reported for abuse. In the event of a report, the last segment of the transcript is preserved for moderator review.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Data Retention</h2>
        <p>
          Connection audit logs are automatically pruned after 30 days. Registered account details remain active until the user requests account deletion.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">4. Your Rights</h2>
        <p>
          You have the right to request a download of your data, update your privacy settings, and delete your account entirely. These actions can be triggered under the Account and Privacy settings.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">5. Third-Party Services</h2>
        <p>
          We do not sell, trade, or distribute your email or session data to marketing firms. We utilize Supabase and Render for hosting infrastructure, which adhere to strict compliance policies.
        </p>
      </div>
    </div>
  )
}
