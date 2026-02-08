import React from 'react'
import { HeroBlock } from '@/payload-types'
import { HeroSection } from '@/app/(frontend)/components/HeroSection'

export const Hero: React.FC<HeroBlock & { primaryColor: string }> = ({ headline, subtext, backgroundImage, primaryColor }) => {
  const bgImage = backgroundImage && typeof backgroundImage === 'object' ? backgroundImage : null

  if (!bgImage) {
    return <div>Background image not found</div>
  }
  
  return (
    <HeroSection 
        headline={headline}
        subtext={subtext}
        backgroundImage={bgImage}
        primaryColor={primaryColor}
    />
  )
}
