# Subdomain Multi-Tenancy Architecture: SMM Hub + Postiz

## 1. The Strategy
We are moving from URL parameters (`?workspace=slug`) to **Subdomain Isolation**. This is the professional standard for SaaS, ensuring that a tenant is "immersed" in their own environment.

### URL Structure
- **Global Admin**: `admin.smmhub.localhost`
- **Agency A SMM Hub**: `agency-a.smmhub.localhost/admin`
- **Agency A Postiz**: `agency-a.postiz.localhost`

---

## 2. Payload CMS Changes (`Tenants` Collection)

### Schema Updates
We need to add a `subdomain` field to the `Tenants` collection. This field will be the "Identity Key" for the entire stack.

- **Field**: `subdomain`
- **Properties**: `Unique`, `Required`, `Pattern: ^[a-z0-9-]+$`
- **Validation**: Ensure it doesn't clash with protected subdomains (e.g., `www`, `api`, `admin`).

### Provisioning Hook Update
The `afterChange` hook must ensure that the `Organization` slug in Postiz matches the `subdomain` in SMM Hub. This keeps the URL mapping 1:1.

---

## 3. Caddy Configuration (The Reverse Proxy)

Caddy will act as the traffic controller. It will automatically handle SSL and route requests based on the subdomain.

### `Caddyfile` Example
```caddy
# SMM HUB - MAIN APP & API
*.smmhub.localhost {
    reverse_proxy localhost:3000
}

# POSTIZ - SOCIAL DISTRIBUTION
*.postiz.localhost {
    reverse_proxy localhost:4007
}

# GLOBAL ADMIN (Optional separate route)
admin.smmhub.localhost {
    reverse_proxy localhost:3000
}
```

---

## 4. Multi-Tenant Middleware (Next.js)

We implement a `middleware.ts` in SMM Hub to detect the tenant from the host.

```typescript
// Conceptual Middleware Logic
export function middleware(request: NextRequest) {
  const host = request.headers.get('host'); // e.g., nebula.smmhub.localhost
  const subdomain = host.split('.')[0];
  
  // 1. If subdomain is 'admin', allow global access
  // 2. Otherwise, verify subdomain exists in Tenants collection
  // 3. Inject Tenant ID into the request headers for Payload to use
}
```

---

## 5. Spoke Integration (The "Hub & Spoke" Flow)

Spoke agencies (external apps) will now have a cleaner integration:

1. **Endpoint**: `https://{agency-slug}.smmhub.com/api/ingest`
2. **Benefit**: The Hub automatically knows the tenant context from the URL.
3. **Isolation**: If Agency A sends a request to Agency B's subdomain, it will fail even with a valid key, adding a layer of security.

---

## 6. Implementation Checklist

1. [ ] **Payload**: Add `subdomain` field to `Tenants.ts`.
2. [ ] **Payload**: Update `createPostizWorkspace` hook to use the `subdomain` as the Postiz Org slug.
3. [ ] **Caddy**: Create a `Caddyfile` and add it to `docker-compose.yml`.
4. [ ] **Next.js**: Implement `middleware.ts` to enforce tenant isolation at the routing level.
5. [ ] **UI**: Update `IntegrationsList.tsx` to link to `https://{subdomain}.postiz.localhost`.

---

## 7. Local Development Tip
To test this locally without a real domain, add these to your `/etc/hosts` (or use a tool like `dnsmasq`):
```text
127.0.0.1  admin.smmhub.localhost
127.0.0.1  nebula.smmhub.localhost
127.0.0.1  nebula.postiz.localhost
```
