import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

/**
 * EVERGREEN CONTENT CRON
 * Process Content Groups (Libraries) and trigger the next post in the queue.
 */
export const GET = async (req: Request) => {
  try {
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const now = new Date()

    // 1. Find Active Groups due for a run
    const dueGroups = await payload.find({
      collection: 'content-groups',
      where: {
        and: [
          { status: { equals: 'active' } },
          { nextRun: { less_than_equal: now.toISOString() } },
        ],
      },
      limit: 50, // Process in batches
    })

    console.log(`[Evergreen Cron] Found ${dueGroups.docs.length} groups due.`)

    const results = await Promise.all(dueGroups.docs.map(async (group) => {
      try {
        // 2. Find Candidate Posts
        // We want the posts that haven't been used recently
        const candidates = await payload.find({
          collection: 'posts',
          where: {
            contentGroup: { equals: group.id },
          },
          sort: 'usageStats.lastUsedAt', // Oldest used first (Cycle strategy default)
          limit: 10, 
        })

        if (candidates.docs.length === 0) {
            return { groupId: group.id, status: 'empty' }
        }

        // 3. Select Winner based on Strategy
        let winner = candidates.docs[0]
        
        if (group.strategy === 'shuffle') {
            const randomIndex = Math.floor(Math.random() * candidates.docs.length)
            winner = candidates.docs[randomIndex]
        }
        
        // 4. Trigger Distribution
        // We use the Group's channels if defined, otherwise fall back to Post's channels
        const targetChannels = group.channels && group.channels.length > 0 
            ? group.channels 
            : (winner.channels || [])

        if (targetChannels.length > 0) {
            await payload.jobs.queue({
                task: 'publishToPostiz',
                input: {
                    postId: winner.id,
                    channels: targetChannels,
                }
            })
        } else {
             console.warn(`[Evergreen] Group ${group.title} has no channels.`)
        }

        // 5. Update Usage Stats on the Post
        await payload.update({
            collection: 'posts',
            id: winner.id,
            data: {
                usageStats: {
                    usageCount: (winner.usageStats?.usageCount || 0) + 1,
                    lastUsedAt: new Date().toISOString()
                }
            }
        })

        // 6. Schedule Next Run for the Group
        const nextRun = new Date() // Start from NOW, not the old scheduled time, to prevent catch-up loops
        
        // Basic Frequency Logic
        if (group.frequency === 'daily') {
             nextRun.setDate(nextRun.getDate() + 1)
        } else if (group.frequency === 'weekly') {
             nextRun.setDate(nextRun.getDate() + 7)
        } else if (group.frequency === 'monthly') {
             nextRun.setMonth(nextRun.getMonth() + 1)
        }

        // Apply Time of Day (e.g. "09:00")
        if (group.timeOfDay) {
            const [hours, minutes] = group.timeOfDay.split(':').map(Number)
            if (!isNaN(hours) && !isNaN(minutes)) {
                nextRun.setHours(hours, minutes, 0, 0)
            }
        }

        // Ensure it's in the future (if timeOfDay moved it back to this morning)
        if (nextRun <= now) {
            if (group.frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1)
            // ... strict handling for others if needed
        }

        await payload.update({
            collection: 'content-groups',
            id: group.id,
            data: {
                nextRun: nextRun.toISOString(),
                lastRun: now.toISOString(),
            }
        })

        return { groupId: group.id, status: 'success', postId: winner.id, nextRun: nextRun.toISOString() }

      } catch (err: any) {
        console.error(`[Evergreen Error] Group ${group.id}:`, err)
        return { groupId: group.id, status: 'error', error: err.message }
      }
    }))

    return NextResponse.json({
      success: true,
      processed: results
    })

  } catch (error: any) {
    console.error('[Cron Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
