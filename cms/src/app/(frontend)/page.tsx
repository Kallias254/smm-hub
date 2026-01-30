import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import { StorefrontFactory } from './storefront/components/StorefrontFactory'
import { Container, Title, Text, Group, Button, Stack, ThemeIcon, Paper, Box, rem, Center, TextInput, ActionIcon, SimpleGrid, Image, Overlay, Badge, Rating, Avatar, Divider } from '@mantine/core'
import { IconBuildingStore, IconSparkles, IconRocket, IconSearch, IconMapPin, IconChevronRight, IconStar, IconQuote, IconArrowRight } from '@tabler/icons-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import './styles.css'

function AreaCard({ name, count, image, primaryColor }: { name: string; count: number; image: string; primaryColor: string }) {
    return (
        <Paper 
            component={Link} 
            href={`/search?area=${name}`}
            radius="lg" 
            pos="relative" 
            h={380} 
            className="hover-lift hover-zoom-container"
            style={{ 
                overflow: 'hidden', 
                cursor: 'pointer', 
                border: 'none',
                backgroundColor: 'var(--mantine-color-body)'
            }}
        >
            <Image 
                src={image} 
                alt={name} 
                h={380} 
                w="100%" 
                fit="cover" 
            />
            <Box 
                pos="absolute" 
                inset={0} 
                style={{ 
                    zIndex: 1,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
                }} 
            />
            <Box pos="absolute" bottom={30} left={30} right={30} style={{ zIndex: 2 }}>
                <Title order={3} c="white" fw={900} size={rem(28)} style={{ letterSpacing: -0.5 }}>{name}</Title>
                <Group justify="space-between" align="center" mt="xs">
                    <Text c="white" opacity={0.9} fw={700} size="sm">{count} PROPERTIES</Text>
                    <ActionIcon 
                        variant="filled" 
                        color={primaryColor} 
                        radius="xl" 
                        size="md"
                    >
                        <IconChevronRight size={18} stroke={3} />
                    </ActionIcon>
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
                    <Box>
                        <Text fw={800} size="sm">{name}</Text>
                        <Rating value={rating} readOnly size="xs" />
                    </Box>
                    <ThemeIcon variant="light" color="blue" size="xl" radius="md" ml="auto" style={{ opacity: 0.2 }}>
                        <IconQuote size={32} />
                    </ThemeIcon>
                </Group>
                <Text size="sm" c="dimmed" lh={1.6} fs="italic">"{text}"</Text>
            </Stack>
        </Paper>
    )
}

/**
 * THE UNIVERSAL ENTRY POINT
 * Routes users to the Storefront if on a subdomain, or the Platform landing page.
 */
