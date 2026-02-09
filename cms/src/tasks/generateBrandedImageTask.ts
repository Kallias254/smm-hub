import { TaskConfig } from 'payload'
import path from 'path'
import fs from 'fs'

interface GenerateBrandedImageInput {
  postId: string
  mediaId: string
  tenantId: string
  data: any // Dynamic block data
}

interface GenerateBrandedImageOutput {
  success: boolean
  generatedMediaId?: number
  error?: string
}

export const generateBrandedImageTask: TaskConfig<{ input: GenerateBrandedImageInput, output: GenerateBrandedImageOutput }> = {
  slug: 'generateBrandedImage',
  handler: async ({ req, input }) => {
    const { payload } = req
    const { postId, mediaId, tenantId, data } = input

    try {
      // --- TEMPORAL SWITCH ---
      if (process.env.TEMPORAL_ENABLED === 'true') {
        console.log('[Task] Delegating to Temporal Workflow...')
        const { getTemporalClient } = await import('../temporal/client')
        const client = await getTemporalClient()
        
        // Handle populated objects for Temporal input
        const safeMediaId = typeof mediaId === 'object' && mediaId !== null ? (mediaId as any).id : mediaId
        const safeTenantId = typeof tenantId === 'object' && tenantId !== null ? (tenantId as any).id : tenantId

        const handle = await client.workflow.start('BrandingWorkflow', {
          taskQueue: 'branding-queue',
          workflowId: `branding-${postId}-${Date.now()}`,
          args: [{
            postId: String(postId),
            mediaId: String(safeMediaId),
            tenantId: String(safeTenantId),
            data
          }]
        })

        console.log(`[Task] Temporal Workflow started: ${handle.workflowId}`)
        return { output: { success: true } }
      }
      // -----------------------

      // Heavy Path: Only load generator if we are actually processing here
      const { generateBrandedImage } = await import('../creative-engine/generator')

      // 1. Fetch Media and Tenant branding
      const safeMediaId = typeof mediaId === 'object' && mediaId !== null ? (mediaId as any).id : mediaId
      const safeTenantId = typeof tenantId === 'object' && tenantId !== null ? (tenantId as any).id : tenantId

      const media = await payload.findByID({ collection: 'media', id: safeMediaId })
      const tenant = await payload.findByID({ collection: 'tenants', id: safeTenantId })

      // 2. Prepare generation data
      const imagePath = path.resolve(process.cwd(), 'media', media.filename as string)
      const imageBuffer = fs.readFileSync(imagePath)
      const mimeType = media.mimeType || 'image/png'
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`

      let logoUrl = ''
      if (tenant.branding?.logo) {
        const logoId = typeof tenant.branding.logo === 'object' ? tenant.branding.logo.id : tenant.branding.logo
        const logoMedia = await payload.findByID({ collection: 'media', id: logoId })
        const logoPath = path.resolve(process.cwd(), 'media', logoMedia.filename as string)
        const logoBuffer = fs.readFileSync(logoPath)
        logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }

      // 3. Generate the image
      const brandedBuffer = await generateBrandedImage({
        imageUrl: base64Image,
        agencyLogo: logoUrl || undefined,
        primaryColor: tenant.branding?.primaryColor || undefined,
        data: data,
      })

      // 4. Save to Media
      const generatedMedia = await payload.create({
        collection: 'media',
        data: {
          alt: `Branded Image`,
          tenant: Number(tenantId),
        },
        file: {
          data: brandedBuffer,
          name: `branded_${media.filename}`,
          mimetype: 'image/png',
          size: brandedBuffer.length,
        },
      })

      // 5. Update Post
      await payload.update({
        collection: 'posts',
        id: postId,
        data: { assets: { brandedMedia: generatedMedia.id } },
      })

      return { output: { success: true, generatedMediaId: generatedMedia.id } }
    } catch (error: any) {
      console.error('Branding Task Failed:', error)
      return { output: { success: false, error: error.message } }
    }
  },
}