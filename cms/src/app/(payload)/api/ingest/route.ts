import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

/**
 * INGESTION API: The gateway for Spoke Apps.
 * POST /api/ingest
 */
export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const { key, type, title, data, channels, mediaUrl, publishImmediately, recurrence, scheduledAt } = body

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

    // 1b. Find a Campaign for this Tenant (Fallback)
    const campaigns = await payload.find({
      collection: 'campaigns',
      where: {
        tenant: { equals: tenant.id }
      },
      limit: 1,
    })

    const campaignId = campaigns.docs.length > 0 ? campaigns.docs[0].id : undefined

    // 2. Handle External Media (The Automation Ear)
    let rawMediaId: string | number | undefined = undefined

    if (mediaUrl) {
      try {
        console.log(`[Ingest] Downloading external media: ${mediaUrl}`)
        const response = await fetch(mediaUrl)
        if (!response.ok) throw new Error(`Failed to fetch media: ${response.statusText}`)

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Extract filename and mime type
        const contentType = response.headers.get('content-type') || 'application/octet-stream'
        const urlParts = mediaUrl.split('/')
        const fileName = urlParts[urlParts.length - 1] || `ingested-file-${Date.now()}`

        // Create Media Record in Payload
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: `Ingested from ${type}`,
            tenant: tenant.id,
          },
          file: {
             data: buffer,
             name: fileName,
             mimetype: contentType,
             size: buffer.byteLength,
          }
        })

        rawMediaId = media.id
        console.log(`[Ingest] Successfully ingested media ID: ${rawMediaId}`)
      } catch (err: any) {
        console.error(`[Ingest] Media Ingestion Failed: ${err.message}`)
        // We continue anyway, post can be created without media if necessary
      }
    }

    // 3. Create the Post
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: title || `Ingested ${type} - ${new Date().toLocaleDateString()}`,
        tenant: tenant.id,
        campaign: campaignId, 
        distributionStatus: publishImmediately ? 'queued' : 'pending',
        scheduledAt: scheduledAt || (publishImmediately ? new Date().toISOString() : undefined),
        recurrenceInterval: recurrence || 'none',
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
      mediaId: rawMediaId,
      message: publishImmediately ? 'Post ingested and queued for distribution.' : 'Post ingested as pending draft.'
    })

  } catch (error: any) {
    console.error('[Ingestion Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}