import * as React from "react"

export default function CookiePolicyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Cookie Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          This Cookie Policy explains how Moots uses cookies and similar storage technologies to recognize you when you visit our website.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. What are Cookies?</h2>
        <p>
          Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Cookies We Use</h2>
        <p>
          - **Essential Cookies**: Necessary for fundamental operations. They handle user sessions (`next-auth` cookies), remember cookie settings, and maintain the WebSocket connection state.
          - **Analytics Cookies**: Used to collect aggregated data about site performance, traffic routes, and queue speed mode statistics.
          - **Marketing & Personalization Cookies**: Track custom interests and preference configurations to suggest compatible active chat channels.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Managing Preferences</h2>
        <p>
          You can update your cookie preferences at any time. Toggles are available in the footer and inside the settings dashboard to manage Analytical and Marketing cookies. Essential cookies cannot be deactivated.
        </p>
      </div>
    </div>
  )
}
