import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

/**
 * INGESTION API: The gateway for Spoke Apps.
 * POST /api/ingest
 * Body: {
 *   "key": "TENANT_INGESTION_KEY",
 *   "type": "real-estate-listing" | "sports-fixture",
 *   "title": "Internal Reference Name",
 *   "data": { ... block fields ... },
 *   "channels": ["facebook", "whatsapp_status"],
 *   "mediaUrl": "https://example.com/image.jpg",
 *   "publishImmediately": false
 * }
 */
export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const { key, type, title, data, channels, mediaUrl, publishImmediately } = body

    if (!key) return NextResponse.json({ error: 'Missing Ingestion Key' }, { status: 400 })

    const payload = await getPayload({ config })

    // 1. Authenticate Tenant
    const tenants = await payload.find({
      collection: 'tenants',
      where: {
        'integrations.ingestionKey': {
          equals: key,
        },
      },
    })

    if (tenants.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid Ingestion Key' }, { status: 401 })
    }

    const tenant = tenants.docs[0]

    // 1b. Find a Campaign for this Tenant
    const campaigns = await payload.find({
      collection: 'campaigns',
      where: {
        tenant: { equals: tenant.id }
      },
      limit: 1,
    })

    if (campaigns.docs.length === 0) {
      return NextResponse.json({ error: 'No active campaign found for this tenant. Please create a campaign in SMM Hub first.' }, { status: 400 })
    }
    const campaignId = campaigns.docs[0].id

    // 2. Handle Media (if URL provided)
    let rawMediaId: number | undefined = undefined
// ...
    // 3. Create the Post
    // We map 'type' to 'blockType' and 'data' to the block fields
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: title || `Ingested ${type} - ${new Date().toLocaleDateString()}`,
        tenant: tenant.id,
        campaign: campaignId, 
        distributionStatus: publishImmediately ? 'queued' : 'pending',
        channels: channels || [],
        content: [
          {
            blockType: type, // e.g. 'real-estate-listing'
            ...data
          }
        ],
        assets: {
          rawMedia: rawMediaId
        }
      }
    })

    return NextResponse.json({
      success: true,
      postId: post.id,
      message: publishImmediately ? 'Post ingested and queued for distribution.' : 'Post ingested as pending draft.'
    })

  } catch (error: any) {
    console.error('[Ingestion Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
