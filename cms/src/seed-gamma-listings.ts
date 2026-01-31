import { getPayload } from 'payload'
import config from './payload.config'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function downloadImage(url: string, filename: string): Promise<string> {
  const dest = path.resolve(__dirname, `../public/${filename}`)
  if (fs.existsSync(dest)) return dest

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  
  const fileStream = fs.createWriteStream(dest)
  await finished(Readable.fromWeb(response.body as any).pipe(fileStream))
  return dest
}

async function seedGammaListings() {
  const payload = await getPayload({ config })
  
  const tenants = await payload.find({
      collection: 'tenants',
      where: { subdomain: { equals: 'gamma' } }
  })
  
  if (tenants.totalDocs === 0) {
      console.log('Gamma Agency (subdomain: gamma) not found')
      return
  }
  
  const gamma = tenants.docs[0]

  const listings = [
    {
        title: 'Modern 3 Bedroom Apartment',
        status: 'For Rent',
        price: 'KES 120,000/mo',
        location: 'Westlands, Nairobi',
        features: '3 Bed | 3 Bath | 1800 sqft | Gym | Pool',
        propertyType: 'Apartment',
        deposit: '120,000',
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
        imageName: 'gamma-apt.jpg'
    },
    {
        title: 'Luxury 5 Bedroom Mansion',
        status: 'For Sale',
        price: 'KES 95,000,000',
        salePrice: '95000000',
        location: 'Karen, Nairobi',
        features: '5 Bed | 6 Bath | 5000 sqft | Garden | Security',
        propertyType: 'Mansion',
        deposit: 'Negotiable',
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
        imageName: 'gamma-mansion.jpg'
    },
    {
        title: 'Elegant 4 Bedroom Townhouse',
        status: 'For Sale',
        price: 'KES 45,000,000',
        salePrice: '45000000',
        location: 'Lavington, Nairobi',
        features: '4 Bed | 4 Bath | 3200 sqft | SQ | Gated',
        propertyType: 'Townhouse',
        deposit: '5,000,000',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        imageName: 'gamma-townhouse.jpg'
    },
    {
        title: 'Cosy 1 Bedroom Studio',
        status: 'For Rent',
        price: 'KES 45,000/mo',
        location: 'Kilimani, Nairobi',
        features: '1 Bed | 1 Bath | 600 sqft | WiFi | Lift',
        propertyType: 'Studio',
        deposit: '45,000',
        imageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1600&q=80',
        imageName: 'gamma-studio.jpg'
    }
  ]

  for (const listing of listings) {
    // 1. Download and Create Media for this specific listing
    console.log(`Processing media for: ${listing.title}...`)
    let mediaId = null
    try {
        const filePath = await downloadImage(listing.imageUrl, listing.imageName)
        const media = await payload.create({
            collection: 'media',
            data: {
                alt: listing.title,
                tenant: gamma.id,
            },
            filePath,
        })
        mediaId = media.id
    } catch (err) {
        console.error(`Failed to process media for ${listing.title}:`, err)
    }

    const existing = await payload.find({
        collection: 'posts',
        where: { title: { equals: listing.title } }
    })

    const postData: any = {
        title: listing.title,
        tenant: gamma.id,
        distributionStatus: 'published',
        content: [{
            blockType: 'real-estate-listing',
            data: {
                propertyStatus: listing.status,
                price: listing.price,
                salePrice: listing.salePrice,
                location: listing.location,
                features: listing.features,
                propertyType: listing.propertyType,
                propertyCategory: 'Residential',
                deposit: listing.deposit,
                agentName: 'Gamma Agent',
                agentPhone: '254700000000',
                description: `A beautiful ${listing.propertyType} located in the heart of ${listing.location.split(',')[0]}. Featuring ${listing.features.split('|')[0].trim()} and premium finishes.`,
            }
        }]
    }

    if (mediaId) {
        postData.assets = { brandedMedia: mediaId }
    }

    if (existing.totalDocs > 0) {
        console.log(`Updating existing listing: ${listing.title}`)
        await payload.update({
            collection: 'posts',
            id: existing.docs[0].id,
            data: postData
        })
    } else {
        console.log(`Creating new listing: ${listing.title}`)
        await payload.create({
            collection: 'posts',
            data: postData
        })
    }
  }
  
  console.log('Successfully seeded Gamma Agency listings with Unsplash images.')
  process.exit(0)
}

seedGammaListings()