import * as React from "react"

export default function CommunityGuidelinesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Community Guidelines</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          We are committed to making Moots a safe, welcoming, and fun community for meeting interesting people. These Guidelines help keep the platform healthy.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Respect Other Users</h2>
        <p>
          Treat your chat partners with respect. Harassment, hate speech, bullying, threat of violence, or derogatory remarks regarding race, gender, sexuality, religion, or ability will result in permanent hardware/IP bans.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Do Not Share Explicit Content</h2>
        <p>
          Moots is not an adult webcam or dating service. Transmitting pornographic, explicit, or sexually suggestive media or text is strictly prohibited.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Respect Privacy</h2>
        <p>
          Do not share other people's real-life identity, phone numbers, email addresses, or social accounts without explicit consent. Doxing is a zero-tolerance offense.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">4. No Spam or Solicitation</h2>
        <p>
          Using bots to automatically send links, promote services, or spam conversations ruins the experience. Keep discussions natural.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">5. Reporting Violations</h2>
        <p>
          Use the in-chat "Report" action button if you encounter someone violating these guidelines. Reported users are sent to our safety mod queue immediately.
        </p>
      </div>
    </div>
  )
}
