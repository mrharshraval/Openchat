import * as React from "react"

export default function SafetyCenterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Safety Center</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          Your safety is our top priority. Learn about the measures we take to protect the community, and tips on how to keep yourself safe while chatting online.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Tips for Online Safety</h2>
        <p>
          - **Protect Personal Details**: Never share your full name, location, address, passwords, or financial details with anyone you meet online.
          - **Be Skeptical**: Users may not always be who they claim to be. Avoid meeting strangers in person without taking extreme precautions.
          - **Keep Chats on Moots**: If someone tries to move the conversation to external chat links immediately, use caution, as it is often a sign of spam or bots.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Built-in Safety Features</h2>
        <p>
          - **Instant Skip**: Click "Skip" or "Disconnect" at any time to immediately end a chat and join a new queue.
          - **Anonymous Nicknames**: Guest users are automatically assigned temporary, non-identifying nicknames.
          - **Reporting System**: Every chat window features a reporting button to report abuse or guidelines violations.
          - **Blocking System**: If you block a user, they are prevented from matching with you in the future.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Moderation and Audit Logs</h2>
        <p>
          Our moderation team works 24/7 reviewing abuse reports. Transcripts flagged through report submissions are audited to enforce temporary or permanent bans.
        </p>
      </div>
    </div>
  )
}
