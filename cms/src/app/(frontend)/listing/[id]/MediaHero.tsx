'use client'

import React, { useState } from 'react'
import { Box, Button, Group, Paper, Stack, Text, SegmentedControl, Center, rem, Loader } from '@mantine/core'
import { Icon360, IconPhoto, IconMaximize, IconInfoCircle } from '@tabler/icons-react'
import { Pannellum } from 'pannellum-react'

export const MediaHero = ({ mediaUrl, tourUrl, title }: { mediaUrl: string; tourUrl?: string; title: string }) => {
  const [view, setView] = useState<'360' | 'image'>('360')
  const [loading, setLoading] = useState(true)
  const active360Url = tourUrl || 'https://pannellum.org/images/alma.jpg' // High-quality fallback sample

  return (
    <Box h={{ base: 400, sm: 500, md: 700 }} bg="black" pos="relative" style={{ overflow: 'hidden' }}>
      <Box h="100%" w="100%" pos="relative" bg="dark.9">
        {view === '360' ? (
          <Box h="100%" w="100%" pos="relative">
            {loading && (
              <Center pos="absolute" inset={0} style={{ zIndex: 5, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <Stack align="center" gap="sm">
                  <Loader color="blue" size="xl" type="dots" />
                  <Text c="white" fw={700} size="sm" tt="uppercase" lts={1}>Loading 360° Environment...</Text>
                </Stack>
              </Center>
            )}
            
            <Pannellum
                width="100%"
                height="100%"
                image={active360Url}
                pitch={10}
                yaw={180}
                hfov={110}
                autoLoad
                autoRotate={-2} // Slow subtle rotation
                autoRotateInactivityDelay={3000} // Resume rotation after 3s of no movement
                onLoad={() => setLoading(false)}
                showZoomCtrl={false}
                showFullscreenCtrl={false}
                mouseZoom={false}
            >
               <Pannellum.Hotspot
                  type="info"
                  pitch={11}
                  yaw={-167}
                  text="Main Living Area"
                />
            </Pannellum>

            {/* Instruction Overlay (Fades out) */}
            {!loading && (
              <Group 
                pos="absolute" 
                top={20} 
                left={20} 
                style={{ zIndex: 5, pointerEvents: 'none' }}
                gap="xs"
              >
                 <IconInfoCircle size={16} color="white" style={{ opacity: 0.6 }} />
                 <Text c="white" size="xs" fw={700} style={{ opacity: 0.6 }}>DRAG TO EXPLORE</Text>
              </Group>
            )}
          </Box>
        ) : (
          <img 
              src={mediaUrl} 
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Floating Controls */}
        <Box 
            pos="absolute" 
            bottom={{ base: 20, md: 30 }} 
            left="50%" 
            style={{ 
                transform: 'translateX(-50%)', 
                zIndex: 10,
            }}
        >
            <SegmentedControl
                value={view}
                onChange={(val: any) => setView(val)}
                radius="xl"
                size="md"
                color="blue"
                bg="rgba(0,0,0,0.6)"
                style={{ 
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: rem(4),
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                data={[
                    { 
                        label: (
                            <Center style={{ gap: 8 }}>
                                <Icon360 size={20} />
                                <Text span fw={800} size="sm">360° TOUR</Text>
                            </Center>
                        ), 
                        value: '360' 
                    },
                    { 
                        label: (
                            <Center style={{ gap: 8 }}>
                                <IconPhoto size={20} />
                                <Text span fw={800} size="sm">GALLERY</Text>
                            </Center>
                        ), 
                        value: 'image' 
                    },
                ]}
            />
        </Box>

        {view === 'image' && (
            <Box pos="absolute" bottom={20} right={{ base: 10, md: 30 }} visibleFrom="sm">
                <Button 
                    leftSection={<IconMaximize size={16} />} 
                    variant="white" 
                    color="dark" 
                    radius="md" 
                    size="sm"
                    fw={800}
                >
                    View All Photos
                </Button>
            </Box>
        )}
      </Box>
    </Box>
  )
}
