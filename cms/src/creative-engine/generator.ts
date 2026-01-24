import satori from 'satori'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { RealEstateTemplate01 } from './templates/RealEstateTemplate01'
import { SportsTemplate01 } from './templates/SportsTemplate01'
import React from 'react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load Font
const fontPath = path.resolve(__dirname, '../../public/fonts/Roboto-Bold.ttf')
const fontData = fs.readFileSync(fontPath)

export async function generateBrandedImage(data: {
  imageUrl: string
  price: string
  title: string
  agencyLogo?: string
  primaryColor?: string
  templateType?: 'real-estate' | 'sports'
}) {
  // Select Template based on type
  // In a real system, this could look up a component from a registry map
  const Template = data.templateType === 'sports' ? SportsTemplate01 : RealEstateTemplate01

  // 1. Render to SVG via Satori
  const svg = await satori(
    React.createElement(Template, data),
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
