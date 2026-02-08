# The DoubleStack Strategy: SMM Hub Edition

This document maps the "DoubleStack" agency model (high-value recurring revenue services) to the specific technical architecture of SMM Hub.

## Core Philosophy
We do not sell "Websites". We sell **Outcomes**:
1.  **Reputation** (Google Reviews)
2.  **Attention** (Social Media)
3.  **Leads** (Concierge/Chat)
4.  **Nurture** (Email/SMS Drips)

---

## Pillar 1: Automated Reputation Management (The "Filter")
**Status:** ✅ LIVE
**Goal:** Intercept feedback before it hits Google.

### The Offering
*   **"The Gate":** A binary feedback page (Thumbs Up / Down).
*   **The Logic:**
    *   👍 **Promoters:** Redirected immediately to Google Maps Review Form.
    *   👎 **Detractors:** Diverted to a private feedback form (Payload CMS).
*   **The Social Proof:** Positive reviews are auto-injected into the client's website (Review Widget).

### Technical Stack
*   **Collection:** `Reviews` (Stores feedback).
*   **Frontend:** `/review/[tenantSlug]` (The Gate).
*   **Automation:** Payload Task `sendReviewRequest` (SMS/WhatsApp).

---

## Pillar 2: Social Media Manufacturing (The "Voice")
**Status:** ✅ LIVE
**Goal:** Content on auto-pilot.

### The Offering
*   **"The Factory":** We don't just schedule; we *generate*.
*   **Brand Enforcement:** Every image is auto-watermarked and styled (Satori).
*   **Video:** Static house photos are converted into 15s Instagram Reels (FFmpeg).

### Technical Stack
*   **Engine:** SMM Hub Creative Engine (Node.js/Satori).
*   **Distribution:** Postiz (Self-Hosted).
*   **Scheduling:** Temporal Workflows (`CampaignWorkflow`).

---

## Pillar 3: Client Acquisition (The "Concierge")
**Status:** ✅ LIVE
**Goal:** Stop window shoppers; capture phone numbers.

### The Offering
*   **"The Bouncer":** A full-screen or concierge-style Chatbot on the homepage.
*   **The Hook:** "Don't scroll. Tell me your budget."
*   **The Handoff:** Captures budget/location -> Redirects to WhatsApp for the close.

### Technical Stack
*   **Bot:** Typebot (Self-Hosted/Cloud).
*   **Integration:** Payload CMS (Leads Collection).
*   **Interface:** `ConciergeOverlay` (React).

---

## Pillar 4: Lead Nurture (The "Drip")
**Status:** 🚧 PLANNED (Temporal)
**Goal:** The money is in the follow-up.

### The Offering
*   **"The 2-Day Bump":** If a lead doesn't book a viewing, they get an automated helpful SMS/Email 48 hours later.
*   **"The Long Tail":** Weekly "New Listings in [Their Area]" email.

### Technical Strategy (Temporal)
We will use **Temporal Workflows** to manage time, not Cron jobs.
```typescript
// Workflow: LeadNurture
await sendWelcomeEmail();
await sleep('2 days');
if (!hasBookedViewing) {
  await sendHelpfulSMS("Still looking in Kilimani?");
}
await sleep('5 days');
await sendNewsletter();
```

---

## Pillar 5: Reporting & ROI (The "Proof")
**Status:** ⭕ GAP (Next Priority)
**Goal:** Prove we are worth the retainer.

### The Offering
*   **"The Monthly Report":** A simple, auto-generated PDF or Dashboard.
*   **Metrics that Matter:**
    *   New 5-Star Reviews (Reputation).
    *   Leads Captured (Concierge).
    *   Posts Published (Social).

### Technical Strategy
*   **Analytics:** Integrate Umami (Open Source) or Payload Analytics.
*   **Dashboard:** Create a custom View in Payload Admin (`/admin/dashboard`).

---

## Pricing Model (The "Stack")

| Tier | Services Included | Target | Pricing Idea |
| :--- | :--- | :--- | :--- |
| **Tier 1: Essentials** | Website + Concierge + Reviews | Solo Agents | $50/mo |
| **Tier 2: Growth** | All above + Social Automation (10 posts/mo) | Small Agencies | $150/mo |
| **Tier 3: Dominance** | All above + Video + Drip Campaigns | Top Producers | $400/mo |
