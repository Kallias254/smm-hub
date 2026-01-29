'use client'

import React from 'react'
import { Card, Image, Text, Badge, Button, Group, Overlay } from '@mantine/core'
import { IconBrandWhatsapp } from '@tabler/icons-react'

/**
 * MODERN GENERIC CARD (Mantine Version)
 * This is the fallback for any niche we haven't built a specific UI for yet.
 */
export const GenericProductCard = ({ post }: { post: any }) => {
  const mediaUrl = post.assets?.brandedMedia?.url || post.assets?.rawMedia?.url
  
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            height={300}
            alt={post.title}
            fallbackSrc="https://placehold.co/600x400?text=No+Preview"
          />
        ) : (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', color: '#888' }}>
            No Preview Available
          </div>
        )}
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} lineClamp={1}>{post.title}</Text>
        <Badge color="pink" variant="light">
          {post.campaign?.title || 'Featured'}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" lineClamp={2}>
        {post.caption?.root?.children?.[0]?.children?.[0]?.text || 'No description available for this item.'}
      </Text>

      <Button 
        component="a"
        href={`https://wa.me/?text=Hi, I am interested in ${encodeURIComponent(post.title)}`}
        target="_blank"
        color="blue" 
        fullWidth 
        mt="md" 
        radius="md"
        leftSection={<IconBrandWhatsapp size={18} />}
      >
        Interested?
      </Button>
    </Card>
  )
}
