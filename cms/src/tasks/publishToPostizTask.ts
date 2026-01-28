import { TaskConfig } from 'payload'
import { postiz, PostizIntegration } from '../distribution/postiz'

/**
 * Helper to extract plain text from Payload Lexical RichText
 */
function extractTextFromLexical(root: any): string {
  if (!root || !root.children) return ''
  
  return root.children.map((child: any) => {
    if (child.type === 'text') {
      return child.text
    }
    if (child.children) {
      return extractTextFromLexical(child)
    }
    return ''
  }).join('\n')
}

interface PublishToPostizInput {
  postId: string
  channels: string[]
}

interface PublishToPostizOutput {
  success: boolean
  destination?: string
  error?: string
}

export const publishToPostizTask: TaskConfig<{ input: PublishToPostizInput, output: PublishToPostizOutput }> = {
  slug: 'publishToPostiz',
  handler: async ({ req, input }) => {
    const { payload } = req
    const { postId, channels } = input

    try {
      // 1. Fetch the full Post data
      const post = await payload.findByID({
        collection: 'posts',
        id: postId,
        depth: 2, 
      })

      const plainTextCaption = post.caption && typeof post.caption === 'object' && 'root' in post.caption
        ? extractTextFromLexical(post.caption.root)
        : 'Check out this property!'

      // 1b. Get Tenant API Key
      let tenantApiKey: string | undefined = undefined
      if (post.tenant && typeof post.tenant === 'object') {
        const tenant = post.tenant as any
        tenantApiKey = tenant.integrations?.postizApiKey
      }

      console.log(`[PublishTask] Publishing for Tenant: ${(post.tenant as any)?.name || 'Unknown'} (Key: ${tenantApiKey ? 'Present' : 'Global Fallback'})`)

      // 2. Resolve the Branded Media URL
      let mediaUrl = ''
      if (typeof post.assets?.brandedMedia === 'object' && post.assets.brandedMedia?.url) {
        mediaUrl = post.assets.brandedMedia.url
        // If local, pre-pend server URL
        if (!mediaUrl.startsWith('http')) {
          mediaUrl = `${process.env.PUBLIC_URL || 'http://localhost:3000'}${mediaUrl}`
        }
      }

      // 3. Separate Channels
      const manualChannels = channels.filter((c: string) => c === 'whatsapp_status' || c === 'tiktok_personal')
      const automatedChannelKeys = channels.filter((c: string) => c !== 'whatsapp_status' && c !== 'tiktok_personal')
      
      let postizSuccess = false
      let manualSuccess = false

      // 4. Handle Automated Channels (Postiz)
      if (automatedChannelKeys.length > 0) {
        try {
          // Fetch available integrations from Postiz to find IDs (Using Tenant Key)
          const integrations = await postiz.getIntegrations(tenantApiKey)
          
          // Map internal keys (e.g. 'facebook') to Postiz Integration IDs
          // We assume the Postiz 'identifier' matches our keys, or we do a best-guess match
          const targetIntegrationIds = integrations
            .filter(integration => {
               // Simple match: does the integration provider (e.g. 'facebook') match our request?
               // You might need more robust mapping logic here in production.
               return automatedChannelKeys.includes(integration.identifier)
            })
            .map(i => i.id)

          if (targetIntegrationIds.length > 0) {
            await postiz.createPost({
              content: plainTextCaption,
              mediaUrls: mediaUrl ? [mediaUrl] : [],
              integrationIds: targetIntegrationIds,
              scheduledAt: post.scheduledAt || undefined
            }, tenantApiKey) // Pass Tenant Key
            postizSuccess = true
          } else {
             console.warn('⚠️ No matching Postiz integrations found for:', automatedChannelKeys)
          }

        } catch (err: any) {
          console.error('❌ Postiz API Failed:', err.message)
          // We don't throw yet, we want to try manual notification too
        }
      } else {
        postizSuccess = true // No automated channels requested, so "success" 
      }

      // 5. Handle Manual Channels (Notification)
      if (manualChannels.length > 0) {
        await payload.jobs.queue({
          task: 'notifyMobileApp',
          input: {
            postId: post.id,
            title: post.title,
            channels: manualChannels
          }
        })
        manualSuccess = true
      } else {
        manualSuccess = true
      }

      // 6. Update Status based on outcomes
      let finalStatus = 'failed'
      const nextScheduledDate = new Date(post.scheduledAt || new Date())
      let shouldRecur = false

      if (postizSuccess && manualSuccess) {
        // Success path
        if (post.recurrenceInterval && post.recurrenceInterval !== 'none') {
           shouldRecur = true
           // Calculate next date
           const intervalMap: Record<string, number> = {
             'daily': 1,
             'weekly': 7,
             'monthly': 30 // Approximate, or use a date library for precision
           }
           const daysToAdd = intervalMap[post.recurrenceInterval] || 0
           nextScheduledDate.setDate(nextScheduledDate.getDate() + daysToAdd)
           
           // If the calculated date is in the past (e.g. system was down), keep adding until it's future
           while (nextScheduledDate < new Date()) {
             nextScheduledDate.setDate(nextScheduledDate.getDate() + daysToAdd)
           }

           finalStatus = 'queued' // Put back in queue for the Cron to pick up next time
        } else {
           finalStatus = manualChannels.length > 0 ? 'queued' : 'published'
        }
      } else if (postizSuccess && !manualSuccess) {
        finalStatus = 'queued' // Partial success, retry manual?
      }

      // Prepare update data
      const updateData: any = {
        distributionStatus: finalStatus,
      }

      // Handle History Logging & Recurrence Update
      if (postizSuccess) {
        const newLog = {
          timestamp: new Date().toISOString(),
          status: 'success',
          destination: 'Postiz' + (manualSuccess ? ' + Mobile' : '')
        }
        
        // We need to append to existing logs. 
        // Note: In a Task, 'post' is the state BEFORE this run.
        const currentLogs = post.distributionLogs || []
        updateData.distributionLogs = [newLog, ...currentLogs] // Newest first

        if (shouldRecur) {
          console.log(`[Recurrence] Post ${postId} set to recur on ${nextScheduledDate.toISOString()}`)
          updateData.scheduledAt = nextScheduledDate.toISOString()
        }
      }

      await payload.update({
        collection: 'posts',
        id: postId,
        data: updateData,
      })

      return {
        output: {
          success: postizSuccess && manualSuccess,
          destination: 'Postiz + Mobile App',
        },
      }

    } catch (error: any) {
      console.error('Publish Task Logic Error:', error)
      
      await payload.update({
        collection: 'posts',
        id: postId,
        data: {
          distributionStatus: 'failed',
        },
      })

      return {
        output: {
          success: false,
          error: error.message,
        },
      }
    }
  },
}
