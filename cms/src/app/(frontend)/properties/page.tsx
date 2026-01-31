import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { PropertiesClient } from './PropertiesClient'
import { Box } from '@mantine/core'
import { StorefrontHeader } from '../components/StorefrontHeader'
import { StorefrontFooter } from '../components/StorefrontFooter'

export default async function PropertiesPage() {
  const headerList = await headers()
  const subdomain = headerList.get('x-tenant-subdomain')
  const payload = await getPayload({ config })

  // 1. Fetch Tenant
  const tenantRes = await payload.find({
    collection: 'tenants',
    where: { subdomain: { equals: subdomain } },
    limit: 1
  })

  const tenant = tenantRes.docs[0]
  if (!tenant) {
    return <Box>Tenant not found</Box>
  }

  // 2. Fetch All Published Posts
  const postsRes = await payload.find({
    collection: 'posts',
    where: {
      tenant: { equals: tenant.id },
      distributionStatus: { equals: 'published' }
    },
    depth: 2,
    limit: 100,
    sort: '-updatedAt'
  })

  const primaryColor = (tenant as any).branding?.primaryColor || '#228be6'

  return (
    <Box mih="100vh" style={{ backgroundColor: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }}>
      {/* Main Catalog View */}
      <PropertiesClient 
        initialPosts={postsRes.docs} 
        primaryColor={primaryColor} 
        tenantName={tenant.name} 
      />
    </Box>
  )
}
