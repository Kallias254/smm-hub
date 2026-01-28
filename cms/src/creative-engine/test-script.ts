import { generateBrandedImage } from './generator'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testSatori() {
  console.log('🎨 Starting Satori Magic Show...')

  // 1. Let's use our local High-Quality Test Image
  const imagePath = path.resolve(__dirname, '../../public/test-house.jpg')
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`

  // 2. Generate the Branded Version
  console.log('✨ Applying Gold Standard Template...')
  const pngBuffer = await generateBrandedImage({
    imageUrl: base64Image,
    agencyLogo: 'https://cdn-icons-png.flaticon.com/512/69/69840.png', // Generic "House" icon
    primaryColor: '#FFD700', // PURE GOLD
    data: {
      template: 'real-estate-listing',
      price: 'KES 85,000,000',
      location: 'Karen, Nairobi',
      features: 'Luxury Villa | 5 Bed | Pool',
    }
  })

  // 3. Save it to disk so you can see it
  const outputPath = path.resolve(__dirname, '../../public/satori-test-output.png')
  // Ensure directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  
  fs.writeFileSync(outputPath, pngBuffer)
  
  console.log('✅ DONE! Witness the result here:')
  console.log(outputPath)
}

testSatori().catch(console.error)
