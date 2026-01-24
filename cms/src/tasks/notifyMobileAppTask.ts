import { TaskConfig } from 'payload'

interface NotifyMobileAppInput {
  postId: string
  channels: string[]
  title: string
}

interface NotifyMobileAppOutput {
  success: boolean
  message?: string
  error?: string
}

export const notifyMobileAppTask: TaskConfig<{ input: NotifyMobileAppInput, output: NotifyMobileAppOutput }> = {
  slug: 'notifyMobileApp',
  handler: async ({ req, input }) => {
    // const { payload } = req // Unused here for now, but available if needed
    const { postId, channels, title } = input

    try {
      // In a real implementation, this would use 'firebase-admin' to send an FCM message.
      // const messaging = getMessaging(app);
      // await messaging.send({ ... });

      console.log('📱 [MOCK] Sending Push Notification to Agent:')
      console.log(`   - Title: New Post Ready: ${title}`)
      console.log(`   - Post ID: ${postId}`)
      console.log(`   - Channels: ${channels.join(', ')}`)
      console.log(`   - Action: Open App to Publish`)

      // We might want to log this "notification sent" event in the Post history or Activity Log.
      // For now, we just assume success.

      return {
        output: {
          success: true,
          message: 'Notification dispatched (Mock)',
        },
      }
    } catch (error: any) {
      console.error('Mobile Notification Failed:', error)
      return {
        output: {
          success: false,
          error: error.message,
        },
      }
    }
  },
}