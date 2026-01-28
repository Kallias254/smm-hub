# Subdomain Multi-Tenancy Architecture: SMM Hub + Postiz

## 1. Status: IMPLEMENTED (Level 3)
We have successfully implemented **Enterprise-Grade Multi-Tenancy**. The system now supports a "GitHub-style" membership model where a single user can manage multiple businesses with a seamless workspace switcher.

### URL Structure (Local Dev)
- **Global Admin**: `https://admin.smmhub.localhost/admin`
- **Agency Hub**: `https://{subdomain}.smmhub.localhost/admin`
- **Agency Postiz**: `https://{subdomain}.postiz.localhost`

---

## 2. Implementation Details

### A. Payload CMS (`Users` Collection)
- **Many-to-Many Relationships**: Users are no longer tied to one tenant. They have a `tenants` relationship field with `hasMany: true`.
- **Membership Sync Hook**: `syncPostizMemberships` fires on `afterChange`. It uses direct SQL to ensure the Postiz database matches the CMS state perfectly.
- **Seat Management**: `enforceSeatLimits` hook prevents agencies from adding more users than their `seatLimit` allows.

### B. Platform Admin Oversight
- **Automatic Auto-Join**: The Postiz provisioning logic now automatically adds `admin@example.com` to **every** new organization.
- **Support Switcher**: Superadmins can log into any agency's Postiz subdomain and use the Workspace Switcher to jump between clients for debugging.

### C. Postiz Hardening
- **Physical .env Injection**: Resolved stability issues where Postiz backend would hang silently by programmatically injecting a physical `.env` file into the container.
- **Lockdown Mode**: `DISABLE_REGISTRATION: 'true'` ensures that the CMS is the **only** entry point for new users, preventing clients from bypassing seat limits.

### D. Multi-Tenant Middleware
- `src/middleware.ts` extracts the subdomain from the Host header.
- Injects `X-Tenant-Subdomain` into request headers.
- Allows global access for protected subdomains while enforcing isolation for agency subdomains.

---

## 3. Configuration Summary

### Membership Sync Logic (SQL)
```sql
-- Create User if missing
INSERT INTO "User" (email, password, ...) VALUES ($1, $2, ...) ON CONFLICT DO NOTHING;

-- Link to Organization
INSERT INTO "UserOrganization" (userId, organizationId, role) VALUES ($1, $2, 'ADMIN');
```

---

## 4. Operational Commands

### Global Repair Script
If the CMS and Postiz get out of sync, run the repair script:
```bash
cd cms && npx tsx src/sync-all-memberships.ts
```

### Creating Tenants
```bash
cd cms && npx tsx src/create-tenant-auto.ts
```

---

## 5. Next Steps (Level 4)
- [ ] **Mobile App Auth**: Connect the Flutter app to this multi-tenant backend using header injection.
- [ ] **Custom Domain Support**: Add support for agency-owned domains (e.g., `social.nebula.com`).
- [ ] **Agency Dashboard**: Build a custom view for Agency Owners to manage their seats and credits.
