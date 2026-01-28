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

    // 1. Find Active Campaigns due for a run
    const dueCampaigns = await payload.find({
      collection: 'campaigns',
      where: {
        and: [
          { status: { equals: 'active' } },
          { nextRun: { less_than_equal: now.toISOString() } },
          { 'automation.frequency': { not_equals: 'manual' } },
        ],
      },
      limit: 50, 
    })

    console.log(`[Campaign Cron] Found ${dueCampaigns.docs.length} campaigns due.`)

    const results = await Promise.all(dueCampaigns.docs.map(async (campaign) => {
      try {
        // 2. Find Candidate Posts
        const candidates = await payload.find({
          collection: 'posts',
          where: {
            campaign: { equals: campaign.id },
          },
          sort: 'usageStats.lastUsedAt',
          limit: 10, 
        })

        if (candidates.docs.length === 0) {
            return { campaignId: campaign.id, status: 'empty' }
        }

        // 3. Select Winner based on Strategy
        let winner = candidates.docs[0]
        
        if (campaign.automation?.strategy === 'shuffle') {
            const randomIndex = Math.floor(Math.random() * candidates.docs.length)
            winner = candidates.docs[randomIndex]
        }
        
        // 4. Trigger Distribution
        const targetChannels = campaign.defaultChannels && campaign.defaultChannels.length > 0 
            ? campaign.defaultChannels 
            : (winner.channels || [])

        if (targetChannels.length > 0) {
            await payload.jobs.queue({
                task: 'publishToPostiz',
                input: {
                    postId: winner.id,
                    channels: targetChannels,
                }
            })
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

        // 6. Schedule Next Run
        const nextRun = new Date()
        const freq = campaign.automation?.frequency
        
        if (freq === 'daily') {
             nextRun.setDate(nextRun.getDate() + 1)
        } else if (freq === 'weekly') {
             nextRun.setDate(nextRun.getDate() + 7)
        } else if (freq === 'monthly') {
             nextRun.setMonth(nextRun.getMonth() + 1)
        }

        if (campaign.automation?.timeOfDay) {
            const [hours, minutes] = campaign.automation.timeOfDay.split(':').map(Number)
            if (!isNaN(hours) && !isNaN(minutes)) {
                nextRun.setHours(hours, minutes, 0, 0)
            }
        }

        if (nextRun <= now) {
            if (freq === 'daily') nextRun.setDate(nextRun.getDate() + 1)
        }

        await payload.update({
            collection: 'campaigns',
            id: campaign.id,
            data: {
                nextRun: nextRun.toISOString(),
                lastRun: now.toISOString(),
            }
        })

        return { campaignId: campaign.id, status: 'success', postId: winner.id, nextRun: nextRun.toISOString() }

      } catch (err: any) {
        console.error(`[Campaign Error] Campaign ${campaign.id}:`, err)
        return { campaignId: campaign.id, status: 'error', error: err.message }
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
