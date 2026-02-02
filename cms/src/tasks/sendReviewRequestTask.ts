import { TaskConfig } from 'payload'

interface SendReviewRequestInput {
  clientName: string
  clientPhone: string
  tenantId: string | number
}

export const sendReviewRequestTask: TaskConfig<{ input: SendReviewRequestInput, output: { success: boolean } }> = {
  slug: 'sendReviewRequest',
  handler: async ({ req, input }) => {
    const { payload } = req
    const { clientName, clientPhone, tenantId } = input

    try {
      // 1. Fetch Tenant to get subdomain/slug
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: tenantId,
      })

      const tenantSlug = tenant.slug || 'agency'
      // Note: In production, use the real domain. For dev, localhost.
      const reviewUrl = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/review/${tenantSlug}`

      const message = `Hi ${clientName}, congrats on your new home! 🏠 We'd love to hear about your experience with ${tenant.name}. Could you give us a quick rating here? ${reviewUrl}`

      console.log(`[SMS Automation] Sending to ${clientPhone}: "${message}"`)

      // TODO: Integrate with real SMS provider (Twilio/Africa's Talking)
      // await smsService.send(clientPhone, message)

      return {
        output: { success: true },
      }
    } catch (error) {
      console.error('Failed to send review request:', error)
      return {
        output: { success: false },
      }
    }
  },
}
