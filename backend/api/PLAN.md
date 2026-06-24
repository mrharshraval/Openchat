# Moots API - Email Notification System Plan (v1)

This plan details the implementation strategy for the **Moots transactional email notification system**. For v1, we will configure **Resend** to dispatch 15–20 structured email templates under designated sender profiles.

---

## 1. Domain Sender Profiles

The following verified email addresses under the `@moots.in` domain will be configured as senders based on the notification category:

| Sender Address | Notification Domain | Primary Scope |
| :--- | :--- | :--- |
| `noreply@moots.in` | Auth, General System Alerts | OTP codes, registration welcomes |
| `support@moots.in` | Customer Support, Tickets | Ticket acknowledgements, resolutions |
| `security@moots.in` | Account Security, Safety | Credential changes, bans, account deletion |
| `privacy@moots.in` | Legal, Compliance | Terms updates, GDPR/Data exports |
| `billing@moots.in` | Billing, Memberships | Receipts, payment failures, subscription cancellations |

---

## 2. Notification Templates Matrix (v1)

### A. Auth Notifications
*Sender Profile: `noreply@moots.in` (Welcome, Verify Email, OTP Login) / `security@moots.in` (Password Reset)*

*   **`[ ]` Welcome (`welcome.html`)**:
    *   *Trigger*: Successful registration and email verification.
    *   *Subject*: "Welcome to Moots! Let's get matching 🚀"
*   **`[x]` Verify Email (`verify-email.html`)**:
    *   *Trigger*: Registration OTP request.
    *   *Subject*: "Verify your email for Moots"
*   **`[ ]` OTP Login (`otp-login.html`)**:
    *   *Trigger*: Passwordless sign-in request.
    *   *Subject*: "Your Moots login code: [Code]"
*   **`[ ]` Password Reset (`password-reset.html`)**:
    *   *Trigger*: "Forgot Password" form submission.
    *   *Subject*: "Reset your Moots password"

---

### B. Account Notifications
*Sender Profile: `security@moots.in`*

*   **`[ ]` Email Changed (`email-changed.html`)**:
    *   *Trigger*: Primary email address is modified. Sent to both old and new addresses.
    *   *Subject*: "Security Alert: Email address updated"
*   **`[ ]` Account Deletion (`account-deletion.html`)**:
    *   *Trigger*: User requests permanent account deletion.
    *   *Subject*: "Moots: Account deletion scheduled"

---

### C. Safety Notifications
*Sender Profile: `security@moots.in`*

*   **`[ ]` Report Received (`report-received.html`)**:
    *   *Trigger*: User is reported for violating community guidelines.
    *   *Subject*: "Moots Safety: We have received a report"
*   **`[ ]` Ban Notice (`ban-notice.html`)**:
    *   *Trigger*: Moderation team issues a temporary or permanent ban.
    *   *Subject*: "Account Suspended: Terms of Service Violation"

---

### D. Billing Notifications
*Sender Profile: `billing@moots.in`*

*   **`[ ]` Membership Purchased (`membership-purchased.html`)**:
    *   *Trigger*: Successful checkout of Moots Premium.
    *   *Subject*: "Your Moots Premium Receipt ⚡"
*   **`[ ]` Payment Failed (`payment-failed.html`)**:
    *   *Trigger*: Subscription renewal payment attempt fails.
    *   *Subject*: "Action Required: Payment failed for Moots Premium"
*   **`[ ]` Subscription Cancelled (`subscription-cancelled.html`)**:
    *   *Trigger*: Active subscription is cancelled by the user.
    *   *Subject*: "Confirmation: Moots Premium cancelled"

---

### E. Legal & Compliance
*Sender Profile: `privacy@moots.in`*

*   **`[ ]` Privacy Update (`privacy-update.html`)**:
    *   *Trigger*: Updates to privacy policies.
    *   *Subject*: "Important: Updates to the Moots Privacy Policy"
*   **`[ ]` Terms Update (`terms-update.html`)**:
    *   *Trigger*: Updates to general terms of service.
    *   *Subject*: "Important: Updates to the Moots Terms of Service"
*   **`[ ]` Data Export Ready (`data-export.html`)**:
    *   *Trigger*: Requested archive of user data is generated and ready for download.
    *   *Subject*: "Your Moots Data Export is ready"

---

### F. Support
*Sender Profile: `support@moots.in`*

*   **`[ ]` Support Ticket Received (`ticket-received.html`)**:
    *   *Trigger*: User submits a help ticket.
    *   *Subject*: "Support Ticket Received - #[TicketID]"
*   **`[ ]` Support Ticket Resolved (`ticket-resolved.html`)**:
    *   *Trigger*: Support agent resolves the ticket.
    *   *Subject*: "Support Ticket #[TicketID] marked as Resolved"

---

## 3. Technical Implementation Checklist

1.  **Directory Setup**:
    *   Create `backend/api/src/emails/templates/` folder structure.
2.  **HTML Layout Boilerplate**:
    *   Create a reusable wrapper (`layout.html`) with responsive styles, matching branding fonts, dark/light mode compatibility, and footer legal links.
3.  **Resend SDK Wrapper**:
    *   Write a utility file `backend/api/src/emails/sender.js` that abstracts `resend.emails.send` and maps the correct `from` address dynamically.
4.  **Template Interpolation**:
    *   Implement helper to inject variables (OTP codes, usernames, links) into the HTML template files before dispatching.
