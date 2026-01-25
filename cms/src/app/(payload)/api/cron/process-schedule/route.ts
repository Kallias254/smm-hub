import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

/**
 * CRON TRIGGER: This endpoint should be hit every minute.
 * It looks for posts scheduled for NOW and pushes them into the distribution queue.
 */
export const GET = async (req: Request) => {
  try {
    // 1. Security Check (Optional but recommended)
    // You can set a CRON_SECRET in .env and check it here via header
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const now = new Date().toISOString()

    // 2. Find Posts ready to go
    // We look for: status = 'queued' AND scheduledAt <= NOW
    const readyPosts = await payload.find({
      collection: 'posts',
      where: {
        and: [
          {
            distributionStatus: {
              equals: 'queued',
            },
          },
          {
            scheduledAt: {
              less_than_equal: now,
            },
          },
        ],
      },
    })

    console.log(`[Cron] Heartbeat check at ${now}. Found ${readyPosts.docs.length} posts ready for release.`)

    // 3. Trigger Distribution for each
    const results = await Promise.all(readyPosts.docs.map(async (post) => {
      try {
        await payload.jobs.queue({
          task: 'publishToPostiz',
          input: {
            postId: post.id,
            channels: post.channels || [],
          },
        })
        return { id: post.id, status: 'triggered' }
      } catch (err: any) {
        return { id: post.id, status: 'error', error: err.message }
      }
    }))

    return NextResponse.json({
      success: true,
      processed: readyPosts.docs.length,
      details: results
    })

  } catch (error: any) {
    console.error('[Cron Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
