# Subdomain Multi-Tenancy Architecture: SMM Hub + Postiz

## 1. Status: IMPLEMENTED (Level 2)
We have successfully transitioned from URL parameters (`?workspace=slug`) to **Subdomain Isolation**. This provides a professional "immersed" experience where each tenant operates in their own scoped environment.

### URL Structure (Local Dev)
- **Global Admin**: `https://admin.smmhub.localhost/admin`
- **Agency Hub**: `https://{subdomain}.smmhub.localhost/admin`
- **Agency Postiz**: `https://{subdomain}.postiz.localhost`

---

## 2. Implementation Details

### A. Payload CMS (`Tenants` Collection)
- Added `subdomain` field: Mandatory, unique, regex validated (`^[a-z0-9-]+$`).
- Protected subdomains (www, admin, api, etc.) are restricted via validation hook.
- `postizApiKey` is now `readOnly` in Admin UI as it is auto-provisioned.

### B. Automated Provisioning
- The `afterChange` hook on `Tenants` now uses the `subdomain` as the official `slug` for the Postiz Organization.
- Direct SQL insertion into Postiz `Organization` and `UserOrganization` tables ensures real, persistent workspaces and owner linking.

### C. Caddy Reverse Proxy
- Acts as the single entry point for all traffic.
- Handles wildcard SSL/TLS for `*.smmhub.localhost` and `*.postiz.localhost`.
- Manages CORS headers and preflight `OPTIONS` requests at the edge.
- Routes Postiz traffic directly to internal orchestrator (port 5000) while preserving Host headers.

### D. Multi-Tenant Middleware
- `src/middleware.ts` extracts the subdomain from the Host header.
- Injects `X-Tenant-Subdomain` into request headers.
- Allows global access for protected subdomains while enforcing isolation for agency subdomains.

---

## 3. Configuration Summary

### Caddyfile Key Logic
```caddy
*.postiz.localhost {
    header {
        Access-Control-Allow-Origin {header.Origin}
        Access-Control-Allow-Credentials "true"
    }
    reverse_proxy postiz:5000 {
        header_up Host {host}
    }
}
```

### Postiz Environment Key Settings
- `NEXT_PUBLIC_BACKEND_URL: '/api'` (Relative path for same-origin reliability).
- `MAIN_URL` & `FRONTEND_URL` set to `https://postiz.localhost`.

---

## 4. Operational Commands

### Adding New Subdomains (Local)
Add to `/etc/hosts`:
```text
127.0.0.1  newagency.smmhub.localhost newagency.postiz.localhost
```

### Creating Tenants
```bash
cd cms && npx tsx src/create-tenant-auto.ts
```

---

## 5. Next Steps (Level 3)
- [ ] **Row-Level Security**: Implement access control hooks in SMM Hub that utilize the `X-Tenant-Subdomain` header to auto-filter all collection queries.
- [ ] **Custom Domain Support**: Add support for agency-owned domains (e.g., `social.nebula.com`).
- [ ] **Global Dashboard**: Build a system-wide analytics view for Superadmins using the Master Postiz Key.