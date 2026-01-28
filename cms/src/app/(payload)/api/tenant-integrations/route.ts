import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { postiz } from '../../../../distribution/postiz'

export const GET = async () => {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

        let apiKey: string | undefined = undefined
        let tenantName = 'Global System'
        let tenantSlug = 'global'
        let tenantSubdomain = 'admin'
    
        // HACK: For now, just use the FIRST tenant if a user belongs to multiple.
        // A real "Freelancer Mode" would require a tenant-switcher context passed via headers.
        if (user.tenants && user.tenants.length > 0) {
          const firstTenant = user.tenants[0]
          const tenantId = typeof firstTenant === 'object' ? firstTenant.id : firstTenant
          const tenant = await payload.findByID({
            collection: 'tenants',
            id: tenantId,
          })
          
          tenantName = tenant.name
          tenantSlug = tenant.slug
          tenantSubdomain = (tenant as any).subdomain || tenant.slug
          // Access the key from the 'integrations' group as defined in Tenants.ts
          apiKey = (tenant as any).integrations?.postizApiKey
    
          // If tenant exists but has no key, we return empty list but with a specific flag
          if (!apiKey) {
            return NextResponse.json({ 
              integrations: [], 
              tenantName, 
              tenantSlug,
              tenantSubdomain,
              missingKey: true 
            })
          }
        }
    
        // Fetch integrations using the specific key (or global fallback if admin has no tenant)
        try {
          const integrations = await postiz.getIntegrations(apiKey)
    
          return NextResponse.json({
            integrations,
            tenantName,
            tenantSlug,
            tenantSubdomain,
            missingKey: false
          })
        } catch (postizError: any) {
          // If the error is specifically about a missing key, handle it gracefully
          if (postizError.message.includes('not provided')) {
            return NextResponse.json({
              integrations: [],
              tenantName,
              tenantSlug,
              tenantSubdomain,
              missingKey: true
            })
          }      // Re-throw other unexpected errors (e.g. network timeout)
      throw postizError
    }

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
