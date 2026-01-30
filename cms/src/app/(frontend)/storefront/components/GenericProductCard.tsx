'use client'

import React from 'react'
import Link from 'next/link'
import { Card, Image, Text, Badge, Button, Group, Stack, Box, ThemeIcon, Paper, rem } from '@mantine/core'
import { IconBrandWhatsapp, IconArrowRight, IconTag, IconShoppingBag } from '@tabler/icons-react'

/**
 * MODERN GENERIC CARD (Mantine Version)
 * Optimized for general products, services, or news.
 */
export const GenericProductCard = ({ post }: { post: any }) => {
  const mediaUrl = post.assets?.brandedMedia?.url || post.assets?.rawMedia?.url
  
  const campaignTitle = post.campaign?.title || 'Featured'
  const data = post.content?.[0]?.data || {}
  const price = data.price || data.salePrice
  
  return (
    <Card 
      shadow="sm" 
      radius="lg" 
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
        <Box className="hover-zoom-container" style={{ 
            overflow: 'hidden',
        }}>
          <Image
            src={mediaUrl}
            height={240}
            alt={post.title}
            fallbackSrc="https://placehold.co/600x400?text=No+Preview"
          />
        </Box>
        <Badge 
          color="violet" 
          variant="filled" 
          size="sm"
          radius="sm"
          style={{ 
            position: 'absolute', 
            top: 12, 
            left: 12, 
            zIndex: 2,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)' 
          }}
        >
          {campaignTitle}
        </Badge>
        
        {price && (
           <Paper 
             radius="xl" 
             px="md"
             py={4}
             shadow="sm"
             style={{
               position: 'absolute', 
               bottom: 12, 
               right: 12, 
               zIndex: 2,
               backgroundColor: 'rgba(255, 255, 255, 0.95)',
               color: 'black'
             }}
           >
             <Text fw={800} size="sm">{price}</Text>
           </Paper>
        )}
      </Card.Section>

      <Stack p="lg" gap="md" style={{ flex: 1 }}>
        <Box style={{ flex: 1 }}>
          <Text fw={700} size="lg" lineClamp={2} style={{ lineHeight: 1.3 }}>
            {post.title}
          </Text>

          <Text size="sm" c="dimmed" mt="xs" lineClamp={3}>
            {post.caption?.root?.children?.[0]?.children?.[0]?.text || 'No description available for this item.'}
          </Text>
        </Box>

        <Button 
          component={Link}
          href={`/listing/${post.id}`}
          variant="light"
          color="blue" 
          fullWidth 
          radius="md"
          rightSection={<IconArrowRight size={18} />}
          justify="space-between"
          styles={{ root: { transition: 'background-color 0.2s' } }}
        >
          View Details
        </Button>
      </Stack>
    </Card>
  )
}