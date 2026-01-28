# Data & Tenancy: PostgreSQL Schema

**Philosophy:** Strict isolation. A "Tenant" (Agency) sees only their data. A "Client" (Property Owner) sees only their properties.

## 1. Multi-Tenancy Strategy

In Payload v3, we will use **Collections** with `access` control functions.

### The `Tenants` Collection
*   **Name:** `Agency Name`
*   **Slug:** `agency-id` (used for subdomains or routing)
*   **Config:**
    *   `brandColor` (Color picker)
    *   `watermarkLogo` (Upload)
    *   `mpesaShortcode` (for billing)
    *   `seatLimit` (Maximum freelancers allowed)
    *   `subscriptionStatus` (active, past_due)

### The `Users` Collection (GitHub Style)
*   **Relation:** Belongs to **MANY** `Tenants` (Relationship with `hasMany: true`).
*   **Role:** `admin` (System God), `tenant_owner` (Agency Boss), `agent` (Worker).
*   **Membership Sync:** An `afterChange` hook automatically replicates these relationships in the Postiz DB via direct SQL.
*   **Access Control:**
    ```typescript
    const filterByTenant = ({ req: { user } }) => {
      if (user.role === 'admin') return true;
      if (user.tenants) {
        return {
          'tenant': {
            in: user.tenants.map(t => typeof t === 'object' ? t.id : t)
          }
        };
      }
      return false;
    };
    ```

## 2. Core Collections

### `Campaigns`
*   **Title:** e.g., "Nairobi West Launch"
*   **Tenant:** Relationship (Scoped via RLS)
*   **Budget:** Number
*   **StartDate/EndDate:** Date
*   **Status:** Draft, Active, Completed

### `Posts`
*   **Campaign:** Relationship
*   **Media:** Upload (Relationship to `media` collection)
*   **GeneratedMedia:** Upload (The output from Satori/FFmpeg)
*   **Caption:** Rich Text
*   **Channels:** Select (Facebook, LinkedIn, X, WhatsApp_Manual)
*   **ScheduledAt:** Date
*   **DistributionStatus:**
    *   `pending`
    *   `queued` (sent to Postiz)
    *   `published`
    *   `failed`

## 3. Payments (M-Pesa Integration)

**Provider:** Safaricom Daraja API.

**Flow:**
1.  **Trigger:** Agent clicks "Renew Subscription" or "Buy Credits".
2.  **Action:** Payload backend calls `mpesa-stk-push` with Agent's phone number.
3.  **State:** Transaction record created with status `PENDING`.
4.  **Callback:** Safaricom hits `POST /api/webhooks/mpesa`.
5.  **Resolution:**
    *   Verify signature.
    *   Find Transaction by `CheckoutRequestID`.
    *   Update Status `COMPLETED`.
    *   Add credits/time to Tenant.

## 4. Panorama Data

For 360° Tours, we do **not** need a separate heavy collection.
*   We use the standard `Media` collection.
*   Add a custom field `isPanorama` (checkbox).
*   Frontend (React View) detects `isPanorama=true` and renders the `Pannellum` viewer instead of a standard `<img>` tag.

## 5. Security Audit & RLS Implementation Requirements

**Status:** ✅ SECURE (Fixed 2026-01-28)

### The "Smart Key" Logic
All collections implement Row-Level Security (RLS) filters.

**The Golden Rule:**
1.  **Public:** NO Access (Return `false`).
2.  **Super Admin:** FULL Access (Return `true`).
3.  **Tenant User:** SCAMP Access (Return `{ tenant: { in: user.tenants } }`).

### Implementation Checklist
| Collection | Status | Mechanism |
| :--- | :--- | :--- |
| **Users** | ✅ Secure | RLS based on `tenants` array. |
| **Tenants** | ✅ Secure | Restricted to Admin & Members. |
| **Media** | ✅ Secure | RLS Filter Applied. |
| **Posts** | ✅ Secure | RLS Filter Applied. |
| **Campaigns** | ✅ Secure | RLS Filter Applied. |
| **ContentGroups** | ✅ Secure | RLS Filter Applied. |
| **Payments** | ✅ Secure | RLS Filter Applied (Strict). |
