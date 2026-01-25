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
    const { key, type, title, data, channels, mediaUrl, publishImmediately, recurrence, scheduledAt } = body

    if (!key) return NextResponse.json({ error: 'Missing Ingestion Key' }, { status: 400 })

    const payload = await getPayload({ config })
// ... existing authentication code ...
    // 3. Create the Post
    // We map 'type' to 'blockType' and 'data' to the block fields
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: title || `Ingested ${type} - ${new Date().toLocaleDateString()}`,
        tenant: tenant.id,
        campaign: campaignId, 
        distributionStatus: publishImmediately ? 'queued' : 'pending',
        scheduledAt: scheduledAt || (publishImmediately ? new Date().toISOString() : undefined),
        recurrenceInterval: recurrence || 'none', // 'weekly', 'daily', etc.
        channels: channels || [],
        content: [
          {
            blockType: type, // e.g. 'real-estate-listing'
            data: data
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
