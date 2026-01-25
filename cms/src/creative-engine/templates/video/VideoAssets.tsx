import React from 'react'

// A. Subtle Corner Watermark
export const WatermarkTemplate = ({ text }: { text: string }) => (
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
        {text}
      </span>
    </div>
  </div>
)

// B. Glassmorphism Intro Card
export const GlassIntro = ({ title, subtitle, color }: { title: string; subtitle: string; color?: string }) => (
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
      <h1 style={{ fontSize: '80px', color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}>
        {title}
      </h1>
      <div style={{ height: '2px', width: '100px', background: color || '#fbbf24', margin: '20px 0' }} />
      <h2 style={{ fontSize: '40px', color: color || '#fbbf24', margin: 0, textTransform: 'uppercase', textAlign: 'center' }}>
        {subtitle}
      </h2>
    </div>
  </div>
)

// C. TV-Style Lower Third (Property/Details)
export const LowerThird = ({ mainText, subText, color }: { mainText: string; subText: string; color?: string }) => (
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
        borderLeft: `10px solid ${color || '#fbbf24'}`,
        borderRadius: '0 10px 10px 0',
        width: '70%',
      }}
    >
      <span style={{ fontSize: '60px', color: 'white', fontWeight: 'bold' }}>{mainText}</span>
      <span style={{ fontSize: '30px', color: '#d1d5db' }}>{subText}</span>
    </div>
  </div>
)

// D. Outro Card
export const OutroCard = ({ ctaText, contactInfo, color }: { ctaText: string; contactInfo: string; color?: string }) => (
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
        background: color || '#fbbf24',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '40px',
      }}
    >
       <span style={{ fontSize: '60px', color: '#000' }}>📞</span>
    </div>
    <h1 style={{ fontSize: '60px', color: 'white', margin: 0 }}>{ctaText}</h1>
    <h2 style={{ fontSize: '40px', color: '#9ca3af', marginTop: '20px' }}>{contactInfo}</h2>
  </div>
)
