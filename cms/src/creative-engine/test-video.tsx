import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import satori from 'satori'
import sharp from 'sharp'
import React from 'react'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- 1. Premium Components for Satori ---

// A. Subtle Corner Watermark
const WatermarkTemplate = () => (
  <div
    style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      padding: '40px',
      backgroundColor: 'transparent',
    }}
  >
    <div
      style={{
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <span style={{ fontSize: '24px', color: 'white', fontWeight: 'bold', letterSpacing: '2px' }}>
        SMM HUB
      </span>
    </div>
  </div>
)

// B. Glassmorphism Intro Card
const GlassIntro = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark Overlay
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.1)', // Glass effect
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '60px 100px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      <h1 style={{ fontSize: '80px', color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '4px' }}>
        {title}
      </h1>
      <div style={{ height: '2px', width: '100px', background: '#fbbf24', margin: '20px 0' }} />
      <h2 style={{ fontSize: '40px', color: '#fbbf24', margin: 0, textTransform: 'uppercase' }}>
        {subtitle}
      </h2>
    </div>
  </div>
)

// C. TV-Style Lower Third (Property Details)
const LowerThird = ({ price, location }: { price: string; location: string }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      justifyContent: 'flex-end',
      paddingBottom: '100px', // Lift off bottom
      paddingLeft: '50px',
      backgroundColor: 'transparent',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
        padding: '20px 40px',
        borderLeft: '10px solid #fbbf24',
        borderRadius: '0 10px 10px 0',
        width: '70%',
      }}
    >
      <span style={{ fontSize: '60px', color: 'white', fontWeight: 'bold' }}>{price}</span>
      <span style={{ fontSize: '30px', color: '#d1d5db' }}>{location}</span>
    </div>
  </div>
)

// D. Outro Card
const OutroCard = () => (
  <div
    style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: '#111827',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }}
  >
    <div
      style={{
        width: '150px',
        height: '150px',
        borderRadius: '75px',
        background: '#fbbf24',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '40px',
      }}
    >
       <span style={{ fontSize: '60px', color: '#000' }}>📞</span>
    </div>
    <h1 style={{ fontSize: '60px', color: 'white', margin: 0 }}>BOOK A VIEWING</h1>
    <h2 style={{ fontSize: '40px', color: '#9ca3af', marginTop: '20px' }}>www.smmhub.com</h2>
  </div>
)


// --- 2. Main Script ---

async function runDemo() {
  console.log('🎬 Starting Premium Video Demo...')
  const outputDir = path.resolve(__dirname, '../../public')
  const fontsDir = path.resolve(__dirname, '../../public/fonts')
  
  // Ensure we have a font
  const fontPath = path.join(fontsDir, 'Roboto-Bold.ttf')
  if (!fs.existsSync(fontPath)) {
    console.error('❌ Font missing!')
    return
  }
  const fontData = fs.readFileSync(fontPath)

  try {
    // A. Generate Assets
    console.log('🎨 Generating Premium Assets...')
    const width = 1080
    const height = 1920 // Vertical 9:16 (Stories/Reels format)

    // 1. Watermark (Top Right)
    const watermarkSvg = await satori(<WatermarkTemplate />, {
      width, height, fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
    })
    fs.writeFileSync(path.join(outputDir, 'pro_watermark.png'), await sharp(Buffer.from(watermarkSvg)).png().toBuffer())

    // 2. Intro (Glass)
    const introSvg = await satori(<GlassIntro title="MODERN VILLA" subtitle="KAREN, NAIROBI" />, {
      width, height, fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
    })
    fs.writeFileSync(path.join(outputDir, 'pro_intro.png'), await sharp(Buffer.from(introSvg)).png().toBuffer())

    // 3. Lower Third
    const lowerThirdSvg = await satori(<LowerThird price="KES 85,000,000" location="5 Bed | 5 Bath | 0.5 Acre" />, {
      width, height, fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
    })
    fs.writeFileSync(path.join(outputDir, 'pro_lower.png'), await sharp(Buffer.from(lowerThirdSvg)).png().toBuffer())

    // 4. Outro
    const outroSvg = await satori(<OutroCard />, {
      width, height, fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
    })
    fs.writeFileSync(path.join(outputDir, 'pro_outro.png'), await sharp(Buffer.from(outroSvg)).png().toBuffer())


    // B. FFmpeg Processing
    console.log('🎞️ Stitching (Turbo Mode)...')

    const inputVideo = path.join(outputDir, 'sample_input.mp4') // We'll crop this to vertical
    const outputVideo = path.join(outputDir, 'pro_branded_video.mp4')
    
    // TIMELINE:
    // 0s - 3s: Intro Overlay
    // 3s - 8s: Lower Third Overlay
    // 0s - 10s: Watermark (Always on)
    // 8s - 10s: Outro Overlay (Fade over)

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputVideo).inputOptions(['-t 10']) // Base Video (10s)
        .input(path.join(outputDir, 'pro_intro.png')).inputOptions(['-loop 1', '-t 10'])
        .input(path.join(outputDir, 'pro_lower.png')).inputOptions(['-loop 1', '-t 10'])
        .input(path.join(outputDir, 'pro_watermark.png')).inputOptions(['-loop 1', '-t 10'])
        .input(path.join(outputDir, 'pro_outro.png')).inputOptions(['-loop 1', '-t 10'])

        .complexFilter([
            // 1. FORCE SCALE to 1080x1920 (Distort if needed, just to make it work)
            '[0:v]scale=1080:1920,setsar=1[base]',

            // 2. Overlay Intro (0-3s)
            '[base][1:v]overlay=0:0:enable=\'between(t,0,3)\'[v1]',

            // 3. Overlay Lower Third (3-8s)
            '[v1][2:v]overlay=0:0:enable=\'between(t,3,8)\'[v2]',

            // 4. Overlay Watermark (0-8s)
            '[v2][3:v]overlay=0:0:enable=\'between(t,0,8)\'[v3]',

            // 5. Overlay Outro (8-10s)
            '[v3][4:v]overlay=0:0:enable=\'between(t,8,10)\'[v]'
        ])
        .outputOptions([
          '-map [v]', 
          '-pix_fmt yuv420p',
          '-c:v libx264',
          '-preset ultrafast'
        ])
        .save(outputVideo)
        .on('end', () => {
          console.log('✅ PRO Video Generated!')
          console.log(`   Location: ${outputVideo}`)
          resolve(true)
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg Error:', err)
          reject(err)
        })
    })

  } catch (e) {
    console.error('❌ Script Failed:', e)
  }
}

runDemo()
