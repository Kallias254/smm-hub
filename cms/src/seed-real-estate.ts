import { getPayload } from 'payload'
import config from './payload.config'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function seedRealEstate() {
  const payload = await getPayload({ config })
  
  // Find Gamma Agency
  const tenants = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: 'gamma-agency' } }
  })
  
  if (tenants.totalDocs === 0) {
      console.log('Gamma Agency not found')
      return
  }
  
  const gamma = tenants.docs[0]
  
  // 0. Ensure Media exists
  let mediaId = null
  const existingMedia = await payload.find({
      collection: 'media',
      where: { alt: { equals: 'Luxury Villa Preview' } }
  })

  if (existingMedia.totalDocs > 0) {
      mediaId = existingMedia.docs[0].id
  } else {
      const media = await payload.create({
          collection: 'media',
          data: {
              alt: 'Luxury Villa Preview',
              tenant: gamma.id,
          },
          filePath: path.resolve(__dirname, '../public/test-house.jpg'),
      })
      mediaId = media.id
  }
  
  // Create a Real Estate Post
  const title = 'Luxury Villa in Karen'
  
  // Check if exists
  const existing = await payload.find({
      collection: 'posts',
      where: { title: { equals: title } }
  })
  
  if (existing.totalDocs > 0) {
      console.log('Post already exists. Updating with image.')
      // Ensure it is published and has the media
      await payload.update({
          collection: 'posts',
          id: existing.docs[0].id,
          data: { 
            distributionStatus: 'published',
            assets: {
                brandedMedia: mediaId
            }
          }
      })
      console.log('Updated existing post.')
      process.exit(0)
  }

  // Create it
  await payload.create({
      collection: 'posts',
      data: {
          title: title,
          tenant: gamma.id,
          distributionStatus: 'published',
          channels: ['instagram', 'facebook'],
          assets: {
              brandedMedia: mediaId
          },
          content: [{
              blockType: 'real-estate-listing',
              data: {
                  price: 'KES 85,000,000',
                  location: 'Karen, Nairobi',
                  propertyType: 'Villa',
                  propertyCategory: 'Residential',
                  propertyStatus: 'For Sale',
                  features: '5 Bed | 6 Bath | 0.5 Acre | Pool',
                  description: 'Exquisite modern villa with a private pool and lush gardens.',
                  agentName: 'Jane Doe',
                  agentPhone: '254700000000'
              }
          }]
      }
  })
  
  console.log(`Created "${title}" for Gamma Agency.`)
  process.exit(0)
}

seedRealEstate()
