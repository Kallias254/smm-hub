'use client'

import React from 'react'
import { Card, Image, Text, Badge, Group, Button, ActionIcon, Stack } from '@mantine/core'
import { IconMapPin, IconBed, IconBath, IconMaximize, IconBrandWhatsapp } from '@tabler/icons-react'

export const RealEstateCard = ({ post }: { post: any }) => {
  const data = post.content?.[0]?.data || {}
  const mediaUrl = post.assets?.brandedMedia?.url || post.assets?.rawMedia?.url
  
  // Extract features if they exist
  // Features format: "4 Bed | 4 Bath | Garden"
  const features = data.features || ''
  const bedMatch = features.match(/(\d+)\s*Bed/)
  const bathMatch = features.match(/(\d+)\s*Bath/)
  const areaMatch = features.match(/(\d+)\s*sqft/)

  return (
    <Card radius="lg" p="md" withBorder shadow="md">
      <Card.Section relative={true}>
        <Image
          src={mediaUrl}
          height={280}
          alt={post.title}
          fallbackSrc="https://placehold.co/600x400?text=No+Image"
        />
        <Badge 
          variant="filled" 
          color="blue" 
          size="lg" 
          radius="sm"
          style={{ position: 'absolute', top: 15, right: 15, zIndex: 1 }}
        >
          FOR SALE
        </Badge>
      </Card.Section>

      <Stack mt="md" gap="xs">
        <Group justify="space-between">
          <Text fw={800} size="xl" c="blue.4">
            {data.price || 'Price on Request'}
          </Text>
        </Group>

        <Text fw={700} size="lg" lineClamp={1}>
          {post.title}
        </Text>

        <Group gap={5} opacity={0.6}>
          <IconMapPin size={16} stroke={1.5} />
          <Text size="sm">{data.location || 'Nairobi, Kenya'}</Text>
        </Group>

        <Group mt="xs" gap="xl">
          {bedMatch && (
            <Group gap={5}>
              <IconBed size={18} stroke={1.5} color="gray" />
              <Text size="sm" fw={500}>{bedMatch[1]} Beds</Text>
            </Group>
          )}
          {bathMatch && (
            <Group gap={5}>
              <IconBath size={18} stroke={1.5} color="gray" />
              <Text size="sm" fw={500}>{bathMatch[1]} Baths</Text>
            </Group>
          )}
        </Group>
      </Stack>

      <Card.Section mt="md" p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
        <Group justify="space-between">
          <Button 
            component="a"
            href={`https://wa.me/?text=Hi, I am interested in this property: ${encodeURIComponent(post.title)}`}
            target="_blank"
            leftSection={<IconBrandWhatsapp size={18} />}
            variant="light" 
            color="green" 
            radius="md"
            flex={1}
          >
            WhatsApp
          </Button>
          <ActionIcon variant="light" color="blue" size="lg" radius="md">
            <IconMaximize size={20} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Card.Section>
    </Card>
  )
}
