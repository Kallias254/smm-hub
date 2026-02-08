'use client'

import React, { useState } from 'react'
import { Standard } from '@typebot.io/react'
import { FullScreenChatBlock } from '@/payload-types'
import { Loader, Center, Stack, Text } from '@mantine/core'

export const FullScreenChat: React.FC<FullScreenChatBlock & { primaryColor: string, tenantName?: string, tenantLogo?: any }> = ({ 
  typebotId, 
  primaryColor, 
  tenantName,
  tenantLogo 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 9999, // Over everything (Header/Footer)
      backgroundColor: 'var(--mantine-color-body, #000)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Loading State Overlay */}
      {!isLoaded && (
        <Center style={{ position: 'absolute', inset: 0, zIndex: 10000, backgroundColor: 'inherit' }}>
          <Stack align="center" gap="md">
             {tenantLogo?.url ? (
                <img 
                  src={tenantLogo.url} 
                  alt={tenantName} 
                  style={{ height: '60px', marginBottom: '20px', opacity: 0.8 }} 
                />
             ) : (
                <Text fw={700} size="xl" style={{ letterSpacing: '2px', opacity: 0.5 }}>{tenantName?.toUpperCase()}</Text>
             )}
            <Loader color={primaryColor} size="md" type="bars" />
          </Stack>
        </Center>
      )}

      <Standard
        typebot={typebotId}
        apiHost="https://viewer.typebot.localhost"
        style={{ width: '100%', height: '100%', border: 'none' }}
        prefilledVariables={{
          AgencyName: tenantName || 'Our Agency',
          PrimaryColor: primaryColor,
        }}
        onInit={() => {
            // Give it a tiny delay to ensure the iframe content has painted
            setTimeout(() => setIsLoaded(true), 500)
        }}
      />
    </div>
  )
}
