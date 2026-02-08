# Service Tiers & Value Strategy

## 1. The Multi-Layered Value Stack

SMM Hub operates on a "Work vs. Value" principle. We distinguish between the **Utility** (the software machines) and the **Service** (the human strategy and management).

### The Three Core Machines
1.  **The Creative Engine (Branding):** Satori/FFmpeg engine turning raw data into branded assets.
2.  **The Distribution Pipe (Posting):** The Postiz dashboard for social account linking and scheduling.
3.  **The Reputation Filter (Reviews):** Automated gatekeeper that pushes 5-star reviews to Google and intercepts complaints.

---

## 2. Tier Breakdown

| Tier | Target Audience | Branding Machine | Posting Machine | Reputation Machine | Credit Multiplier |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Self-Service** | Tech-savvy owners | Client uploads/edits | Client connects/schedules | Manual Request Link | **1x** |
| **Managed** | Busy professionals | Agency staff handles everything | Agency staff manages setup | SMS Automation Included | **2x** |
| **Elite** | Large enterprises | API/CRM Integration (No human) | Fully Automated Flow | Full Concierge Setup | **5x** |

### Tier 1: Self-Service (SaaS Model)
The client pays for access to the tools. They provide their own labor to upload media, create campaigns, and link their social media APIs. 
*   **Revenue:** Low margin, high volume subscription + credit bundles.

### Tier 2: Managed (Agency Model)
The agency provides "Labor + Strategy." Agency staff or freelancers use the SMM Hub CMS on behalf of the client. The client simply provides the raw assets (via WhatsApp/Email), and we handle the "Machine Work."
*   **Revenue:** Monthly Retainer + 2x Credit burn rate.

### Tier 3: Elite (Factory Model)
The "Zero-Human" flow. We connect the client's existing business systems (CRM, Website, POS) directly to the SMM Hub API. The system "listens" for new data and auto-generates/auto-posts without any button clicks.
*   **Revenue:** Setup Fee + High Retainer + 5x Credit burn rate.

---

## 3. The "Multiplier" Logic (The Master Knob)

To ensure technical simplicity while maintaining pricing flexibility, we use a **Cost Multiplier** at the Tenant level.

*   **Logic:** `Final Cost = (Base Credit Cost) * (Tenant Multiplier)`
*   **Example (Video):**
    *   Self-Service (1x): 5 Credits
    *   Managed (2x): 10 Credits
    *   Elite (5x): 25 Credits

This allows the Platform Owner to adjust the "Fuel Efficiency" of an account based on the value delivered, without needing complex distribution or management fee calculations.

---

## 4. Implementation in CMS

*   **Collection:** `Tenants`
*   **Fields:** `serviceTier` (Dropdown), `costMultiplier` (Number, Admin-only).
*   **Enforcement:** Handled via `afterChange` hook in the `Posts` collection during the credit deduction phase.
