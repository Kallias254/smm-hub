import React from 'react'

export const SportsTemplate01 = ({
  imageUrl,
  price, // We'll map this to "Odds" or "Time"
  title, // "Man Utd vs Arsenal"
  agencyLogo,
  primaryColor = '#00ff00',
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
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#000',
        fontFamily: 'Roboto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image - Skewed or Grayscale effect? Satori is limited, let's keep it simple but bold */}
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

      {/* Radical Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 50%)',
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '60px',
          zIndex: 10,
        }}
      >
        {/* The "Match" or Title - HUGE */}
        <div
          style={{
            display: 'flex',
            fontSize: '80px',
            lineHeight: '1',
            textTransform: 'uppercase',
            color: 'white',
            fontWeight: '900',
            marginBottom: '20px',
            textShadow: '4px 4px 0px black',
            flexDirection: 'column', // Stack if long
          }}
        >
          {title}
        </div>

        {/* The "Action" Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `6px solid ${primaryColor}`,
            paddingTop: '30px',
          }}
        >
          {/* Odds / Call to Action */}
          <div
            style={{
              display: 'flex',
              backgroundColor: primaryColor,
              padding: '10px 30px',
              transform: 'skew(-10deg)',
              color: 'black',
            }}
          >
            <span
              style={{
                fontSize: '40px',
                fontWeight: 'bold',
                transform: 'skew(10deg)', // Un-skew text
              }}
            >
              {price}
            </span>
          </div>

          {/* Logo */}
          {agencyLogo && (
            <img
              src={agencyLogo}
              style={{
                height: '100px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))',
              }}
              alt="Logo"
            />
          )}
        </div>
      </div>
      
      {/* Floating "LIVE" badge if needed, strictly cosmetic for template */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          background: 'red',
          color: 'white',
          padding: '5px 15px',
          fontSize: '24px',
          fontWeight: 'bold',
          borderRadius: '4px',
        }}
      >
        LIVE
      </div>
    </div>
  )
}
