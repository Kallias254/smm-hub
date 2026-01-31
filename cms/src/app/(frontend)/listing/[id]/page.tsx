import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import { Container, Title, Text, Group, Button, Stack, ThemeIcon, Paper, Box, Badge, Divider, SimpleGrid, rem, ActionIcon, Flex, Avatar, TextInput, Textarea, Anchor, SegmentedControl, Rating, Select } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconMapPin, IconBed, IconBath, IconMaximize, IconBrandWhatsapp, IconCheck, IconShare, IconHeart, IconChevronLeft, IconRuler, IconHome, IconPhone, IconMail, Icon360, IconMap2, IconCalendar, IconVideo, IconWalk, IconPhoto, IconSwimming, IconCar, IconWifi, IconLock, IconTrees, IconBarbell, IconCircleCheck, IconStar, IconMessageCircle } from '@tabler/icons-react'
import { notFound } from 'next/navigation'
import { MediaHero } from './MediaHero'
import { PropertyGallery } from './PropertyGallery'
import { MortgageCalculator } from './MortgageCalculator'
import { StorefrontHeader } from '../../components/StorefrontHeader'
import { StorefrontFooter } from '../../components/StorefrontFooter'

function FeatureStat({ icon: Icon, label, value }: any) {
    if (!value) return null
    return (
        <Group gap="sm" wrap="nowrap">
             <Icon size={24} stroke={1.5} color="var(--mantine-color-blue-7)" />
            <Box>
                <Text fw={800} size="lg" lh={1.2}>{value}</Text>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5}>{label}</Text>
            </Box>
        </Group>
    )
}

function DetailItem({ label, value }: { label: string; value: any }) {
    if (value === undefined || value === null || value === '') return null
    return (
        <Group justify="space-between" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
            <Text fw={600} size="sm" c="dimmed">{label}</Text>
            <Text fw={700} size="sm" ta="right">{value}</Text>
        </Group>
    )
}

function getFeatureIcon(featureName: string) {
    const lower = featureName.toLowerCase()
    if (lower.includes('pool') || lower.includes('swim')) return IconSwimming
    if (lower.includes('park') || lower.includes('garage')) return IconCar
    if (lower.includes('wifi') || lower.includes('internet')) return IconWifi
    if (lower.includes('security') || lower.includes('guard')) return IconLock
    if (lower.includes('garden') || lower.includes('lawn')) return IconTrees
    if (lower.includes('gym') || lower.includes('fitness')) return IconBarbell
    return IconCircleCheck
}

