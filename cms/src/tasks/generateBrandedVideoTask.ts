import { TaskConfig } from 'payload'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import os from 'os'
import satori from 'satori'
import sharp from 'sharp'
import React from 'react'
import { GlassIntro, LowerThird, OutroCard, WatermarkTemplate } from '../creative-engine/templates/video/VideoAssets'

// Load Font Helper
const fontPath = path.resolve(process.cwd(), 'public/fonts/Roboto-Bold.ttf')
const fontData = fs.readFileSync(fontPath)

async function generateAsset(Component: any, props: any, outputPath: string) {
  const svg = await satori(React.createElement(Component, props), {
    width: 1080,
    height: 1920,
    fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
  })
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
  fs.writeFileSync(outputPath, buffer)
}

interface GenerateBrandedVideoInput {
  postId: string
  mediaId: string
  tenantId: string
  data: any
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
    const { postId, mediaId, tenantId, data } = input
    const tmpDir = path.join(os.tmpdir(), `video-${Date.now()}`)
    fs.mkdirSync(tmpDir, { recursive: true })

    try {
      // 1. Fetch Assets
      const safeMediaId = typeof mediaId === 'object' && mediaId !== null ? (mediaId as any).id : mediaId
      const media = await payload.findByID({ collection: 'media', id: safeMediaId })
      
      const safeTenantId = typeof tenantId === 'object' && tenantId !== null ? (tenantId as any).id : tenantId
      const tenant = await payload.findByID({ collection: 'tenants', id: safeTenantId })
      
      // 1b. Credit Check
      const currentCredits = tenant.billing?.credits ?? 0
      if (currentCredits <= 0) {
          throw new Error(`Tenant ${tenant.name} has no remaining video credits.`)
      }

      // 1c. Resolve Video Path (S3 / Local Hybrid)
      let rawVideoPath = ''
      if (media.url && (media.url.startsWith('http') || media.url.startsWith('//'))) {
          // It's in S3/MinIO, we must download it to process with FFmpeg locally
          const downloadPath = path.join(tmpDir, 'raw_input.mp4')
          const downloadUrl = media.url.startsWith('//') ? `http:${media.url}` : media.url
          
          console.log(`[VideoTask] Downloading remote media for processing: ${downloadUrl}`)
          const response = await fetch(downloadUrl)
          if (!response.ok) throw new Error(`Failed to download raw video from S3: ${response.statusText}`)
          
          const buffer = Buffer.from(await response.arrayBuffer())
          fs.writeFileSync(downloadPath, buffer)
          rawVideoPath = downloadPath
      } else {
          // Fallback to local disk (legacy)
          rawVideoPath = path.resolve(process.cwd(), 'media', media.filename as string)
      }

      const outputPath = path.join(tmpDir, 'output.mp4')
      
      // 2. Map Data to Template Fields
      let introTitle = 'NEW POST'
      let introSub = 'Check this out'
      let lowerMain = 'SMM HUB'
      let lowerSub = 'Click for details'
      
      const brandingColor = tenant.branding?.primaryColor || '#fbbf24'
      const agencyName = tenant.name || 'SMM HUB'

      if (data.template === 'real-estate-listing') {
        introTitle = 'JUST LISTED'
        introSub = data.location || 'Prime Location'
        lowerMain = data.price || 'Contact for Price'
        lowerSub = data.features || 'View Details'
      } else if (data.template === 'sports-fixture') {
        introTitle = 'MATCH DAY'
        introSub = data.league || 'Upcoming Fixture'
        lowerMain = `${data.homeTeam} vs ${data.awayTeam}`
        lowerSub = data.matchTime || 'Coming Soon'
      }

      // 3. Generate Overlays
      await generateAsset(WatermarkTemplate, { text: agencyName }, path.join(tmpDir, 'watermark.png'))
      await generateAsset(GlassIntro, { title: introTitle, subtitle: introSub, color: brandingColor }, path.join(tmpDir, 'intro.png'))
      await generateAsset(LowerThird, { mainText: lowerMain, subText: lowerSub, color: brandingColor }, path.join(tmpDir, 'lower.png'))
      await generateAsset(OutroCard, { ctaText: 'CONTACT US', contactInfo: agencyName, color: brandingColor }, path.join(tmpDir, 'outro.png'))

      // 4. FFmpeg Processing (Overlay Mode)
      // Using fixed 10s duration for MVP stability, can be dynamic later
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(rawVideoPath).inputOptions(['-t 10']) 
          .input(path.join(tmpDir, 'intro.png')).inputOptions(['-loop 1', '-t 10'])
          .input(path.join(tmpDir, 'lower.png')).inputOptions(['-loop 1', '-t 10'])
          .input(path.join(tmpDir, 'watermark.png')).inputOptions(['-loop 1', '-t 10'])
          .input(path.join(tmpDir, 'outro.png')).inputOptions(['-loop 1', '-t 10'])

          .complexFilter([
              // Scale to Vertical 1080x1920
              '[0:v]scale=1080:1920,setsar=1[base]',

              // Intro (0-3s)
              '[base][1:v]overlay=0:0:enable=\'between(t,0,3)\'[v1]',
              // Lower Third (3-8s)
              '[v1][2:v]overlay=0:0:enable=\'between(t,3,8)\'[v2]',
              // Watermark (0-8s)
              '[v2][3:v]overlay=0:0:enable=\'between(t,0,8)\'[v3]',
              // Outro (8-10s)
              '[v3][4:v]overlay=0:0:enable=\'between(t,8,10)\'[v]'
          ])
          .outputOptions([
            '-map [v]', 
            '-pix_fmt yuv420p',
            '-c:v libx264',
            '-preset ultrafast'
          ])
          .save(outputPath)
          .on('end', resolve)
          .on('error', reject)
      })

      const finalVideoBuffer = fs.readFileSync(outputPath)

      // 5. Save to Media
      const generatedMedia = await payload.create({
        collection: 'media',
        data: {
          alt: `Branded Video: ${introTitle}`,
          tenant: Number(tenantId),
        },
        file: {
          data: finalVideoBuffer,
          name: `branded_video_${media.filename}.mp4`,
          mimetype: 'video/mp4',
          size: finalVideoBuffer.length,
        },
      })

      // 6. Update Post & Deduct Credit
      await payload.update({
        collection: 'posts',
        id: postId,
        data: {
          assets: {
            brandedMedia: generatedMedia.id,
          },
        },
      })

      await payload.update({
        collection: 'tenants',
        id: safeTenantId,
        data: {
          billing: {
            ...tenant.billing,
            credits: currentCredits - 1,
          }
        }
      })

      console.log(`[VideoTask] Success. 1 credit deducted from ${tenant.name}. Remaining: ${currentCredits - 1}`)

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
