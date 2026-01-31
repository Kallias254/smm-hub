'use client'

import React from 'react'
import Link from 'next/link'
import { Paper, Image, Text, Badge, Group, Button, Stack, Box, Divider, rem, Flex, Grid, ThemeIcon } from '@mantine/core'
import { IconMapPin, IconBed, IconBath, IconRuler, IconBrandWhatsapp, IconChevronRight } from '@tabler/icons-react'

export const RealEstateListRow = ({ post }: { post: any }) => {
  const data = post.content?.[0]?.data || {}
  const mediaUrl = post.assets?.brandedMedia?.url || post.assets?.rawMedia?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
  
  const features = data.features || ''
  const bedMatch = features.match(/(\d+)\s*Bed/)
  const bathMatch = features.match(/(\d+)\s*Bath/)
  const areaMatch = features.match(/(\d+)\s*sqft/)
  const area = areaMatch ? Math.round(parseInt(areaMatch[1]) / 10.764) : '--'
  const propertyType = data.propertyType || 'Apartment'

  return (
    <Box 
      py="md"
      className="hover-bg"
      style={{ 
        borderBottom: '1px solid var(--mantine-color-default-border)',
        transition: 'background-color 0.2s ease'
      }}
    >
      <Grid align="center" gutter="xl">
        {/* 1. Image (Fixed 16:9) */}
        <Grid.Col span={{ base: 12, sm: 3, md: 2.5 }}>
            <Box 
                component={Link} 
                href={`/listing/${post.id}`}
                style={{ 
                    display: 'block', 
                    aspectRatio: '16/9', 
                    borderRadius: 'var(--mantine-radius-md)', 
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <img src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={post.title} />
                <Badge 
                    pos="absolute" 
                    top={8} 
                    left={8} 
                    color="dark" 
                    variant="filled" 
                    size="xs"
                    radius="sm" 
                >
                    {propertyType}
                </Badge>
            </Box>
        </Grid.Col>

        {/* 2. Info (Title & Location) */}
        <Grid.Col span={{ base: 12, sm: 4, md: 4.5 }}>
            <Stack gap={6}>
                <Group gap="xs">
                    <Badge variant="dot" color={data.propertyStatus === 'For Rent' ? 'orange' : 'blue'} size="sm">
                        {data.propertyStatus}
                    </Badge>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Ref: {String(post.id).substring(0, 6)}</Text>
                </Group>
                <Text component={Link} href={`/listing/${post.id}`} fw={700} size="lg" truncate style={{ textDecoration: 'none', color: 'inherit' }}>
                    {post.title}
                </Text>
                <Group gap={4} c="dimmed">
                    <IconMapPin size={16} />
                    <Text size="sm">{data.location || 'Nairobi'}</Text>
                </Group>
            </Stack>
        </Grid.Col>

        {/* 3. Stats (Vertical Column) */}
        <Grid.Col span={{ base: 6, sm: 3, md: 2.5 }}>
            <Group gap="xl">
                <Stack gap={2} align="center">
                    <ThemeIcon variant="default" size="md" radius="md"><IconBed size={16} /></ThemeIcon>
                    <Text size="sm" fw={700}>{bedMatch?.[1] || '-'}</Text>
                </Stack>
                <Stack gap={2} align="center">
                    <ThemeIcon variant="default" size="md" radius="md"><IconBath size={16} /></ThemeIcon>
                    <Text size="sm" fw={700}>{bathMatch?.[1] || '-'}</Text>
                </Stack>
                <Stack gap={2} align="center">
                    <ThemeIcon variant="default" size="md" radius="md"><IconRuler size={16} /></ThemeIcon>
                    <Text size="sm" fw={700}>{area}</Text>
                </Stack>
            </Group>
        </Grid.Col>

        {/* 4. Price & Action */}
        <Grid.Col span={{ base: 6, sm: 2, md: 2.5 }}>
            <Stack align="flex-end" gap="sm">
                <Text fw={800} size="xl" c="blue.7">{data.price || 'On Request'}</Text>
                <Button 
                    component={Link}
                    href={`/listing/${post.id}`}
                    variant="outline" 
                    color="gray" 
                    radius="md" 
                    size="xs"
                    rightSection={<IconChevronRight size={14} />}
                >
                    View Details
                </Button>
            </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  )
}
