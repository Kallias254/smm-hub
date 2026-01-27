# Architecture Overview

## 1. High-Level Design (The "Factory" Model)

SMM Hub is not a standard SaaS. It is a **Content Manufacturing Plant**.

*   **Input:** Raw Data (Property details, Sports scores, Retail items).
*   **Process:** The Creative Engine (Satori/FFmpeg) applies a "Brand Skin".
*   **Output:** Finished Social Media Assets (Images/Videos) sent to Postiz.

---

## 2. The Tech Stack

*   **Core CMS:** Payload CMS v3 (Next.js 15).
*   **Database:** PostgreSQL (Relation-heavy data).
*   **Queue System:** Payload Jobs (Redis-backed in production).
*   **Creative Engine:**
    *   *Images:* Satori (HTML -> SVG -> PNG).
    *   *Videos:* Remotion / FFmpeg (Programmatic Video).
*   **Distribution:** Postiz (Self-hosted via Docker).
*   **Multi-Tenancy:** Subdomain Isolation (`client.smmhub.com`).

---

## 3. Data Flow

1.  **Ingestion:**
    *   Manual: Mobile App Upload.
    *   Automated: `POST /api/ingest` (from Client CRM).
2.  **Creation:**
    *   Job: `generateBrandedImage` or `generateBrandedVideo`.
    *   Cost: Credits deducted from Tenant.
3.  **Approval:**
    *   Draft sent to App.
    *   User clicks "Approve".
4.  **Distribution:**
    *   Job: `publishToPostiz`.
    *   Postiz pushes to FB/IG/LinkedIn.

---

## 4. Security & Isolation

*   **Row-Level Security (RLS):** Every query is filtered by `user.tenant`.
*   **Subdomain Routing:** `middleware.ts` enforces `X-Tenant-Subdomain`.
*   **Ingestion Keys:** Unique per tenant to prevent data pollution.

---

## 6. Multi-Niche Architecture (The "Block" Strategy)

You asked: *"What if I give you a real estate agent? ... How do we handle niches?"*

We do **not** build separate apps. We use **Blocks**.

### The "One App, Many Skins" Approach

1.  **The Core is Generic:**
    *   Every post has `Title`, `ScheduledAt`, `Status`.
    *   This never changes, whether you sell shoes or houses.

2.  **The Difference is in the "Block":**
    *   We defined specific **Data Blocks** in `CreativeBlocks.ts`:
        *   `RealEstateListing` Block: Has fields for Price, Location, Features.
        *   `SportsFixture` Block: Has fields for Team A, Team B, Odds.
        *   `RetailProduct` Block: Has fields for Price, Sale Price, Stock.

3.  **The Template Router:**
    *   When the Creative Engine runs, it looks at the Block Type.
    *   If `type === 'real-estate'`, it loads `RealEstateTemplate01.tsx`.
    *   If `type === 'retail'`, it loads `ProductTemplate01.tsx`.

### Why this scales
*   **New Niche = New Template.** You don't rewrite the backend.
*   **New Client = New Tenant.** You just create "Shoe Palace" as a tenant and give them the Retail Block.
*   **Centralized Control:** You manage all 50 niches from **One Dashboard**.

*Your SMM Hub is a "Universal Adapter" for social media.*