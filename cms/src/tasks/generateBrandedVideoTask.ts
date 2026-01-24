import { TaskConfig } from 'payload'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { generateBrandedImage } from '../creative-engine/generator'
import os from 'os'

interface GenerateBrandedVideoInput {
  postId: string
  mediaId: string
  price: string
  title: string
  tenantId: string
}

interface GenerateBrandedVideoOutput {
  success: boolean
  generatedMediaId?: number
  error?: string
}

export const generateBrandedVideoTask: TaskConfig<{ input: GenerateBrandedVideoInput, output: GenerateBrandedVideoOutput }> = {
  slug: 'generateBrandedVideo',
  handler: async ({ req, input }) => {
    const { payload } = req
    const { postId, mediaId, price, title, tenantId } = input
    const tmpDir = path.join(os.tmpdir(), `video-${Date.now()}`)
    fs.mkdirSync(tmpDir, { recursive: true })

    try {
      // 1. Fetch Assets
      const media = await payload.findByID({ collection: 'media', id: mediaId })
      const tenant = await payload.findByID({ collection: 'tenants', id: tenantId })
      
      const rawVideoPath = path.resolve(process.cwd(), 'media', media.filename as string)
      const introCardPath = path.join(tmpDir, 'intro.png')
      const outroCardPath = path.join(tmpDir, 'outro.png')
      const outputPath = path.join(tmpDir, 'output.mp4')

      // 2. Generate Intro/Outro PNGs via Satori
      // Using a slightly different title for intro/outro
      const introBuffer = await generateBrandedImage({
        imageUrl: '', // Blank or logo background
        price: 'JUST LISTED',
        title: title,
        primaryColor: tenant.branding?.primaryColor || undefined,
      })
      fs.writeFileSync(introCardPath, introBuffer)

      const outroBuffer = await generateBrandedImage({
        imageUrl: '', 
        price: 'CALL NOW',
        title: 'Contact Agency',
        primaryColor: tenant.branding?.primaryColor || undefined,
      })
      fs.writeFileSync(outroCardPath, outroBuffer)

      // 3. FFmpeg Processing: Intro (2s) + Main (10s) + Outro (2s)
      // This is a simplified version. A real one would involve concatenation and scaling.
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(introCardPath).loop(2)
          .input(rawVideoPath)
          .input(outroCardPath).loop(2)
          .on('error', reject)
          .on('end', resolve)
          .mergeToFile(outputPath, tmpDir)
      })

      const finalVideoBuffer = fs.readFileSync(outputPath)

      // 4. Save to Media
      const generatedMedia = await payload.create({
        collection: 'media',
        data: {
          alt: `Branded Video: ${title}`,
          tenant: Number(tenantId),
        },
        file: {
          data: finalVideoBuffer,
          name: `branded_video_${media.filename}.mp4`,
          mimetype: 'video/mp4',
          size: finalVideoBuffer.length,
        },
      })

      // 5. Update Post
      await payload.update({
        collection: 'posts',
        id: postId,
        data: {
          assets: {
            brandedMedia: generatedMedia.id,
          },
        },
      })

      return { output: { success: true, generatedMediaId: generatedMedia.id } }
    } catch (error: any) {
      console.error('Video Branding Failed:', error)
      return { output: { success: false, error: error.message } }
    } finally {
      // Clean up tmp
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  },
}
