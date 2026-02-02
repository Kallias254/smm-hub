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
import { TypebotWrapper } from './components/TypebotWrapper'
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

  // --- CONCIERGE HOMEPAGE ---
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      
      {/* 1. BACKGROUND VIDEO (Authority) */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/branded_demo_video.mp4" type="video/mp4" />
      </video>

      {/* 2. OVERLAY GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

      {/* 3. CONCIERGE CARD (The Guide) */}
      <div className="relative z-20 h-full flex items-center px-6 md:px-20">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
          
          {/* Card Header */}
          <div className="p-8 pb-4">
            <span 
               className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-white mb-4 uppercase"
               style={{ backgroundColor: primaryColor }}
            >
              VIP CONCIERGE
            </span>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              Welcome to {(tenant as any).name || 'Agency'}
            </h1>
            <p className="text-gray-300 font-light leading-relaxed">
              Don&apos;t waste time scrolling. Tell me your dream, and I&apos;ll find the keys.
            </p>
          </div>

          {/* Typebot Integration */}
          <div className="flex-1 w-full relative">
            <TypebotWrapper 
              agencyName={(tenant as any).name || 'Agency'}
              primaryColor={primaryColor}
            />
          </div>
        </div>
      </div>

      {/* 4. FLOATING ESCAPE HATCH (Top Right) */}
      <div className="absolute top-8 right-8 z-30 flex gap-4">
         <Link 
            href="/properties" 
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full hover:bg-white hover:text-black transition-all duration-300"
         >
            Browse Listings →
         </Link>
      </div>

      {/* 5. BRANDING (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-30 text-white/40 font-black text-6xl md:text-8xl select-none pointer-events-none uppercase tracking-tighter">
        {(tenant as any).name || 'Hub'}
      </div>

    </div>
  )
}