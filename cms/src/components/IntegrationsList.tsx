'use client'

import React, { useEffect, useState } from 'react'

const IntegrationsList: React.FC = () => {
  const [data, setData] = useState<{ integrations: any[], tenantName: string, tenantSlug: string, missingKey?: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tenant-integrations')
        if (!res.ok) {
          throw new Error(`API Error: ${res.statusText}`)
        }
        const jsonData = await res.json()
        setData(jsonData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div style={{ padding: '40px', color: '#666' }}>Loading integrations...</div>
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
         <div style={{ padding: '20px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', color: '#c53030' }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  const { integrations, tenantName, tenantSlug, missingKey } = data || { integrations: [], tenantName: 'System', tenantSlug: 'global' }

  // Construction of the Postiz URL
  // If Postiz supports workspace-based routing, we append the slug.
  // Otherwise, we keep it at the base launches page.
  const postizBaseUrl = 'http://localhost:4007'
  const postizWorkspaceUrl = tenantSlug === 'global' ? `${postizBaseUrl}/launches` : `${postizBaseUrl}/launches?workspace=${tenantSlug}`

  return (
    <div style={{ padding: '40px' }}>
      <h1>{tenantName} Integrations</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        Manage social media connections for {tenantName}.
      </p>

      {missingKey && (
         <div style={{ padding: '20px', background: '#fffaf0', border: '1px solid #fbd38d', borderRadius: '8px', color: '#c05621', marginBottom: '20px' }}>
          <strong>Setup Required:</strong> This Organization does not have a Postiz Workspace Key configured.
          <br/>
          <small>Please contact the System Administrator.</small>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {integrations.length === 0 && !missingKey && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f7fafc', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
            <p>No channels connected yet.</p>
            <a 
              href={postizWorkspaceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', background: '#3182ce', color: 'white', borderRadius: '6px', textDecoration: 'none' }}
            >
              Connect your first channel
            </a>
          </div>
        )}

        {integrations.map((integration: any) => (
          <div 
            key={integration.id} 
            style={{ 
              padding: '24px', 
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
             {integration.picture ? (
              <img src={integration.picture} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {integration.name?.[0] || '?' }
              </div>
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{integration.name}</div>
              <div style={{ color: '#718096', textTransform: 'capitalize' }}>{integration.identifier}</div>
            </div>

            <div style={{ padding: '4px 12px', background: '#c6f6d5', color: '#22543d', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              CONNECTED
            </div>
          </div>
        ))}
      </div>

       {!missingKey && (
        <div style={{ marginTop: '60px', padding: '20px', background: '#ebf8ff', borderRadius: '8px', border: '1px solid #bee3f8' }}>
          <h3>Settings</h3>
          <p>To add more channels, access the distribution console:</p>
          <code style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>
            <a href={postizWorkspaceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              {postizWorkspaceUrl}
            </a>
          </code>
        </div>
      )}
    </div>
  )
}

export default IntegrationsList
