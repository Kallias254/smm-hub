'use client'

import React, { useState } from 'react'
import { Tabs, Center, Text, rem, Button, Group } from '@mantine/core'
import { IconHomeDollar, IconKey, IconArrowRight } from '@tabler/icons-react'
import { RealEstateCard } from './RealEstateCard'
import { GenericProductCard } from './GenericProductCard'
import { SimpleGrid } from '@mantine/core'
import Link from 'next/link'

const ComponentRegistry: Record<string, React.FC<{ post: any }>> = {
  'real-estate-listing': RealEstateCard,
  'retail-product': GenericProductCard,
  'service-package': GenericProductCard,
  'sports-fixture': GenericProductCard,
}

function LocalStorefrontFactory({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) return null
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg" verticalSpacing="xl">
      {posts.map((post) => {
        const blockType = post.content?.[0]?.blockType || 'generic'
        const CardComponent = ComponentRegistry[blockType] || GenericProductCard
        return <CardComponent key={post.id} post={post} />
      })}
    </SimpleGrid>
  )
}

export function CategorizedListings({ posts, primaryColor }: { posts: any[]; primaryColor: string }) {
  const salePosts = posts.filter(p => p.content?.[0]?.data?.propertyStatus?.toLowerCase().includes('sale'))
  const rentPosts = posts.filter(p => p.content?.[0]?.data?.propertyStatus?.toLowerCase().includes('rent'))

  return (
    <Tabs defaultValue="sale" color={primaryColor} variant="pills" radius="md">
      <Tabs.List mb={40}>
        <Tabs.Tab value="sale" leftSection={<IconHomeDollar size={18} />} px="xl">
          <Text fw={700}>For Sale</Text>
        </Tabs.Tab>
        <Tabs.Tab value="rent" leftSection={<IconKey size={18} />} px="xl">
          <Text fw={700}>For Rent</Text>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="sale">
        {salePosts.length > 0 ? (
          <LocalStorefrontFactory posts={salePosts} />
        ) : (
          <Center py={60}><Text c="dimmed">No investment properties currently for sale.</Text></Center>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="rent">
        {rentPosts.length > 0 ? (
          <LocalStorefrontFactory posts={rentPosts} />
        ) : (
          <Center py={60}><Text c="dimmed">No properties currently available for rent.</Text></Center>
        )}
      </Tabs.Panel>
    </Tabs>
  )
}
