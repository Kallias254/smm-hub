import React from 'react'

export const RealEstateTemplate01 = ({
  imageUrl,
  price,
  title,
  agencyLogo,
  primaryColor = '#D4AF37', // Gold
}: {
  imageUrl: string
  price: string
  title: string
  agencyLogo?: string
  primaryColor?: string
}) => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#1a1a1a', // Fallback color
        fontFamily: 'Inter',
        position: 'relative',
      }}
    >
      {/* Background Image - explicit img tag for Satori stability */}
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

      {/* Overlay for glassmorphism effect at bottom */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          borderTop: `4px solid ${primaryColor}`,
          padding: '20px 40px',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {title}
          </span>
          <span style={{ fontSize: '48px', fontWeight: 'black', color: primaryColor }}>
            {price}
          </span>
        </div>

        {agencyLogo && (
          <img
            src={agencyLogo}
            style={{
              height: '80px',
              width: 'auto',
              objectFit: 'contain',
            }}
            alt="Agency Logo"
          />
        )}
      </div>

      {/* "Verified" Badge */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '40px',
          right: '40px',
          background: primaryColor,
          color: 'black',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '24px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        }}
      >
        VERIFIED LISTING
      </div>
    </div>
  )
}
