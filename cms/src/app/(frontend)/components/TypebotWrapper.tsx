'use client'

import { Standard } from '@typebot.io/react'

export function TypebotWrapper({ 
  agencyName, 
  primaryColor 
}: { 
  agencyName: string; 
  primaryColor: string 
}) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Standard
        typebot="real-estate-concierge" 
        apiHost="https://viewer.typebot.localhost"
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        prefilledVariables={{
          AgencyName: agencyName,
          PrimaryColor: primaryColor
        }}
      />
    </div>
  )
}