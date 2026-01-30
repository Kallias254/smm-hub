'use client'

import React, { useState } from 'react'
import { Box, Button, Group, Paper, Stack, Text, SegmentedControl, Center, rem } from '@mantine/core'
import { Icon360, IconPhoto, IconMaximize } from '@tabler/icons-react'

export const MediaHero = ({ mediaUrl, tourUrl, title }: { mediaUrl: string; tourUrl?: string; title: string }) => {
  const [view, setView] = useState<'360' | 'image'>('360')
  const active360Url = tourUrl || mediaUrl

  return (
    <Box h={{ base: 350, sm: 450, md: 650 }} bg="gray.1" pos="relative">
      <Box h="100%" w="100%" pos="relative" bg="dark.9" style={{ overflow: 'hidden' }}>
        {view === '360' ? (
          <Box h="100%" w="100%" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${active360Url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
             <Stack align="center" gap={{ base: 'sm', md: 'md' }} px="xl" style={{ width: '100%', maxWidth: 600 }}>
                <Icon360 size="clamp(48px, 10vw, 80px)" color="white" style={{ opacity: 0.9 }} stroke={1.2} />
                <Box ta="center">
                    <Text c="white" fw={900} size="clamp(1.5rem, 5vw, 2.5rem)" style={{ letterSpacing: 2, lineHeight: 1.1, textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        VIRTUAL TOUR READY
                    </Text>
                    <Text c="white" size="sm" fw={500} mt={8} opacity={0.8} visibleFrom="xs">
                        Experience every detail in immersive 360°
                    </Text>
                </Box>
                <Button variant="white" color="dark" radius="xl" size="md" px="xl" mt="md" shadow="xl">
                    Enter 360° Experience
                </Button>
             </Stack>
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
                size="sm"
                color="white"
                bg="rgba(0,0,0,0.4)"
                style={{ 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: rem(4)
                }}
                data={[
                    { 
                        label: (
                            <Center style={{ gap: 8 }}>
                                <Icon360 size={16} />
                                <Text span fw={700} size="xs">360° VIEW</Text>
                            </Center>
                        ), 
                        value: '360' 
                    },
                    { 
                        label: (
                            <Center style={{ gap: 8 }}>
                                <IconPhoto size={16} />
                                <Text span fw={700} size="xs">PHOTOS</Text>
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
                >
                    All Photos
                </Button>
            </Box>
        )}
      </Box>
    </Box>
  )
}
