'use client'

import React from 'react'
import { Standard } from '@typebot.io/react'
import { FullScreenChatBlock } from '@/payload-types'

export const FullScreenChat: React.FC<FullScreenChatBlock & { primaryColor: string, tenantName?: string }> = ({ typebotId, primaryColor, tenantName }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <Standard
        typebot={typebotId}
        apiHost="https://viewer.typebot.localhost"
        style={{ width: '100%', height: '100%' }}
        prefilledVariables={{
          AgencyName: tenantName || 'Our Agency',
          PrimaryColor: primaryColor,
        }}
      />
    </div>
  )
}
