import { TaskConfig } from 'payload'
import { generateBrandedImage } from '../creative-engine/generator'
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
      // 1. Fetch Media and Tenant branding
      const media = await payload.findByID({
        collection: 'media',
        id: mediaId,
      })

      const tenant = await payload.findByID({
        collection: 'tenants',
        id: tenantId,
      })

      // 2. Prepare generation data
      const imagePath = path.resolve(process.cwd(), 'media', media.filename as string)
      const imageBuffer = fs.readFileSync(imagePath)
      const mimeType = media.mimeType || 'image/png'
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`

      let logoUrl = ''
      if (tenant.branding?.logo) {
        const logoId = typeof tenant.branding.logo === 'object' ? tenant.branding.logo.id : tenant.branding.logo
        const logoMedia = await payload.findByID({
          collection: 'media',
          id: logoId
        })
        const logoPath = path.resolve(process.cwd(), 'media', logoMedia.filename as string)
        const logoBuffer = fs.readFileSync(logoPath)
        logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }

      // 3. Generate the image
      const brandedBuffer = await generateBrandedImage({
        imageUrl: base64Image,
        agencyLogo: logoUrl || undefined,
        primaryColor: tenant.branding?.primaryColor || undefined,
        data: data, // Pass the block data (contains price, title, teams, etc.)
      })

      // 4. Save the generated image as a NEW Media record
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

      // 5. Update the original Post with the new branded media
      await payload.update({
        collection: 'posts',
        id: postId,
        data: {
          assets: {
            brandedMedia: generatedMedia.id,
          },
        },
      })

      return {
        output: {
          success: true,
          generatedMediaId: generatedMedia.id,
        },
      }
    } catch (error: any) {
      console.error('Branding Task Failed:', error)
      return {
        output: {
          success: false,
          error: error.message,
        },
      }
    }
  },
}