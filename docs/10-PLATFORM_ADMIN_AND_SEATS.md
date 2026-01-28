# Platform Administration & Seat Management

## 1. The "GitHub" Membership Model

SMM Hub implements a "One Account, Many Organizations" model. This allows freelancers and agency staff to work across multiple clients without managing multiple sets of credentials.

### How it works
1.  **Identity:** A User is defined by their Email.
2.  **Membership:** A User record in the CMS contains an array of `Tenants`.
3.  **Sync:** The CMS acting as the **Source of Truth** uses a `syncPostizMemberships` hook to replicate these memberships into the Postiz PostgreSQL database via direct SQL injection.

---

## 2. Platform Admin Oversight (The "Super-Seat")

To ensure the platform owner can support clients effectively, the system implements **Automatic Oversight**:

*   **Logic:** Every time a new Tenant is created, the email `admin@example.com` is automatically inserted into that Tenant's Postiz Organization.
*   **Benefit:** The Super Admin can log into any `*.postiz.localhost` subdomain and see the client's dashboard exactly as they do. They can jump between workspaces using the native Postiz switcher.

---

## 3. Seat Management (Enterprise Grade)

To protect the platform's revenue and ensure billing integrity, we enforce seat limits at the CMS level.

### The seatLimit Field
Found in the `billing` group of the `Tenants` collection. It defines the maximum number of people (Agents/Owners) allowed to be linked to that specific agency.

### The Enforce Seat Hook (`enforceSeatLimits`)
A `beforeValidate` hook on the `Users` collection:
1.  Intercepts any attempt to link a user to a tenant.
2.  Counts the number of existing users linked to that tenant.
3.  Compares the count against the tenant's `seatLimit`.
4.  **Action:** Throws a validation error if the limit is exceeded, blocking the save operation.

---

## 4. Security Hardening

To prevent clients from bypassing the CMS seat management, we lock down the Postiz frontend:

*   **DISABLE_REGISTRATION:** Set to `true` in environment variables. This removes the "Sign Up" button.
*   **Direct Provisioning:** Because memberships are handled via SQL "behind the back" of the Postiz API, users are granted access without ever needing to use the Postiz invite system.
*   **Centralized Revocation:** Unchecking an agency box in the CMS instantly executes a `DELETE` on the Postiz `UserOrganization` table, revoking dashboard access in real-time.

---

## 5. Summary Table

| Feature | SMM Hub CMS | Postiz Dashboard |
| :--- | :--- | :--- |
| **New User** | Create in `Users` | Automatically Created |
| **Add Seat** | Select Agency in User Profile | Automatically Linked |
| **Remove Seat** | Uncheck Agency | Automatically Deleted |
| **Switch Agency** | N/A (Handled via RLS) | Use Workspace Switcher (Top Right) |
| **Admin Access** | Full Permissions | Member of All Organizations |
