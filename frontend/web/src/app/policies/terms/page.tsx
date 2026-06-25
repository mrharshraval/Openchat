import * as React from "react"

export default function TermsOfUsePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Use</h1>
        <p className="text-xs text-muted-foreground">Last updated: June 25, 2026</p>
      </div>

      <div className="h-px bg-border my-4" />

      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <p>
          Welcome to Moots. By accessing or using our website, services, and real-time chat application, you agree to comply with and be bound by these Terms of Use.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">1. Acceptance of Terms</h2>
        <p>
          By using Moots, you represent that you are at least 13 years old. If you are under 18, you represent that you have received parental consent to use the service. If you do not agree to these terms, do not access or use the platform.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">2. Account Registration and Security</h2>
        <p>
          While registration is optional (you may participate as a Guest), registered accounts require providing accurate registration details. You are responsible for all activity under your credentials and must keep passwords confidential.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">3. Prohibited Content and Conduct</h2>
        <p>
          You agree not to transmit any unlawful, threatening, abusive, offensive, defamatory, or obscene materials. Spam, phishing, harassment, and unauthorized automated harvesting are strictly prohibited and will result in immediate bans.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">4. Privacy and Data Handling</h2>
        <p>
          Your use of the services is also governed by our Privacy Policy and Cookie Policy. We store limited logs for security auditing purposes.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">5. Disclaimer of Warranties</h2>
        <p>
          Moots is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free service.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">6. Limitation of Liability</h2>
        <p>
          Under no circumstances shall Moots be liable for direct, indirect, incidental, or consequential damages resulting from your access to or inability to access the services.
        </p>

        <h2 className="text-sm font-bold text-foreground pt-4">7. Updates to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the platform constitutes agreement to updated terms.
        </p>
      </div>
    </div>
  )
}
