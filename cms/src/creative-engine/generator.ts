import fs from 'fs'
import path from 'path'
import { RealEstateTemplate01 } from './templates/real-estate/RealEstateTemplate01'
import { SportsTemplate01 } from './templates/sports/SportsTemplate01'
import React from 'react'

// Load Font (Dynamic)
let fontDataCache: Buffer | null = null
const getFontData = () => {
  if (fontDataCache) return fontDataCache
  const fontPath = path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf')
  fontDataCache = fs.readFileSync(fontPath)
  return fontDataCache
}

export async function generateBrandedImage(input: {
  imageUrl: string
  agencyLogo?: string
  primaryColor?: string
  data: any // Flexible data from the Block
}) {
  const { data } = input
  const fontData = getFontData()
  
  // Dynamic imports for heavy deps
  const [{ default: satori }, { default: sharp }] = await Promise.all([
    import('satori'),
    import('sharp'),
  ])

  // Select Template based on Block Type (slug)
  let Template: any = RealEstateTemplate01 // Default

  if (data.template === 'sports-fixture') {
    Template = SportsTemplate01
  } else if (data.template === 'real-estate-listing') {
    Template = RealEstateTemplate01
  }

  // 1. Render to SVG via Satori
  const svg = await satori(
    React.createElement(Template, {
      ...data,
      imageUrl: input.imageUrl,
      agencyLogo: input.agencyLogo,
      primaryColor: input.primaryColor
    }),
    {
      width: 1080,
      height: 1350,
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )

  // 2. Convert SVG to PNG Buffer via Sharp
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  return pngBuffer
}