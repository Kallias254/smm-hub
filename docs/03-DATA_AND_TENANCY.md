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
