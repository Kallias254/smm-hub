import React from 'react'
import { GenericProductCard } from './GenericProductCard'

// Registry of Niche-Specific Components
const ComponentRegistry: Record<string, React.FC<{ post: any }>> = {
  // We will add RealEstateCard, RetailCard etc here as we build them.
  'real-estate-listing': GenericProductCard, // Fallback for now
  'sports-fixture': GenericProductCard,
}

export const StorefrontFactory = ({ posts }: { posts: any[] }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => {
        // Find the block type from the content array
        const blockType = post.content?.[0]?.blockType || 'generic'
        const Card = ComponentRegistry[blockType] || GenericProductCard

        return <Card key={post.id} post={post} />
      })}
    </div>
  )
}
