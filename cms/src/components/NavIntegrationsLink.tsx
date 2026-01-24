import React from 'react'
import Link from 'next/link'

const NavIntegrationsLink: React.FC = () => {
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
