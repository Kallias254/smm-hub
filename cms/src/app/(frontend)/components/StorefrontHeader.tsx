'use client'

import React from 'react'
import Link from 'next/link'
import {
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  Stack,
  SimpleGrid,
  ThemeIcon,
  Anchor,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  useMantineTheme,
  Container,
  ActionIcon,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconNotification,
  IconCode,
  IconBook,
  IconChartPie3,
  IconFingerprint,
  IconCoin,
  IconChevronDown,
  IconRocket,
  IconSearch,
  IconHeart,
  IconHome,
  IconBuildingStore,
  IconBuildingSkyscraper,
  IconMap2,
  IconPhoneCall,
} from '@tabler/icons-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import classes from './StorefrontHeader.module.css'

// Mock Data for "Buy" Menu
const buyLinks = [
  { icon: IconHome, title: 'Houses', description: 'Villas, Townhouses, and Mansions' },
  { icon: IconBuildingSkyscraper, title: 'Apartments', description: 'Modern flats and penthouses' },
  { icon: IconMap2, title: 'Land', description: 'Plots and development sites' },
]

// Mock Data for "Rent" Menu
const rentLinks = [
  { icon: IconBuildingStore, title: 'Commercial', description: 'Offices and retail spaces' },
  { icon: IconHome, title: 'Residential', description: 'Long-term home rentals' },
  { icon: IconCoin, title: 'Short Stays', description: 'Furnished apartments for short visits' },
]

interface StorefrontHeaderProps {
  tenant: {
    name: string
    branding?: {
      logo?: { url: string }
      primaryColor?: string
    }
  }
}

export function StorefrontHeader({ tenant }: StorefrontHeaderProps) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false)
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false)
  const theme = useMantineTheme()
  const primaryColor = tenant.branding?.primaryColor || 'blue'

  const links = buyLinks.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title} component={Link} href={`/properties?type=${item.title}`}>
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="light" radius="md" color={primaryColor}>
          <item.icon style={{ width: rem(22), height: rem(22), opacity: 0.7 }} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ))

  return (
    <>
      <header className={classes.header}>
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%" wrap="nowrap">
            
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Group gap="md" wrap="nowrap">
                    {tenant.branding?.logo?.url ? (
                        <img src={tenant.branding.logo.url} style={{ height: 35, width: 'auto' }} alt={tenant.name} />
                    ) : (
                        <ThemeIcon size="lg" radius="md" color={primaryColor} variant="filled">
                            <IconRocket size={20} />
                        </ThemeIcon>
                    )}
                    <Text fw={900} size="lg" style={{ letterSpacing: -1, whiteSpace: 'nowrap' }}>{tenant.name}</Text>
                </Group>
            </Link>

            {/* Desktop Navigation */}
            <Group h="100%" gap={5} visibleFrom="md">
              <Link href="/" className={classes.link}>
                Home
              </Link>
              
              <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
                <HoverCard.Target>
                  <Link href="#" className={classes.link}>
                    <Center inline>
                      <Box component="span" mr={5}>
                        Buy
                      </Box>
                      <IconChevronDown style={{ width: rem(16), height: rem(16), opacity: 0.5 }} />
                    </Center>
                  </Link>
                </HoverCard.Target>

                <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                  <Group justify="space-between" px="md">
                    <Text fw={500}>Property Types</Text>
                    <Anchor href="/properties?status=For Sale" fz="xs">
                      View all
                    </Anchor>
                  </Group>

                  <Divider my="sm" />

                  <SimpleGrid cols={2} spacing={0}>
                    {links}
                  </SimpleGrid>

                  <div className={classes.dropdownFooter}>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500} fz="sm">
                          New Listings?
                        </Text>
                        <Text size="xs" c="dimmed">
                          Check out the latest additions
                        </Text>
                      </div>
                      <Button variant="default" component={Link} href="/properties?sort=-createdAt">Get started</Button>
                    </Group>
                  </div>
                </HoverCard.Dropdown>
              </HoverCard>

              <Link href="/properties?status=For Rent" className={classes.link}>
                Rent
              </Link>
              
              <Link href="/properties?category=Commercial" className={classes.link}>
                Commercial
              </Link>
            </Group>

            {/* Desktop & Tablet Actions */}
            <Group gap="lg" wrap="nowrap">
                {/* Phone Text (Chameleon: hides on small mobile, shows on tablet+) */}
                <Group gap="xs" visibleFrom="xs" wrap="nowrap">
                    <ThemeIcon variant="transparent" color="dimmed" size="sm">
                        <IconPhoneCall size={18} stroke={1.5} />
                    </ThemeIcon>
                    <Text fw={700} size="sm" style={{ letterSpacing: 0.5 }}>
                        +254 700 000 000
                    </Text>
                </Group>

                <Group gap="xs" visibleFrom="sm" wrap="nowrap">
                    <ActionIcon variant="default" size="lg" radius="md"><IconSearch size={18} /></ActionIcon>
                    <ThemeToggle />
                </Group>

                {/* Mobile Burger */}
                <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="md" size="sm" />
            </Group>
          </Group>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={<Text fw={900}>{tenant.name}</Text>}
        hiddenFrom="md"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <Link href="/" className={classes.link} onClick={closeDrawer}>
            Home
          </Link>
          
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Buy
              </Box>
              <IconChevronDown style={{ width: rem(16), height: rem(16), opacity: 0.5 }} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>
            <Box px="md">
                {links}
            </Box>
          </Collapse>

          <Link href="/properties?status=For Rent" className={classes.link} onClick={closeDrawer}>
            Rent
          </Link>
          <Link href="/properties?category=Commercial" className={classes.link} onClick={closeDrawer}>
            Commercial
          </Link>

          <Divider my="sm" />

          <Stack p="md" gap="xl">
            <Group justify="space-between">
                <Text fw={700} size="sm">Contact Us</Text>
                <Text fw={800} color={primaryColor}>+254 700 000 000</Text>
            </Group>
            
            <Group grow>
                <Button variant="default" component={Link} href="/admin" onClick={closeDrawer}>Agent Portal</Button>
                <ThemeToggle />
            </Group>
          </Stack>
        </ScrollArea>
      </Drawer>
    </>
  )
}
