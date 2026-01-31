import React from 'react'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import { ColorSchemeScript, MantineProvider, Box } from '@mantine/core'
import { theme } from './theme'
import './styles.css'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { StorefrontHeader } from './components/StorefrontHeader'
import { StorefrontFooter } from './components/StorefrontFooter'

export const metadata = {
  description: 'The high-performance content manufacturing plant for modern agencies.',
  title: 'SMM HUB',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const headerList = await headers()
  const subdomain = headerList.get('x-tenant-subdomain')
  const payload = await getPayload({ config })

  let tenant = null
  if (subdomain && subdomain !== 'admin') {
      const tenantRes = await payload.find({
          collection: 'tenants',
          where: { subdomain: { equals: subdomain } },
          limit: 1
      })
      if (tenantRes.docs.length > 0) {
          tenant = tenantRes.docs[0]
      }
  }

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
            {tenant ? (
                <Box mih="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
                    <StorefrontHeader tenant={tenant as any} />
                    <Box style={{ flex: 1 }}>
                        {children}
                    </Box>
                    <StorefrontFooter tenant={tenant as any} />
                </Box>
            ) : (
                 <main>{children}</main>
            )}
        </MantineProvider>
      </body>
    </html>
  )
}
