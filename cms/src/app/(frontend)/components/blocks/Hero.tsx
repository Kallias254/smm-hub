import React from 'react'
import { HeroBlock } from '@/payload-types'
import { HeroSection } from '@/app/(frontend)/components/HeroSection'

export const Hero: React.FC<HeroBlock & { primaryColor: string, tenantName?: string, tenantLogo?: any }> = ({ headline, subtext, backgroundImage, primaryColor }) => {
  const bgImage = backgroundImage && typeof backgroundImage === 'object' ? backgroundImage : null

  if (!bgImage || !bgImage.url) {
    return <div>Background image not found</div>
  }
  
  return (
    <HeroSection 
        headline={headline}
        subtext={subtext || ''}
        backgroundImage={{ url: bgImage.url }}
        primaryColor={primaryColor}
    />
  )
}
