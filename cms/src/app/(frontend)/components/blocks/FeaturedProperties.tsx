import React from 'react'
import { FeaturedPropertiesBlock as FeaturedPropertiesBlockType } from '@/payload-types'
import { Box, Title, SimpleGrid, Card, Image, Text } from '@mantine/core'

export const FeaturedProperties: React.FC<FeaturedPropertiesBlockType> = ({ headline, properties }) => {
  return (
    <Box w="100%" p="xl">
      <Title order={2} ta="center" mb="xl">{headline}</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {properties && properties.map((prop) => {
          if (typeof prop === 'object') {
            const imageUrl = prop.featuredImage && typeof prop.featuredImage === 'object' ? prop.featuredImage.url : '/placeholder.jpg'
            return (
              <Card key={prop.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Image
                    src={imageUrl}
                    height={160}
                    alt={prop.title}
                  />
                </Card.Section>
                <Text fw={500} mt="md">{prop.title}</Text>
                <Text size="sm" c="dimmed">{prop.location}</Text>
              </Card>
            )
          }
          return null
        })}
      </SimpleGrid>
    </Box>
  )
}