export default async function HomePage() {
  const headerList = await headers()
  const subdomain = headerList.get('x-tenant-subdomain')

  // 1. Handle Platform Root (admin.smmhub.com or smmhub.com)
  if (!subdomain || subdomain === 'admin') {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: headerList })

    return (
      <div className="home bg-black min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black z-0 pointer-events-none" />
        
        <div className="content text-center z-10 relative px-4">
          <div className="mb-8 inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl ring-1 ring-white/10 shadow-2xl backdrop-blur-md">
             <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
            SMM HUB
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
            The high-performance content manufacturing plant for modern agencies.
          </p>
          <div className="links flex gap-4 justify-center">
            <Link 
              href="/admin" 
              className="px-8 py-3 bg-white text-black font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 flex items-center gap-2"
            >
              {user ? 'Go to Dashboard' : 'Login to Admin'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 2. Handle Tenant Storefront
  const payload = await getPayload({ config })

  // A. Fetch Tenant
  const tenantRes = await payload.find({
    collection: 'tenants',
    where: { subdomain: { equals: subdomain } },
    limit: 1
  })

  const tenant = tenantRes.docs[0]
  if (!tenant) {
    return (
      <Box bg="dark.9" mih="100vh" display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Container size="sm">
          <Paper p={60} withBorder radius="xl" bg="dark.8" ta="center" shadow="xl">
            <ThemeIcon size={80} radius="xl" variant="light" color="gray" mb="xl">
               <IconBuildingStore size={40} stroke={1.5} />
            </ThemeIcon>
            <Title order={2} mb="md" fw={900}>Agency Not Found</Title>
            <Text c="dimmed" size="lg" mb="xl">The agency storefront you are looking for does not exist or has been moved.</Text>
            <Button component={Link} href="/" variant="subtle" color="gray">Return Home</Button>
          </Paper>
        </Container>
      </Box>
    )
  }

  // B. Fetch Branded Posts
  const postsRes = await payload.find({
    collection: 'posts',
    where: {
      tenant: { equals: tenant.id },
      distributionStatus: { equals: 'published' }
    },
    depth: 2,
    sort: '-updatedAt'
  })

  const primaryColor = (tenant as any).branding?.primaryColor || '#228be6'

  return (
    <Box mih="100vh" style={{ backgroundColor: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)', overflowX: 'hidden' }}>
      {/* Header */}
      <Box 
        component="header" 
        py="md" 
        style={{ 
          backgroundColor: 'var(--mantine-color-body)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          opacity: 0.95
        }}
      >
        <Container size="xl">
          <Group justify="space-between">
            <Group 
                component={Link} 
                href="/" 
                gap="md" 
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              {(tenant as any).branding?.logo?.url ? (
                <img 
                  src={(tenant as any).branding.logo.url} 
                  style={{ height: 40, width: 'auto' }} 
                  alt="Logo" 
                />
              ) : (
                <ThemeIcon size="lg" radius="md" color={primaryColor} variant="light">
                    <IconRocket size={20} />
                </ThemeIcon>
              )}
              <Title order={3} size="h4" fw={800} style={{ letterSpacing: -0.5 }}>{tenant.name}</Title>
            </Group>
            <Group gap="lg">
              <Text span visibleFrom="sm" size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 2 }}>
                Collection
              </Text>
              <ThemeToggle />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Hero Section with Reviews Center Stage */}
      <Box pos="relative" bg="var(--mantine-color-default-hover)" py={{ base: 60, md: 100 }} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Container size="xl">
            <Stack align="center" gap="xl">
                <Box ta="center" maw={800}>
                    <Badge variant="filled" color={primaryColor} mb="md" size="lg" radius="sm">TRUSTED BY HUNDREDS</Badge>
                    <Title order={1} size={rem(56)} fw={900} style={{ letterSpacing: -2, lineHeight: 1 }}>
                        Find Your Perfect Home with <Text span c={primaryColor} inherit>{tenant.name}</Text>
                    </Title>
                    <Text size="xl" c="dimmed" mt="xl" fw={500}>
                        Expert property management and real estate services in Nairobi. Search by reference number or explore our premium collections.
                    </Text>
                </Box>

                {/* Search Bar - Center Stage */}
                <Paper p={8} radius="xl" withBorder shadow="xl" style={{ width: '100%', maxWidth: 700, backgroundColor: 'var(--mantine-color-body)' }}>
                    <Group gap={0}>
                        <TextInput 
                            placeholder="Search by Ref No or Keyword..." 
                            size="lg" 
                            variant="unstyled" 
                            px="xl" 
                            style={{ flex: 1 }}
                            leftSection={<IconSearch size={20} c="dimmed" />}
                        />
                        <Button color={primaryColor} size="lg" radius="xl" px="xl" rightSection={<IconArrowRight size={18} />}>
                            Search
                        </Button>
                    </Group>
                </Paper>

                {/* Featured Reviews in Hero */}
                <Box w="100%" mt={40}>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
                        <ReviewCard 
                            name="David Mwangi" 
                            text="Found my dream apartment in Westlands in just two days. The 360 tour helped me decide before visiting!"
                            rating={5}
                            avatar="https://i.pravatar.cc/150?u=david"
                        />
                        <ReviewCard 
                            name="Sarah Chen" 
                            text="Professional service and very transparent pricing. The reference number search made it so easy to follow up from Instagram."
                            rating={5}
                            avatar="https://i.pravatar.cc/150?u=sarah"
                        />
                        <ReviewCard 
                            name="John Kibet" 
                            text="The best property agency in Nairobi. Their attention to detail in property features is unmatched."
                            rating={5}
                            avatar="https://i.pravatar.cc/150?u=john"
                        />
                    </SimpleGrid>
                </Box>
            </Stack>
        </Container>
      </Box>

      {/* Find Your Home By Area */}
      <Box py={80} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Container size="xl">
            <Group justify="space-between" align="flex-end" mb={40}>
                <Box>
                    <Title order={2} size={rem(32)} fw={900}>Find Your Home By Area</Title>
                    <Text c="dimmed" size="lg" mt="xs">Explore properties in Nairobi's most sought-after neighborhoods.</Text>
                </Box>
                <Button variant="subtle" color={primaryColor} rightSection={<IconArrowRight size={18} />}>View All Areas</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                <AreaCard 
                    name="Karen" 
                    count={12} 
                    image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" 
                    primaryColor={primaryColor}
                />
                <AreaCard 
                    name="Westlands" 
                    count={8} 
                    image="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80" 
                    primaryColor={primaryColor}
                />
                <AreaCard 
                    name="Lavington" 
                    count={5} 
                    image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                    primaryColor={primaryColor}
                />
                <AreaCard 
                    name="Kilimani" 
                    count={15} 
                    image="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80" 
                    primaryColor={primaryColor}
                />
            </SimpleGrid>
        </Container>
      </Box>

      {/* Featured Listings Section */}
      <Box py={80} bg="var(--mantine-color-default-hover)">
        <Container size="xl">
            <Stack mb={60} gap="xs">
                <Group gap="sm" align="center">
                    <Box>
                        <Title order={2} style={{ letterSpacing: -1, fontSize: rem(36), fontWeight: 900 }}>Exclusive Property Collection</Title>
                        <Text size="lg" c="dimmed">Our hand-picked selection of the most premium real estate opportunities.</Text>
                    </Box>
                </Group>
            </Stack>

            {postsRes.docs.length > 0 ? (
            <StorefrontFactory posts={postsRes.docs} />
            ) : (
            <Center py={100}>
                <Paper 
                    p={60} 
                    radius="xl" 
                    withBorder 
                    ta="center" 
                    style={{ borderStyle: 'dashed', maxWidth: 500, backgroundColor: 'var(--mantine-color-body)' }}
                >
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray" mb="lg">
                        <IconSparkles size={32} />
                    </ThemeIcon>
                    <Title order={3} mb="sm">Coming Soon</Title>
                    <Text c="dimmed">This agency is currently preparing its catalog. Please check back later for updates.</Text>
                </Paper>
            </Center>
            )}
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" py={80} style={{ borderTop: '1px solid var(--mantine-color-default-border)', backgroundColor: 'var(--mantine-color-body)' }}>
        <Container size="xl" ta="center">
            <Group justify="center" gap="xs" mb="sm" opacity={0.5}>
                <IconRocket size={18} />
                <Text size="sm" fw={700} style={{ letterSpacing: 2 }}>SMM HUB</Text>
            </Group>
          <Text size="sm" c="dimmed">
            Powered by SMM HUB technology. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  )
}