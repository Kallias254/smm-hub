'use client'

import React from 'react'
import { Paper, Group, Avatar, Text, Stack, Rating, ThemeIcon, Box, SimpleGrid } from '@mantine/core'
import { IconQuote } from '@tabler/icons-react'

interface Review {
  id: string
  clientName: string
  rating: string
  feedback?: string
  createdAt: string
}

export const ReviewWidget = ({ reviews }: { reviews: any[] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ borderStyle: 'dashed' }}>
        <Stack align="center" gap="xs">
          <Text fw={700} c="dimmed">No reviews yet.</Text>
          <Text size="sm" c="dimmed">Be the first to share your experience!</Text>
        </Stack>
      </Paper>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
      {reviews.map((review) => (
        <Paper key={review.id} p="xl" radius="lg" withBorder shadow="sm" pos="relative" style={{ overflow: 'hidden' }}>
          <ThemeIcon 
            variant="light" 
            color="blue" 
            size={60} 
            radius="md" 
            pos="absolute" 
            top={-10} 
            right={-10} 
            style={{ opacity: 0.1, transform: 'rotate(15deg)' }}
          >
            <IconQuote size={40} />
          </ThemeIcon>

          <Stack gap="md">
            <Group gap="sm">
              <Avatar 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.clientName}`} 
                radius="xl" 
                size="md" 
              />
              <Box>
                <Text fw={800} size="sm">{review.clientName}</Text>
                <Text size="xs" c="dimmed">Verified Client</Text>
              </Box>
              <Rating value={5} readOnly size="xs" ml="auto" />
            </Group>

            <Text size="sm" lh={1.6} style={{ fontStyle: review.rating === 'positive' ? 'normal' : 'italic' }}>
              {review.rating === 'positive' 
                ? "Highly recommend! The service was professional and they helped us find exactly what we were looking for." 
                : review.feedback}
            </Text>
            
            <Text size="xs" c="dimmed" fw={600}>
              {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  )
}
