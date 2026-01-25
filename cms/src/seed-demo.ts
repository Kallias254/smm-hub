// import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'

async function seed() {
  console.log('🌱 Starting Seed Demo...')
  const payload = await getPayload({ config })

  // 1. Create a Tenant
  console.log('🏢 Creating Tenant: Getin Sports...')
  const tenant = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Getin Sports',
      slug: 'getin-sports',
      branding: {
        primaryColor: '#00ff00', // Sports Green
      },
    },
  })

  // 2. Create a Campaign
  console.log('📅 Creating Campaign: Match Day Showcase...')
  const campaign = await payload.create({
    collection: 'campaigns',
    data: {
      title: 'Match Day Showcase',
      tenant: tenant.id,
      startDate: new Date().toISOString(),
      status: 'active',
    },
  })

  // 3. Upload Sample Media
  console.log('🖼️ Uploading Sample Media...')
  
  // Image
  const imagePath = path.resolve(__dirname, '../public/test-house.jpg')
  const imageBuffer = fs.readFileSync(imagePath)
  const rawImage = await payload.create({
    collection: 'media',
    data: { alt: 'Raw House Image', tenant: tenant.id },
    file: {
      data: imageBuffer,
      name: 'seed_house.jpg',
      mimetype: 'image/jpeg',
      size: imageBuffer.length,
    },
  })

  // Video
  const videoPath = path.resolve(__dirname, '../public/sample_input.mp4')
  const videoBuffer = fs.readFileSync(videoPath)
  const rawVideo = await payload.create({
    collection: 'media',
    data: { alt: 'Raw Sample Video', tenant: tenant.id },
    file: {
      data: videoBuffer,
      name: 'seed_video.mp4',
      mimetype: 'video/mp4',
      size: videoBuffer.length,
    },
  })

  // 4. Create Posts (These will trigger the hooks!)
  
  console.log('📝 Creating Real Estate Post (Image Generation)...')
  await payload.create({
    collection: 'posts',
    data: {
      title: 'Luxury Villa Demo',
      tenant: tenant.id,
      campaign: campaign.id,
      distributionStatus: 'pending',
      content: [
        {
          blockType: 'real-estate-listing',
          price: 'KES 45,000,000',
          location: 'Lavington, Nairobi',
          features: '4 Bed | 4 Bath | Garden',
        }
      ],
      assets: {
        rawMedia: rawImage.id,
      }
    }
  })

  console.log('📝 Creating Sports Fixture Post (Video Generation)...')
  await payload.create({
    collection: 'posts',
    data: {
      title: 'Arsenal vs Man City Prediction',
      tenant: tenant.id,
      campaign: campaign.id,
      distributionStatus: 'pending',
      content: [
        {
          blockType: 'sports-fixture',
          league: 'Premier League',
          homeTeam: 'Arsenal',
          awayTeam: 'Man City',
          matchTime: '22:00 EAT',
          prediction: 'Home Win 2-1',
        }
      ],
      assets: {
        rawMedia: rawVideo.id,
      }
    }
  })

  console.log('✅ Seed Complete! Posts created and processing triggered.')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed Failed:', err)
  process.exit(1)
})
