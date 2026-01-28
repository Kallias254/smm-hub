'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@payloadcms/ui'

const NavIntegrationsLink: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  // Admin sees everything. Tenants see only if assigned.
  const isAdmin = user.role === 'admin'
  const hasTenants = (user as any).tenants && (user as any).tenants.length > 0

  if (!isAdmin && !hasTenants) {
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

