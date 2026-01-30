import React from 'react'
import { SimpleGrid } from '@mantine/core'
import { GenericProductCard } from './GenericProductCard'
import { RealEstateCard } from './RealEstateCard'

// Registry of Niche-Specific Components
const ComponentRegistry: Record<string, React.FC<{ post: any }>> = {
  'real-estate-listing': RealEstateCard,
  'retail-product': GenericProductCard,
  'service-package': GenericProductCard,
  'sports-fixture': GenericProductCard, // Placeholder
}

export const StorefrontFactory = ({ posts }: { posts: any[] }) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg" verticalSpacing="xl">
      {posts.map((post) => {
        // Find the block type from the content array
        const blockType = post.content?.[0]?.blockType || 'generic'
        const Card = ComponentRegistry[blockType] || GenericProductCard

        return <Card key={post.id} post={post} />
      })}
    </SimpleGrid>
  )
}