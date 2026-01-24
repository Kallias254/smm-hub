import React from 'react'
import { postiz } from '../distribution/postiz'

const IntegrationsView: React.FC = async () => {
  let integrations: any[] = []
  let error: string | null = null

  try {
    integrations = await postiz.getIntegrations()
  } catch (err: any) {
    error = err.message
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Channel Integrations</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        Manage your social media connections powered by Postiz.
      </p>

      {error && (
        <div style={{ padding: '20px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', color: '#c53030', marginBottom: '20px' }}>
          <strong>Error fetching integrations:</strong> {error}
          <br />
          <small>Make sure Postiz is running and POSTIZ_API_KEY is correct.</small>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {integrations.length === 0 && !error && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f7fafc', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
            <p>No channels connected yet.</p>
            <a 
              href="http://localhost:4007/integrations" 
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

      <div style={{ marginTop: '60px', padding: '20px', background: '#ebf8ff', borderRadius: '8px', border: '1px solid #bee3f8' }}>
        <h3>Advanced Settings</h3>
        <p>To add more channels or manage deep settings, use the infrastructure console:</p>
        <code style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>http://localhost:4007</code>
      </div>
    </div>
  )
}

export default IntegrationsView
