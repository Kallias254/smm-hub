'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@payloadcms/ui'

const NavIntegrationsLink: React.FC = () => {
  const { user } = useAuth()

  // Only show the Integrations link if the user is assigned to a tenant
  // or if they are a superadmin who explicitly wants to see global integrations.
  // For now, we hide it for global admins without a tenant to clean up the UI.
  if (!user || !user.tenant) {
    return null
  }

  return (
    <div style={{ marginTop: '20px', padding: '0 20px' }}>
      <Link 
        href="/admin/integrations" 
        style={{ 
          textDecoration: 'none', 
          color: 'var(--theme-text)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontWeight: 'bold',
          opacity: 0.8
        }}
      >
        <span style={{ fontSize: '20px' }}>🔌</span>
        <span>Integrations</span>
      </Link>
    </div>
  )
}

export default NavIntegrationsLink

