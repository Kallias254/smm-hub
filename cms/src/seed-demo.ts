import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'
import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3'

async function seed() {
  console.log('🌱 Starting Seed Demo...')

  // 0. Ensure Bucket Exists
  if (process.env.S3_ENABLED === 'true') {
    console.log('🪣 Checking S3 Bucket...')
    const s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
    })

    const bucketName = process.env.S3_BUCKET || 'smm-hub-media'
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }))
      console.log(`🪣 Bucket "${bucketName}" already exists.`)
    } catch (err: any) {
      console.log(`🪣 Bucket "${bucketName}" not found. Creating...`)
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }))
      console.log(`🪣 Bucket "${bucketName}" created.`)
    }
  }

  const payload = await getPayload({ config })

  // 1. Create a Tenant
  console.log('🏢 Checking/Creating Tenant: Getin Sports...')
  const existingTenants = await payload.find({
    collection: 'tenants',
    where: {
      slug: { equals: 'getin-sports' }
    }
  })

  let tenant: any
  if (existingTenants.docs.length > 0) {
    console.log('🏢 Tenant already exists, using existing.')
    tenant = existingTenants.docs[0]
  } else {
    console.log('🏢 Creating new Tenant...')
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Getin Sports',
        slug: 'getin-sports',
        branding: {
          primaryColor: '#00ff00', // Sports Green
        },
      },
    })
  }

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
          data: {
            price: 'KES 45,000,000',
            location: 'Lavington, Nairobi',
            features: '4 Bed | 4 Bath | Garden',
          }
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
          data: {
            league: 'Premier League',
            homeTeam: 'Arsenal',
            awayTeam: 'Man City',
            matchTime: '22:00 EAT',
            prediction: 'Home Win 2-1',
          }
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
