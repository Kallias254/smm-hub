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
        // CRITICAL: For internal Postiz container to reach MinIO container, 
        // we must use the Docker service name 'minio'
        if (mediaUrl.startsWith('/api/media')) {
           mediaUrl = `http://minio:9000/smm-hub-media${mediaUrl.replace('/api/media/file', '')}`
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
          const integrations = await postiz.getIntegrations(tenantApiKey)
          
          // Map internal keys to Postiz Integration IDs
          // SMM Hub Keys: ['facebook', 'instagram', 'linkedin', 'twitter']
          // Postiz Identifiers: usually 'facebook', 'instagram', etc.
          const targetIntegrationIds = integrations
            .filter(integration => {
               const provider = integration.identifier.toLowerCase()
               return automatedChannelKeys.some(k => k.toLowerCase() === provider)
            })
            .map(i => i.id)

          if (targetIntegrationIds.length > 0) {
            console.log(`[PublishTask] Sending to Postiz Integrations: ${targetIntegrationIds.join(', ')}`)
            await postiz.createPost({
              content: plainTextCaption,
              mediaUrls: mediaUrl ? [mediaUrl] : [],
              integrationIds: targetIntegrationIds,
              scheduledAt: post.scheduledAt || undefined
            }, tenantApiKey)
            postizSuccess = true
          } else {
             console.warn('⚠️ No matching Postiz integrations found. Did you link your socials in the Postiz dashboard?')
             postizSuccess = true // We mark success to avoid infinite loops, but log warning
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

      if (postizSuccess && manualSuccess) {
           finalStatus = manualChannels.length > 0 ? 'queued' : 'published'
      } else if (postizSuccess && !manualSuccess) {
        finalStatus = 'queued' // Partial success, retry manual?
      }

      // Prepare update data
      const updateData: any = {
        distributionStatus: finalStatus,
      }

      // Handle History Logging
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
