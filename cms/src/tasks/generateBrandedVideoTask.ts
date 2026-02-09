import { TaskConfig } from 'payload'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'

// Utility to get dynamic imports without polluting the top-level scope
const getDeps = async () => {
  const [{ default: ffmpeg }, { default: satori }, { default: sharp }, React] = await Promise.all([
    import('fluent-ffmpeg'),
    import('satori'),
    import('sharp'),
    import('react'),
  ])
  return { ffmpeg, satori, sharp, React: React.default || React }
}

const getTemplates = async () => {
  return await import('../creative-engine/templates/video/VideoAssets')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let fontDataCache: Buffer | null = null
function getFontData() {
  if (fontDataCache) return fontDataCache
  const fontPath = path.resolve(__dirname, '../../public/fonts/Roboto-Bold.ttf')
  fontDataCache = fs.readFileSync(fontPath)
  return fontDataCache
}

async function generateAsset(Component: any, props: any, outputPath: string, deps: any) {
  const { satori, sharp, React } = deps
  const fontData = getFontData()
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

    // Check for Temporal delegation first (Fast Path, no heavy deps loaded)
    if (process.env.TEMPORAL_ENABLED === 'true') {
        try {
            const { getTemporalClient } = await import('../temporal/client')
            const temporal = await getTemporalClient()
            
            const safeMediaId = typeof mediaId === 'object' && mediaId !== null ? (mediaId as any).id : mediaId
            const safeTenantId = typeof tenantId === 'object' && tenantId !== null ? (tenantId as any).id : tenantId

            await temporal.workflow.start('BrandingWorkflow', {
                taskQueue: 'branding-queue',
                workflowId: `video-branding-${postId}-${Date.now()}`,
                args: [{
                    postId: String(postId),
                    mediaId: String(safeMediaId),
                    tenantId: String(safeTenantId),
                    data,
                    isVideo: true
                }]
            })
            return { output: { success: true } }
        } catch (e) {
            console.error('[VideoTask] Failed to delegate to Temporal:', e)
            // Fallback to local processing if Temporal fails? 
            // Better to fail fast or continue. Let's continue for now.
        }
    }

    // Heavy Path: Only load deps if we are actually processing here
    const deps = await getDeps()
    const { GlassIntro, LowerThird, OutroCard, WatermarkTemplate } = await getTemplates()
    
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
          const downloadPath = path.join(tmpDir, 'raw_input.mp4')
          const downloadUrl = media.url.startsWith('//') ? `http:${media.url}` : media.url
          
          console.log(`[VideoTask] Downloading remote media for processing: ${downloadUrl}`)
          const response = await fetch(downloadUrl)
          if (!response.ok) throw new Error(`Failed to download raw video from S3: ${response.statusText}`)
          
          const buffer = Buffer.from(await response.arrayBuffer())
          fs.writeFileSync(downloadPath, buffer)
          rawVideoPath = downloadPath
      } else {
          rawVideoPath = path.resolve(process.cwd(), 'media', media.filename as string)
      }

      const outputPath = path.join(tmpDir, 'output.mp4')
      
      const brandingColor = tenant.branding?.primaryColor || '#fbbf24'
      const agencyName = tenant.name || 'SMM HUB'

      let introTitle = 'NEW POST'
      let introSub = 'Check this out'
      let lowerMain = 'SMM HUB'
      let lowerSub = 'Click for details'

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
      await generateAsset(WatermarkTemplate, { text: agencyName }, path.join(tmpDir, 'watermark.png'), deps)
      await generateAsset(GlassIntro, { title: introTitle, subtitle: introSub, color: brandingColor }, path.join(tmpDir, 'intro.png'), deps)
      await generateAsset(LowerThird, { mainText: lowerMain, subText: lowerSub, color: brandingColor }, path.join(tmpDir, 'lower.png'), deps)
      await generateAsset(OutroCard, { ctaText: 'CONTACT US', contactInfo: agencyName, color: brandingColor }, path.join(tmpDir, 'outro.png'), deps)

      // 4. FFmpeg Processing
      const { ffmpeg } = deps
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(rawVideoPath).inputOptions(['-t 10']) 
          .input(path.join(tmpDir, 'intro.png')).inputOptions(['-loop 1', '-t 10'])
          .input(path.join(tmpDir, 'lower.png')).inputOptions(['-loop 1', '-t 10'])
          .input(path.join(tmpDir, 'watermark.png')).inputOptions(['-loop 1', '-t 10'])
          .input(path.join(tmpDir, 'outro.png')).inputOptions(['-loop 1', '-t 10'])
          .complexFilter([
              '[0:v]scale=1080:1920,setsar=1[base]',
              '[base][1:v]overlay=0:0:enable=\'between(t,0,3)\'[v1]',
              '[v1][2:v]overlay=0:0:enable=\'between(t,3,8)\'[v2]',
              '[v2][3:v]overlay=0:0:enable=\'between(t,0,8)\'[v3]',
              '[v3][4:v]overlay=0:0:enable=\'between(t,8,10)\'[v]'
          ])
          .outputOptions(['-map [v]', '-pix_fmt yuv420p', '-c:v libx264', '-preset ultrafast'])
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

      // 6. Update Post & Credits
      await payload.update({
        collection: 'posts',
        id: postId,
        data: { assets: { brandedMedia: generatedMedia.id } },
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

      return { output: { success: true, generatedMediaId: generatedMedia.id } }
    } catch (error: any) {
      console.error('Video Branding Failed:', error)
      return { output: { success: false, error: error.message } }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  },
}

