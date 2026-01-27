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
    *   `subscriptionStatus` (active, past_due)

### The `Users` Collection
*   **Relation:** Belongs to ONE `Tenant`.
*   **Role:** `admin` (System God), `tenant_owner` (Agency Boss), `agent` (Worker).
*   **Access Control:**
    ```typescript
    const filterByTenant = ({ req }) => {
      if (req.user.role === 'admin') return true;
      return {
        'tenant': {
          equals: req.user.tenant
        }
      };
    };
    ```

## 2. Core Collections

### `Campaigns`
*   **Title:** e.g., "Nairobi West Launch"
*   **Tenant:** Relationship
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

**Status:** ⚠️ CRITICAL VULNERABILITY DETECTED (2026-01-27)

### The Vulnerability
During a security audit, it was discovered that several core collections were configured with `read: () => true`. This means **unauthenticated users (public)** or users from **competing agencies** could query the API and download sensitive assets, campaign data, and content strategies.

### The Fix: "Smart Key" Logic
We must replace the open access with Row-Level Security (RLS) filters on all collections.

**The Golden Rule:**
1.  **Public:** NO Access (Return `false`).
2.  **Super Admin:** FULL Access (Return `true`).
3.  **Tenant User:** SCAMP Access (Return `{ tenant: { equals: user.tenant.id } }`).

### Implementation Checklist
| Collection | Status | Required Action |
| :--- | :--- | :--- |
| **Users** | ✅ Secure | Already implements RLS. |
| **Tenants** | ✅ Secure | Restricted to Admin & Owner (Self-Edit). |
| **Media** | ✅ Secure | Fixed on 2026-01-27. |
| **Posts** | ✅ Secure | RLS Filter Applied (2026-01-27). |
| **Campaigns** | ✅ Secure | RLS Filter Applied (2026-01-27). |
| **ContentGroups** | ✅ Secure | RLS Filter Applied (2026-01-27). |
| **Payments** | ✅ Secure | RLS Filter Applied (Strict) (2026-01-27). |

### Code Standard for Fix
All `access.read`, `access.update`, and `access.delete` properties must follow this pattern:

```typescript
access: {
  read: ({ req: { user } }) => {
    if (!user) return false // 1. Block Public
    if (user.role === 'admin') return true // 2. Allow Super Admin
    
    // 3. Filter by Tenant
    if (user.tenant) {
      const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
      return {
        tenant: {
          equals: tenantId,
        },
      }
    }
    return false
  }
}
```