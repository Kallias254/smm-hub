import React from 'react'

export const RealEstateTemplate01 = ({
  imageUrl,
  price,
  location,
  features,
  agencyLogo,
  primaryColor = '#D4AF37', // Metallic Gold default
}: {
  imageUrl: string
  price: string
  location?: string
  features?: string
  agencyLogo?: string
  primaryColor?: string
}) => {
  // Ultra-Premium Design System
  const GOLD = primaryColor
  const DARK_OVERLAY = 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 40%)'
  const GLASS_BG = 'rgba(20, 20, 20, 0.75)' // Dark glass
  
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        fontFamily: 'Roboto', // We work with what we have
        position: 'relative',
      }}
    >
      {/* 1. Full Bleed Image */}
      <img
        src={imageUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* 2. Cinematic Gradient (Vignette) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      
      {/* 3. Bottom Gradient for Readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: DARK_OVERLAY,
        }}
      />

      {/* 4. The "Luxury Stamp" (Top Right) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '60px',
          right: '60px',
          border: `2px solid ${GOLD}`,
          padding: '12px 24px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          color: GOLD,
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '0.2em', // W I D E tracking = Luxury
          textTransform: 'uppercase',
        }}
      >
        Verified Collection
      </div>

      {/* 5. The Floating Info Card (Bottom Left) - Asymmetric */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          bottom: '80px',
          left: '60px',
          width: '85%', // Not full width
          padding: '0', // Container
        }}
      >
        {/* A. The "Eyebrow" (Location) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
           <div style={{ width: '40px', height: '2px', background: GOLD, marginRight: '16px' }} />
           <span style={{ 
             color: '#e5e5e5', 
             fontSize: '28px', 
             textTransform: 'uppercase', 
             letterSpacing: '0.15em' 
           }}>
             {location || 'Exclusive Listing'}
           </span>
        </div>

        {/* B. The Price (Hero) */}
        <h1
          style={{
            fontSize: '110px',
            color: 'white',
            margin: 0,
            lineHeight: 0.9,
            fontWeight: '900',
            letterSpacing: '-0.02em', // Tight tracking for impact
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {price}
        </h1>

        {/* C. Features Bar (Glass) */}
        <div
          style={{
            display: 'flex',
            marginTop: '32px',
            background: GLASS_BG,
            borderLeft: `6px solid ${GOLD}`,
            padding: '24px 32px',
            backdropFilter: 'blur(10px)', // Note: Satori support for backdrop-filter is limited, but fallback color handles it
            borderRadius: '0 12px 12px 0',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: 'white', fontSize: '32px', fontWeight: '500' }}>
            {features || 'Premium Amenities • Private Viewing'}
          </span>
          
          {agencyLogo && (
            <img 
              src={agencyLogo} 
              style={{ height: '60px', width: 'auto', marginLeft: '40px', filter: 'brightness(0) invert(1)' }} // Make logo white
            />
          )}
        </div>
      </div>
    </div>
  )
}
