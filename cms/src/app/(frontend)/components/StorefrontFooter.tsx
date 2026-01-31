'use client'

import React from 'react'
import Link from 'next/link'
import { Container, Group, ActionIcon, Title, Text, Stack, Input, Button, Grid, Box, Divider, ThemeIcon, rem } from '@mantine/core'
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconRocket, IconBrandFacebook, IconBrandLinkedin, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react'

interface StorefrontFooterProps {
  tenant: {
    name: string
    branding?: {
      logo?: { url: string }
      primaryColor?: string
    }
  }
}

export function StorefrontFooter({ tenant }: StorefrontFooterProps) {
  const primaryColor = tenant.branding?.primaryColor || 'blue'

  const socialIcons = [
    { icon: IconBrandTwitter, href: '#' },
    { icon: IconBrandYoutube, href: '#' },
    { icon: IconBrandInstagram, href: '#' },
    { icon: IconBrandLinkedin, href: '#' },
  ]

  return (
    <Box component="footer" style={{ borderTop: '1px solid var(--mantine-color-default-border)', backgroundColor: 'var(--mantine-color-body)' }}>
      <Container size="xl" py={60}>
        <Grid gutter={50}>
            
            {/* Column 1: Brand & Mission */}
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="lg">
                    <Group gap="md">
                        {tenant.branding?.logo?.url ? (
                            <img src={tenant.branding.logo.url} style={{ height: 32, width: 'auto' }} alt={tenant.name} />
                        ) : (
                            <ThemeIcon size="lg" radius="md" color={primaryColor} variant="light">
                                <IconRocket size={20} />
                            </ThemeIcon>
                        )}
                        <Title order={3} size="h4" fw={800} style={{ letterSpacing: -0.5 }}>{tenant.name}</Title>
                    </Group>
                    <Text size="sm" c="dimmed" lh={1.6} maw={350}>
                        Your trusted partner in finding the perfect property. We specialize in luxury homes, commercial spaces, and investment opportunities across the region.
                    </Text>
                    <Group gap="xs">
                        {socialIcons.map((item, index) => (
                            <ActionIcon key={index} size="lg" color="gray" variant="subtle" component="a" href={item.href}>
                                <item.icon style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                            </ActionIcon>
                        ))}
                    </Group>
                </Stack>
            </Grid.Col>

            {/* Column 2: Discover */}
            <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
                <Text size="sm" fw={700} tt="uppercase" mb="md" style={{ letterSpacing: 1 }}>Discover</Text>
                <Stack gap="sm">
                    <Link href="/properties?status=For Sale" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">Homes for Sale</Text>
                    </Link>
                    <Link href="/properties?status=For Rent" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">Apartments for Rent</Text>
                    </Link>
                    <Link href="/properties?category=Commercial" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">Commercial Real Estate</Text>
                    </Link>
                    <Link href="/properties?type=Land" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">Land & Plots</Text>
                    </Link>
                    <Link href="/properties?sort=-createdAt" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">New Listings</Text>
                    </Link>
                </Stack>
            </Grid.Col>

            {/* Column 3: Company */}
            <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
                <Text size="sm" fw={700} tt="uppercase" mb="md" style={{ letterSpacing: 1 }}>Company</Text>
                <Stack gap="sm">
                    <Link href="#" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">About Us</Text>
                    </Link>
                    <Link href="#" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">Our Agents</Text>
                    </Link>
                    <Link href="#" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">Careers</Text>
                    </Link>
                    <Link href="#" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">Contact Support</Text>
                    </Link>
                    <Link href="#" style={{ textDecoration: 'none' }}>
                        <Text size="sm" c="dimmed" className="hover-text">List Your Property</Text>
                    </Link>
                </Stack>
            </Grid.Col>

            {/* Column 4: Newsletter */}
            <Grid.Col span={{ base: 12, sm: 4, md: 4 }}>
                <Text size="sm" fw={700} tt="uppercase" mb="md" style={{ letterSpacing: 1 }}>Stay Updated</Text>
                <Stack gap="md">
                    <Text size="sm" c="dimmed" lh={1.4}>
                        Subscribe to get the latest property listings and market insights delivered to your inbox.
                    </Text>
                    <Group gap={0} align="stretch" wrap="nowrap">
                        <Input 
                            placeholder="Your email address" 
                            style={{ flex: 1 }} 
                            styles={{ input: { borderTopRightRadius: 0, borderBottomRightRadius: 0 } }}
                        />
                        <Button color={primaryColor} style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                            Subscribe
                        </Button>
                    </Group>
                    <Group gap="md" mt="xs">
                        <Group gap="xs" c="dimmed">
                            <IconPhone size={16} />
                            <Text size="xs">+254 700 000 000</Text>
                        </Group>
                        <Group gap="xs" c="dimmed">
                            <IconMail size={16} />
                            <Text size="xs">hello@{tenant.name.toLowerCase().replace(/\s+/g, '')}.com</Text>
                        </Group>
                    </Group>
                </Stack>
            </Grid.Col>

        </Grid>
      </Container>

      <Divider color="var(--mantine-color-default-border)" />

      <Container size="xl" py="md">
        <Group justify="space-between" align="center">
            <Text c="dimmed" size="xs">
                © {new Date().getFullYear()} {tenant.name}. All rights reserved.
            </Text>
            
            <Group gap="lg">
                <Link href="#" style={{ textDecoration: 'none' }}>
                    <Text size="xs" c="dimmed" className="hover-text">Privacy Policy</Text>
                </Link>
                <Link href="#" style={{ textDecoration: 'none' }}>
                    <Text size="xs" c="dimmed" className="hover-text">Terms of Service</Text>
                </Link>
                <Link href="#" style={{ textDecoration: 'none' }}>
                    <Text size="xs" c="dimmed" className="hover-text">Cookie Settings</Text>
                </Link>
                <Group gap={4} opacity={0.5}>
                     <IconRocket size={14} />
                     <Text size="xs" fw={700} style={{ letterSpacing: 1 }}>SMM HUB</Text>
                </Group>
            </Group>
        </Group>
      </Container>
      
      <style jsx global>{`
        .hover-text:hover {
            color: var(--mantine-color-text) !important;
            text-decoration: underline;
        }
      `}</style>
    </Box>
  )
}