function SimilarListingCard({ post }: { post: any }) {
    const data = post.content?.[0]?.data || {}
    const mediaUrl = (post.assets?.brandedMedia as any)?.url || (post.assets?.rawMedia as any)?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
    
    const price = data.price || data.salePrice || 'Price on Request'
    const location = data.location || 'Nairobi'
    const featuresStr = data.features as string || ''
    const bedMatch = featuresStr.match(/(\d+)\s*Bed/)
    const bathMatch = featuresStr.match(/(\d+)\s*Bath/)
    const areaMatch = featuresStr.match(/(\d+)\s*sqft/)
    const propertyType = data.propertyType || 'Apartment'

    return (
        <Paper 
            withBorder 
            radius="md" 
            p={0} 
            shadow="sm" 
            component={Link} 
            href={`/listing/${post.id}`} 
            className="hover-lift"
            style={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                overflow: 'hidden', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: 'var(--mantine-color-body)'
            }}
        >
            <Box h={200} pos="relative" className="hover-zoom-container">
                <img src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={post.title} />
                <Badge pos="absolute" top={12} left={12} color="blue" variant="filled" radius="sm" fw={700}>
                    {(data.propertyStatus || 'FOR RENT').toUpperCase()}
                </Badge>
            </Box>
            <Box p="md" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box mb="md">
                    <Text fw={800} size="lg" mb={4} lineClamp={1}>{post.title}</Text>
                    <Text c="blue.7" fw={800} size="xl" mb={4}>{price}</Text>
                    <Group gap={4} c="dimmed">
                        <IconMapPin size={14} />
                        <Text size="xs" truncate>{location}</Text>
                    </Group>
                </Box>
                
                <Divider mb="md" color="var(--mantine-color-default-border)" />
                
                <Group justify="space-between" mt="auto" align="center">
                    <Group gap="md">
                        <Group gap={4}>
                            <IconBed size={18} c="blue.7" stroke={1.5} />
                            <Text size="sm" fw={800}>{bedMatch?.[1] || '0'}</Text>
                        </Group>
                        <Group gap={4}>
                            <IconBath size={18} c="blue.7" stroke={1.5} />
                            <Text size="sm" fw={800}>{bathMatch?.[1] || '0'}</Text>
                        </Group>
                        <Group gap={4}>
                            <IconRuler size={18} c="blue.7" stroke={1.5} />
                            <Text size="sm" fw={800}>{areaMatch?.[1] || '--'}</Text>
                        </Group>
                    </Group>
                    <Badge variant="light" color="blue" radius="sm" tt="uppercase" fw={700} size="xs" style={{ whiteSpace: 'nowrap' }}>
                        {propertyType}
                    </Badge>
                </Group>
            </Box>
        </Paper>
    )
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headerList = await headers()
  const subdomain = headerList.get('x-tenant-subdomain')
  const payload = await getPayload({ config })

  // 1. Fetch Post
  const post = await payload.findByID({
    collection: 'posts',
    id,
    depth: 2,
  })

  if (!post) {
    notFound()
  }

  // 1b. Fetch Tenant for Branding
  let tenant = null
  if (subdomain) {
    const tenantRes = await payload.find({
        collection: 'tenants',
        where: { subdomain: { equals: subdomain } },
        limit: 1
    })
    tenant = tenantRes.docs[0]
  }
  
  const primaryColor = (tenant as any)?.branding?.primaryColor || '#228be6'

  // 2. Fetch Similar Listings
  const similarListingsResult = await payload.find({
    collection: 'posts',
    where: {
        and: [
            {
                id: { not_equals: id },
            },
            {
                'content.blockType': { equals: 'real-estate-listing' },
            }
        ]
    },
    limit: 4,
  })

  // 3. Resolve Data & Assets
  const contentBlock = post.content?.[0]
  const data = contentBlock?.data || {}
  const blockType = contentBlock?.blockType
  
  // SAMPLE DATA FOR DEMO PURPOSES
  const SAMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80', // Exterior (Modern House)
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80', // Living Room
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80', // Kitchen
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=80', // Bedroom
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=80', // Pool
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80', // Bathroom (Modern)
    'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=1600&q=80', // Patio/Garden
  ]

  const SAMPLE_360 = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2600&auto=format&fit=crop' // Wide Interior

  // Use Branded/Raw if available, otherwise fall back to Unsplash for that "Glory" look
  const mediaUrl = (post.assets?.brandedMedia as any)?.url || (post.assets?.rawMedia as any)?.url || SAMPLE_IMAGES[0]

  // Extract Features
  const featuresStr = (data.features as string) || ''
  
  const bedMatch = featuresStr.match(/(\d+)\s*Bed/)
  const bathMatch = featuresStr.match(/(\d+)\s*Bath/)
  const areaMatch = featuresStr.match(/(\d+)\s*sqft/)
  const areaSqm = areaMatch ? Math.round(parseInt(areaMatch[1]) / 10.764) : null

  // Deduplicate: Filter out features that are already in the top stats bar
  const featuresList = featuresStr.split(',')
    .map(f => f.trim())
    .filter(f => {
        if (!f) return false
        if (f.match(/\d+\s*Bed/i)) return false
        if (f.match(/\d+\s*Bath/i)) return false
        if (f.match(/\d+\s*sqft/i)) return false
        return true
    })

  const price = data.price || data.salePrice || 'Price on Request'
  const location = data.location || 'Nairobi, Kenya'
  const isRealEstate = blockType === 'real-estate-listing'

  // Format Date
  const updatedAtFormatted = new Date(post.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <Box mih="100vh" style={{ backgroundColor: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }}>
      {/* 2. Hero Section (360 First) */}
      <MediaHero mediaUrl={mediaUrl} tourUrl={SAMPLE_360} title={post.title} />

      {/* 3. Main Content Layout */}
      <Container size="xl" py={{ base: 30, md: 60 }}>
        <Flex gap={{ base: 40, md: 60 }} direction={{ base: 'column', md: 'row' }}>
            
            {/* LEFT COLUMN (Content) */}
            <Box style={{ flex: 1, minWidth: 0 }}>
                
                {/* Header Info */}
                <Box mb={{ base: 30, md: 50 }}>
                    <Flex 
                        justify="space-between" 
                        align={{ base: 'flex-start', md: 'flex-start' }} 
                        direction={{ base: 'column', md: 'row' }}
                        gap={{ base: 'sm', md: 'xl' }}
                    >
                        <Box style={{ flex: 1, minWidth: 0 }}>
                             <Badge color="blue.9" variant="filled" size="lg" radius="sm" mb="sm">
                                {isRealEstate ? 'FOR RENT' : 'FEATURED'}
                             </Badge>
                             <Title 
                                order={1} 
                                fw={900} 
                                lh={1.1} 
                                style={{ 
                                    letterSpacing: '-1.2px',
                                    fontSize: 'var(--title-fz)',
                                    '--title-fz': '28px',
                                } as any}
                                mod={{ md: { '--title-fz': '50px' } }}
                             >
                                {post.title}
                             </Title>
                             <Group gap="xs" mt="xs" c="dimmed">
                                <IconMapPin size={18} stroke={1.5} />
                                <Text size="md" fw={500}>{location}</Text>
                             </Group>
                        </Box>
                        <Text 
                            fw={900} 
                            c="blue.7" 
                            style={{ 
                                letterSpacing: '-1.2px', 
                                whiteSpace: 'nowrap', 
                                lineHeight: 1,
                                fontSize: 'var(--price-fz)',
                                '--price-fz': '24px',
                            } as any} 
                            mod={{ md: { '--price-fz': '42px' } }}
                            mt={{ base: 4, md: 15 }}
                        >
                            {price}
                        </Text>
                    </Flex>

                    <Divider my="xl" color="var(--mantine-color-default-border)" />

                    {/* Stats Bar - Clean & Modern */}
                    {isRealEstate && (
                        <Box py="md" style={{ overflowX: 'auto' }}>
                             <Group gap={{ base: 25, md: 50 }} wrap="nowrap">
                                <FeatureStat icon={IconHome} label="Type" value={data.propertyType || 'Apartment'} />
                                <FeatureStat icon={IconBed} label="Bedrooms" value={bedMatch?.[1] || '0'} />
                                <FeatureStat icon={IconBath} label="Bathrooms" value={bathMatch?.[1] || '0'} />
                                <FeatureStat icon={IconRuler} label="SQM" value={areaSqm} />
                             </Group>
                        </Box>
                    )}
                </Box>

                {/* Description */}
                <Box mb={50}>
                    <Title order={3} size="h3" mb="md" fw={800}>Description</Title>
                    <Text size="lg" lh={1.8} style={{ opacity: 0.9 }}>
                         {post.caption?.root?.children?.map((child: any, i: number) => (
                                <span key={i}>{child.children?.[0]?.text} </span>
                        )) || 'Experience luxury living at its finest. This property offers a unique blend of modern design and comfort, featuring high-end finishes throughout.'}
                    </Text>
                </Box>

                {/* Details Section */}
                <Box mb={50}>
                    <Title order={3} size="h3" mb="xl" fw={800}>Details</Title>
                    <Text size="xs" c="dimmed" mb="md">Updated on {updatedAtFormatted}</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                        <Box>
                            <DetailItem label="Price" value={price} />
                            <DetailItem label="Property Type" value={data.propertyType || 'Apartments'} />
                            <DetailItem label="Property Status" value={data.propertyStatus || 'For Rent'} />
                        </Box>
                        <Box>
                            <DetailItem label="Deposit" value={data.deposit || 'Negotiable'} />
                            <DetailItem label="Address" value={location} />
                            <DetailItem label="Area" value={location.split(',')[0]} />
                        </Box>
                    </SimpleGrid>
                </Box>

                 {/* Amenities - Deduplicated & Icon Mapped */}
                 {featuresList.length > 0 && (
                    <Box mb={50}>
                        <Title order={3} size="h3" mb="xl" fw={800}>Property Features</Title>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                             {featuresList.map((feature, i) => {
                                const FeatureIcon = getFeatureIcon(feature)
                                return (
                                    <Group key={i} gap="sm">
                                        <ThemeIcon color="green.8" variant="light" size="md" radius="xl">
                                            <FeatureIcon size={18} stroke={2} />
                                        </ThemeIcon>
                                        <Text size="md" fw={600}>{feature}</Text>
                                    </Group>
                                )
                             })}
                        </SimpleGrid>
                    </Box>
                 )}

                 {/* Gallery Section - Interactive Lightbox */}
                 <Box mb={50}>
                    <Group mb="lg">
                        <IconPhoto size={28} />
                        <Title order={3} size="h3" fw={800}>Property Gallery</Title>
                    </Group>
                    <PropertyGallery images={SAMPLE_IMAGES} />
                 </Box>

                 {/* Map */}
                 <Box mb={50}>
                    <Group mb="lg">
                        <IconMap2 size={28} />
                        <Title order={3} size="h3" fw={800}>Location</Title>
                    </Group>
                    <Paper h={400} radius="md" overflow="hidden" withBorder shadow="sm">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(location)}&zoom=14`}
                            allowFullScreen
                        ></iframe>
                    </Paper>
                 </Box>

                 {/* Reviews Section */}
                 <Box mb={50}>
                    <Group justify="space-between" mb="xl">
                        <Group>
                            <IconMessageCircle size={28} />
                            <Title order={3} size="h3" fw={800}>0 Reviews</Title>
                        </Group>
                        <Select 
                            placeholder="Sort by"
                            data={['Default Order', 'Newest First', 'Highest Rating']}
                            size="xs"
                            variant="filled"
                        />
                    </Group>
                    
                    <Paper p="xl" radius="md" withBorder shadow="sm">
                        <Title order={4} mb="xl" fw={800}>Leave a Review</Title>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                            <TextInput label="Email" placeholder="you@example.com" required size="md" />
                            <TextInput label="Title" placeholder="Enter a title" required size="md" />
                        </SimpleGrid>
                        <Box mb="md">
                            <Text size="sm" fw={600} mb={4}>Rating</Text>
                            <Rating size="lg" />
                        </Box>
                        <Textarea label="Review" placeholder="Write a review" required minRows={4} size="md" mb="xl" />
                        <Button variant="filled" color="blue" size="lg">Submit Review</Button>
                    </Paper>
                 </Box>

            </Box>

            {/* RIGHT COLUMN (Sidebar) */}
            <Box w={{ base: '100%', md: 400 }} style={{ flexShrink: 0 }}>
                <Stack gap="xl" pos={{ base: 'static', md: 'sticky' }} top={20}>
                    
                    {/* Schedule Widget */}
                    <Paper p="lg" radius="md" withBorder shadow="md" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
                        <Title order={4} mb="md" fw={800} size="h4">Schedule a Tour</Title>
                        <Stack gap="md">
                            <SegmentedControl
                                fullWidth
                                data={[
                                    { label: 'In-Person', value: 'in-person' },
                                    { label: 'Video Chat', value: 'video' },
                                ]}
                            />
                            
                            <DatePickerInput
                                leftSection={<IconCalendar size={18} stroke={1.5} />}
                                placeholder="Select a Date"
                                size="md"
                            />
                            
                            <SimpleGrid cols={3}>
                                <Button variant="light" color="blue" size="xs">10:00 AM</Button>
                                <Button variant="filled" color="blue" size="xs">11:00 AM</Button>
                                <Button variant="light" color="blue" size="xs">02:00 PM</Button>
                            </SimpleGrid>

                            <Button fullWidth color="blue" size="lg" mt="xs">Request Booking</Button>
                            
                            <Text size="xs" c="dimmed" ta="center">No credit card required. Free cancellation.</Text>
                        </Stack>
                    </Paper>

                    {/* Mortgage Calculator - Only for Sale */}
                    {isRealEstate && (data.propertyStatus?.toLowerCase().includes('sale') || data.salePrice) && (
                        <MortgageCalculator initialAmount={price} />
                    )}

                    {/* Agent Snippet */}
                    <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-default-hover)' }}>
                         <Group>
                            <Avatar size="md" radius="xl" color="blue" variant="filled">
                                {(data.agentName || 'AG').split(' ').map((n: string) => n[0]).join('')}
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                                <Text fw={700} size="sm">{data.agentName || 'Listing Agent'}</Text>
                                <Text size="xs" c="dimmed">Managed by {tenant?.name || 'Premier Properties'}</Text>
                            </Box>
                            <ActionIcon 
                                variant="light" 
                                color="green" 
                                size="lg" 
                                radius="md" 
                                component="a" 
                                href={`https://wa.me/${data.agentPhone || '254700000000'}?text=Inquiry about ${post.title}`}
                                target="_blank"
                            >
                                <IconBrandWhatsapp size={20} />
                            </ActionIcon>
                         </Group>
                    </Paper>

                </Stack>
            </Box>

        </Flex>
      </Container>

      {/* Similar Listings Section */}
      {similarListingsResult.docs.length > 0 && (
        <Box py={80} style={{ backgroundColor: 'var(--mantine-color-default-hover)' }}>
            <Container size="xl">
                <Group mb={40} justify="space-between" align="flex-end">
                    <Box>
                        <Badge variant="filled" color="blue" mb="sm">DISCOVER</Badge>
                        <Title order={2} size={rem(32)} fw={900}>Similar Listings</Title>
                    </Box>
                    <Button variant="subtle" color="blue" rightSection={<IconChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}>View All</Button>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
                    {similarListingsResult.docs.map((similarPost: any) => (
                        <SimilarListingCard key={similarPost.id} post={similarPost} />
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
      )}
      
      {/* Footer Simple */}
    </Box>
  )
}

