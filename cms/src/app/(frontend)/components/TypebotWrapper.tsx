'use client'

import { Bubble } from '@typebot.io/react'

export function TypebotWrapper({ 
  agencyName, 
  primaryColor 
}: { 
  agencyName: string; 
  primaryColor: string 
}) {
  return (
    <Bubble
      typebot="real-estate-concierge" 
      apiHost="https://viewer.typebot.localhost"
      prefilledVariables={{
        AgencyName: agencyName,
        PrimaryColor: primaryColor
      }}
      theme={{
        button: {
          backgroundColor: primaryColor,
          customIconSrc: "https://cloud.typebot.io/public/workspaces/clm123/typebots/clm456/host-avatar?v=123", // Luxury icon placeholder
        }
      }}
    />
  )
}