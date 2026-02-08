import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import { Box } from '@mantine/core'
import { blockComponents } from './components/blocks'
import './styles.css'
import { Tenant } from '@/payload-types'

export default async function HomePage() {
  const headerList = await headers()
  const subdomain = headerList.get('x-tenant-subdomain')
  const payload = await getPayload({ config })

  console.log(`[Homepage] Rendering for subdomain: ${subdomain || 'none'}`)

  // SaaS Landing (Basic)
  if (!subdomain || subdomain === 'admin') {
    const { user } = await payload.auth({ headers: headerList })
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white">
        <h1 className="text-4xl font-light tracking-[0.5em] uppercase">SMM HUB</h1>
        <Link href="/admin" className="absolute bottom-10 text-[10px] tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">
          {user ? 'Enter Dashboard' : 'Login'}
        </Link>
      </div>
    )
  }

  const tenantRes = await payload.find({
    collection: 'tenants',
    where: { subdomain: { equals: subdomain } },
    limit: 1,
    depth: 1, // Make sure to populate the homepage relationship
  })

  const tenant = tenantRes.docs[0] as Tenant | null
  if (!tenant) {
    console.log('[Homepage] Tenant not found.')
    return <Box bg="black" mih="100vh" />
  }
  
  console.log(`[Homepage] Found Tenant: ${tenant.name}`)

  const homepage = tenant.homepage && typeof tenant.homepage === 'object' ? tenant.homepage : null

  if (!homepage || !homepage.layout) {
    console.log(`[Homepage] Homepage not configured for tenant: ${tenant.name}`)
    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center text-gray-800">
            <div className="text-center">
                <h1 className="text-2xl font-light">Homepage Not Configured</h1>
                <p className='opacity-60'>The homepage for this tenant has not been set up yet.</p>
                <Link href="/admin" className="mt-4 inline-block bg-black text-white px-4 py-2 rounded-md text-sm">
                    Go to Dashboard
                </Link>
            </div>
      </div>
    )
  }

  console.log(`[Homepage] Rendering homepage: "${homepage.title}"`)

  const primaryColor = tenant.branding?.primaryColor || '#228be6'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        :root {
          --font-serif: 'Playfair Display', serif;
          --font-editorial: 'Cormorant Garamond', serif;
        }
      `}} />
      {homepage.layout.map((block, i) => {
        // @ts-ignore
        const BlockComponent = blockComponents[block.blockType]
        if (BlockComponent) {
          // @ts-ignore
          return <BlockComponent key={i} {...block} primaryColor={primaryColor} />
        }
        return <div key={i}>Block not found: {block.blockType}</div>
      })}
    </>
  )
}
