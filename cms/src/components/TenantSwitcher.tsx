'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

/**
 * TENANT SWITCHER (Subdomain-based)
 * 
 * This component allows users to switch between their agencies by
 * changing the browser subdomain.
 */
const TenantSwitcher: React.FC = () => {
  const { user } = useAuth()
  const [tenants, setTenants] = useState<any[]>([])
  const [currentSubdomain, setCurrentSubdomain] = useState('')

  useEffect(() => {
    // 1. Detect Current Subdomain
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    if (parts.length >= 3) {
      setCurrentSubdomain(parts[0])
    } else {
      setCurrentSubdomain('admin') // Root or default
    }

    // 2. Load Tenants
    if (user) {
      if (user.role === 'admin') {
        // Super Admin: Fetch all available tenants from the API
        fetch('/api/tenants?limit=100')
          .then((res) => res.json())
          .then((data) => {
            setTenants(data.docs || [])
          })
          .catch((err) => console.error('Failed to fetch global tenants:', err))
      } else {
        // Agency User: Use assigned tenants from JWT
        setTenants((user as any).tenants || [])
      }
    }
  }, [user])

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    
    let newUrl = ''
    
    if (slug === 'admin') {
      // Go to Global Admin
      if (parts.length >= 3) {
        newUrl = `${window.location.protocol}//admin.${parts.slice(1).join('.')}/admin`
      } else {
        newUrl = `${window.location.protocol}//admin.${hostname}/admin`
      }
    } else {
      // Go to Tenant Subdomain
      const tenant = tenants.find(t => t.id === slug || t.subdomain === slug)
      const sub = tenant?.subdomain || slug
      
      if (parts.length >= 3) {
        // replace first part
        newUrl = `${window.location.protocol}//${sub}.${parts.slice(1).join('.')}/admin`
      } else {
        newUrl = `${window.location.protocol}//${sub}.${hostname}/admin`
      }
    }

    if (newUrl) {
      window.location.href = newUrl
    }
  }

  if (!user) return null
  
  // Hide if non-admin and only has 1 tenant
  if (user.role !== 'admin' && tenants.length <= 1) {
    return null
  }

  return (
    <div style={{ padding: '20px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
      <label 
        style={{ 
          display: 'block', 
          fontSize: '10px', 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          marginBottom: '8px',
          opacity: 0.5,
          fontWeight: 'bold'
        }}
      >
        Active Agency
      </label>
      <select 
        value={currentSubdomain}
        onChange={handleSwitch}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '8px',
          color: 'var(--theme-text)',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="admin">🌍 Platform (Global)</option>
        {tenants.map((t) => (
          <option key={t.id} value={t.subdomain}>
            🏢 {t.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TenantSwitcher
