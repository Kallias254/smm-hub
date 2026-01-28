import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import { StorefrontFactory } from './storefront/components/StorefrontFactory'
import './styles.css'

/**
 * THE UNIVERSAL ENTRY POINT
 * Routes users to the Storefront if on a subdomain, or the Platform landing page.
 */
export default async function HomePage() {
  const headerList = await headers()
  const subdomain = headerList.get('x-tenant-subdomain')

  // 1. Handle Platform Root (admin.smmhub.com or smmhub.com)
  if (!subdomain || subdomain === 'admin') {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: headerList })

    return (
      <div className="home bg-black min-h-screen flex items-center justify-center text-white">
        <div className="content text-center">
          <h1 className="text-4xl font-bold mb-6 tracking-tighter">SMM HUB PLATFORM</h1>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">
            The high-performance content manufacturing plant for modern agencies.
          </p>
          <div className="links flex gap-4 justify-center">
            <Link href="/admin" className="px-6 py-2 bg-white text-black font-bold rounded-full transition-transform active:scale-95">
              {user ? 'Go to Dashboard' : 'Login to Admin'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 2. Handle Tenant Storefront
  const payload = await getPayload({ config })

  // A. Fetch Tenant
  const tenantRes = await payload.find({
    collection: 'tenants',
    where: { subdomain: { equals: subdomain } },
    limit: 1
  })

  const tenant = tenantRes.docs[0]
  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-xl font-light opacity-50">Agency not found.</h1>
      </div>
    )
  }

  // B. Fetch Branded Posts
  const postsRes = await payload.find({
    collection: 'posts',
    where: {
      tenant: { equals: tenant.id },
      distributionStatus: { equals: 'published' }
    },
    depth: 2,
    sort: '-updatedAt'
  })

  const primaryColor = (tenant as any).branding?.primaryColor || '#FFFFFF'

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-zinc-500">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(tenant as any).branding?.logo?.url && (
              <img src={(tenant as any).branding.logo.url} className="h-8 w-auto" alt="Logo" />
            )}
            <h1 className="text-xl font-bold tracking-tight">{tenant.name}</h1>
          </div>
          <div className="hidden md:block">
             <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Catalog 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>Latest Showings</h2>
          <p className="mt-2 text-zinc-400">Curated branded content from our agency.</p>
        </div>

        {postsRes.docs.length > 0 ? (
          <StorefrontFactory posts={postsRes.docs} />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl text-center">
             <span className="text-5xl mb-4 grayscale">✨</span>
             <p className="text-zinc-500 italic">This agency is currently preparing its catalog.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950 py-12 mt-20">
        <div className="mx-auto max-w-7xl px-6 text-center text-zinc-600">
          <p className="text-sm tracking-widest uppercase font-medium">Powered by SMM HUB &copy; 2026</p>
        </div>
      </footer>
    </div>
  )
}
