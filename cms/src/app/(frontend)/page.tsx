import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import { Container, Title, Text, Group, Button, Stack, ThemeIcon, Paper, Box, rem, Center, ActionIcon, SimpleGrid, Badge, Rating, Avatar } from '@mantine/core'
import { IconBuildingStore, IconRocket, IconMapPin, IconChevronRight, IconQuote, IconArrowRight, Icon360 } from '@tabler/icons-react'
import { StorefrontHeader } from './components/StorefrontHeader'
import { StorefrontFooter } from './components/StorefrontFooter'
import { CategorizedListings } from './storefront/components/CategorizedListings'
import { SmartSearch } from './storefront/components/SmartSearch'
import './styles.css'

function AreaCard({ name, count, image, primaryColor }: { name: string; count: number; image: string; primaryColor: string }) {
    return (
        <Paper component={Link} href={`/properties?search=${name}`} radius="lg" pos="relative" h={380} className="hover-lift" style={{ overflow: 'hidden', cursor: 'pointer', border: 'none', backgroundColor: 'var(--mantine-color-body)' }}>
            <Box className="hover-zoom-container" style={{ height: '100%', width: '100%', position: 'relative' }}>
                <img src={image} alt={name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                <Box pos="absolute" style={{ inset: -1, zIndex: 1, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)', pointerEvents: 'none' }} />
            </Box>
            <Box pos="absolute" bottom={30} left={30} right={30} style={{ zIndex: 2 }}>
                <Title order={3} c="white" fw={900} size={rem(28)} style={{ letterSpacing: -0.5 }}>{name}</Title>
                <Group justify="space-between" align="center" mt="xs">
                    <Text c="white" opacity={0.9} fw={700} size="sm">{count} PROPERTIES</Text>
                    <ActionIcon variant="filled" color={primaryColor} radius="xl" size="md"><IconChevronRight size={18} stroke={3} /></ActionIcon>
                </Group>
            </Box>
        </Paper>
    )
}

function ReviewCard({ name, text, rating, avatar }: { name: string; text: string; rating: number; avatar: string }) {
    return (
        <Paper p="xl" radius="lg" withBorder bg="var(--mantine-color-body)" shadow="sm" style={{ height: '100%' }}>
            <Stack gap="md">
                <Group gap="sm">
                    <Avatar src={avatar} size="lg" radius="xl" />
                    <Box><Text fw={800} size="sm">{name}</Text><Rating value={rating} readOnly size="xs" /></Box>
                    <ThemeIcon variant="light" color="blue" size="xl" radius="md" ml="auto" style={{ opacity: 0.2 }}><IconQuote size={32} /></ThemeIcon>
                </Group>
                <Text size="sm" c="dimmed" lh={1.6} fs="italic">&quot;{text}&quot;</Text>
            </Stack>
        </Paper>
    )
}

export default async function HomePage() {
  const headerList = await headers()
  const subdomain = headerList.get('x-tenant-subdomain')
  const payload = await getPayload({ config })

  // Handle Platform Root
  if (!subdomain || subdomain === 'admin') {
    const { user } = await payload.auth({ headers: headerList })
    return (
      <div className="home bg-black min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black z-0 pointer-events-none" />
        <div className="content text-center z-10 relative px-4">
          <div className="mb-8 inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl ring-1 ring-white/10 shadow-2xl backdrop-blur-md">
             <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">SMM HUB</h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">The high-performance content manufacturing plant for modern agencies.</p>
          <div className="links flex gap-4 justify-center"><Link href="/admin" className="px-8 py-3 bg-white text-black font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 flex items-center gap-2">{user ? 'Go to Dashboard' : 'Login to Admin'}<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg></Link></div>
        </div>
      </div>
    )
  }

  // Handle Tenant Storefront
  const tenantRes = await payload.find({ collection: 'tenants', where: { subdomain: { equals: subdomain } }, limit: 1 })
  const tenant = tenantRes.docs[0]
  if (!tenant) return <Box bg="dark.9" mih="100vh" display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}><Container size="sm"><Paper p={60} withBorder radius="xl" bg="dark.8" ta="center" shadow="xl"><ThemeIcon size={80} radius="xl" variant="light" color="gray" mb="xl"><IconBuildingStore size={40} stroke={1.5} /></ThemeIcon><Title order={2} mb="md" fw={900}>Agency Not Found</Title><Text c="dimmed" size="lg" mb="xl">The agency storefront you are looking for does not exist or has been moved.</Text><Button component={Link} href="/" variant="subtle" color="gray">Return Home</Button></Paper></Container></Box>

  const postsRes = await payload.find({ collection: 'posts', where: { tenant: { equals: tenant.id }, distributionStatus: { equals: 'published' } }, depth: 2, sort: '-updatedAt' })
  const primaryColor = (tenant as any).branding?.primaryColor || '#228be6'

  return (
    <Box mih="100vh" style={{ backgroundColor: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)', overflowX: 'hidden' }}>
      
      {/* Hero Section */}
      <Box pos="relative" bg="var(--mantine-color-default-hover)" py={{ base: 60, md: 100 }} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Container size="xl">
            <Stack align="center" gap="xl">
                <Box ta="center" maw={900}>
                    <Group justify="center" gap="xs" mb="md">
                        <Badge variant="filled" color={primaryColor} size="lg" radius="sm" leftSection={<Icon360 size={14} />}>
                            360° VIRTUAL TOURS
                        </Badge>
                        <Badge variant="outline" color="gray" size="lg" radius="sm" style={{ borderColor: 'var(--mantine-color-default-border)' }}>
                            ZERO VIEWING FEES
                        </Badge>
                    </Group>
                    <Title order={1} style={{ letterSpacing: -2, lineHeight: 1.1, fontSize: rem(64), fontWeight: 900 }}>
                        House Hunt from Home.
                    </Title>
                    <Text size="xl" c="dimmed" mt="lg" fw={500} maw={600} mx="auto" lh={1.6}>
                        Immerse yourself in every room before you ever step out the door.
                    </Text>
                </Box>
                
                <SmartSearch primaryColor={primaryColor} />

                <Box w="100%" mt={40}>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
                        <ReviewCard name="David Mwangi" text="Found my dream apartment in Westlands in just two days." rating={5} avatar="https://i.pravatar.cc/150?u=david" />
                        <ReviewCard name="Sarah Chen" text="Professional service and very transparent pricing." rating={5} avatar="https://i.pravatar.cc/150?u=sarah" />
                        <ReviewCard name="John Kibet" text="The best property agency in Nairobi." rating={5} avatar="https://i.pravatar.cc/150?u=john" />
                    </SimpleGrid>
                </Box>
            </Stack>
        </Container>
      </Box>

      {/* Area Discovery */}
      <Box py={80} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Container size="xl">
            <Group justify="space-between" align="flex-end" mb={40}>
                <Box><Title order={2} size={rem(32)} fw={900}>Find Your Home By Area</Title><Text c="dimmed" size="lg" mt="xs">Explore properties in Nairobi&apos;s most sought-after neighborhoods.</Text></Box>
                <Button variant="subtle" color={primaryColor} rightSection={<IconArrowRight size={18} />}>View All Areas</Button>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                <AreaCard name="Karen" count={12} image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" primaryColor={primaryColor} />
                <AreaCard name="Westlands" count={8} image="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80" primaryColor={primaryColor} />
                <AreaCard name="Lavington" count={5} image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" primaryColor={primaryColor} />
                <AreaCard name="Kilimani" count={15} image="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80" primaryColor={primaryColor} />
            </SimpleGrid>
        </Container>
      </Box>

      {/* Categorized Collection */}
      <Box py={80} bg="var(--mantine-color-default-hover)">
        <Container size="xl">
            <Group justify="space-between" align="flex-end" mb={60}>
                <Box><Title order={2} style={{ letterSpacing: -1, fontSize: rem(36), fontWeight: 900 }}>Exclusive Property Collection</Title><Text size="lg" c="dimmed">Our hand-picked selection of the most premium real estate opportunities.</Text></Box>
                <Button component={Link} href="/properties" variant="filled" color={primaryColor} size="md" radius="md" rightSection={<IconArrowRight size={18} />}>Explore All Properties</Button>
            </Group>
            <CategorizedListings posts={postsRes.docs} primaryColor={primaryColor} />
        </Container>
      </Box>

      {/* Footer */}
    </Box>
  )
}
