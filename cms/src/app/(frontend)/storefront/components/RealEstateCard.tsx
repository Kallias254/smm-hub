'use client'

import React from 'react'
import Link from 'next/link'
import { Card, Image, Text, Badge, Group, Button, ActionIcon, Stack, Box, ThemeIcon, Divider, Tooltip, rem, Paper } from '@mantine/core'
import { IconMapPin, IconBed, IconBath, IconMaximize, IconBrandWhatsapp, IconHome, IconRuler } from '@tabler/icons-react'

export const RealEstateCard = ({ post }: { post: any }) => {
  const data = post.content?.[0]?.data || {}
  const mediaUrl = post.assets?.brandedMedia?.url || post.assets?.rawMedia?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
  
  // Extract features
  const features = data.features || ''
  const bedMatch = features.match(/(\d+)\s*Bed/)
  const bathMatch = features.match(/(\d+)\s*Bath/)
  const areaMatch = features.match(/(\d+)\s*sqft/)
  const area = areaMatch ? areaMatch[1] : '--'
  const propertyType = data.propertyType || 'Apartment'

  return (
    <Card 
      shadow="sm" 
      radius="md" 
      padding="0" 
      h="100%"
      withBorder
      className="hover-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Card.Section pos="relative">
        <Box 
          component={Link}
          href={`/listing/${post.id}`}
          className="hover-zoom-container"
          style={{ 
            overflow: 'hidden', 
            borderTopLeftRadius: 'var(--mantine-radius-md)', 
            borderTopRightRadius: 'var(--mantine-radius-md)',
            display: 'block',
            cursor: 'pointer',
            height: 260,
          }}
        >
          <img
            src={mediaUrl}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        
        <Badge 
          variant="filled" 
          color="blue" 
          size="sm" 
          radius="sm"
          style={{ 
            position: 'absolute', 
            top: 12, 
            left: 12, 
            zIndex: 2,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 0.5
          }}
        >
          {data.propertyStatus || 'For Rent'}
        </Badge>
        
        <Text 
            fw={800} 
            size="xl" 
            c="white" 
            style={{ 
                position: 'absolute', 
                bottom: 12, 
                left: 12, 
                zIndex: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
        >
            {data.price || 'Price on Request'}
        </Text>
         <Box 
            style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)',
                pointerEvents: 'none'
            }} 
        />
      </Card.Section>

      <Stack gap="md" p="md" style={{ flexGrow: 1 }}>
        <Box>
            <Text fw={800} size="lg" lineClamp={1} title={post.title} mb={4}>
              {post.title}
            </Text>
          
          <Group gap={4} c="dimmed">
            <IconMapPin size={16} />
            <Text size="sm" lineClamp={1}>{data.location || 'Prime Location'}</Text>
          </Group>
        </Box>

        <Divider color="var(--mantine-color-default-border)" />

        <Group gap="md" justify="space-between">
            <Group gap="sm">
                <FeatureItem icon={IconBed} value={bedMatch?.[1] || '0'} />
                <FeatureItem icon={IconBath} value={bathMatch?.[1] || '0'} />
                <FeatureItem icon={IconRuler} value={area} />
            </Group>
            <Badge variant="light" color="blue" radius="sm" tt="uppercase" fw={700}>{propertyType}</Badge>
        </Group>

        <Box mt="auto">
            <Button 
                component="a"
                href={`https://wa.me/?text=Hi, I am interested in: ${encodeURIComponent(post.title)}`}
                target="_blank"
                leftSection={<IconBrandWhatsapp size={18} />}
                variant="filled" 
                color="blue" 
                fullWidth
                radius="md"
            >
                WhatsApp Agent
            </Button>
        </Box>
      </Stack>
    </Card>
  )
}



const FeatureItem = ({ icon: Icon, value }: any) => {

    return (

        <Group gap={6}>

            <Icon size={18} color="var(--mantine-color-blue-7)" stroke={1.5} />

            <Text size="sm" fw={800}>{value}</Text>

        </Group>

    )

}
