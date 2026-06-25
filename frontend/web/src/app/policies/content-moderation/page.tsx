import * as React from "react"

export default function ContentModerationPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Content Moderation Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          Learn how we moderate content on Moots, how we handle user reports, and the process to appeal enforcement actions.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Moderation Mechanisms</h2>
        <p>
          - **Automated Text Filters**: We employ real-time filters to check messages for spam links, malicious scripts, and severe abuse.
          - **Moderation Mod Queue**: When a user is reported, the report is compiled along with contextual metadata and sent to our moderation review queue.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Enforcement Levels</h2>
        <p>
          Depending on the severity of the violation, we apply the following actions:
          - **Warning**: A temporary notice shown inside the chat panel.
          - **Temporary Match Ban**: Deactivation of queue matching for 24-72 hours.
          - **Permanent Ban**: Full IP or device block preventing access to WebSocket chat routes.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Appeals Process</h2>
        <p>
          If you believe your account or IP was banned in error, you may file an appeal by contacting support at support@moots.com. Please include your connection ID or registered email.
        </p>
      </div>
    </div>
  )
}
