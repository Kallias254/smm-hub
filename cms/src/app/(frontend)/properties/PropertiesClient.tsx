'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Container, Title, Text, Group, Button, Stack, Box, SimpleGrid, Select, RangeSlider, TextInput, SegmentedControl, ActionIcon, Collapse, Paper, Divider, rem, Badge, Center, ThemeIcon, NumberInput, MultiSelect, Popover, ScrollArea, Checkbox, Grid } from '@mantine/core'
import { IconSearch, IconFilter, IconLayoutGrid, IconList, IconChevronDown, IconChevronUp, IconX, IconArrowLeft, IconHome, IconBed, IconCoin, IconMapPin, IconMap2 } from '@tabler/icons-react'
import { RealEstateCard } from '../storefront/components/RealEstateCard'
import { RealEstateListRow } from './RealEstateListRow'
import { MapSplitView } from '../storefront/components/MapSplitView'
import Link from 'next/link'

export function PropertiesClient({ initialPosts, primaryColor, tenantName }: { initialPosts: any[]; primaryColor: string; tenantName: string }) {
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter States
  const [search, setSearch] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [propertyStatus, setPropertyStatus] = useState<string | null>(null)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [propertyCategory, setPropertyCategory] = useState<string | null>(null)
  const [beds, setBeds] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000])

  // Auto-switch to Map view when an area is selected
  useEffect(() => {
    if (selectedAreas.length > 0) {
      setView('map');
    } else if (view === 'map' && selectedAreas.length === 0) {
      setView('grid'); // Revert to grid if areas are cleared
    }
  }, [selectedAreas]);

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
  }

  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const data = post.content?.[0]?.data || {}
      
      // Search filter (Keyword / ID) - if search has value
      if (search) {
        const lowerSearch = search.toLowerCase()
        const idMatch = post.id.toString().includes(lowerSearch)
        const titleMatch = post.title.toLowerCase().includes(lowerSearch)
        
        if (!idMatch && !titleMatch) {
            return false
        }
      }

      // Area Multi-filter
      if (selectedAreas.length > 0) {
          const postLocation = (data.location || '').toLowerCase()
          const areaMatch = selectedAreas.some(area => postLocation.includes(area.toLowerCase()))
          if (!areaMatch) return false
      }

      // Status filter (Rent/Sale)
      if (propertyStatus && !data.propertyStatus?.toLowerCase().includes(propertyStatus.toLowerCase())) {
        return false
      }

      // Type Multi-filter (Apartment/Villa/etc)
      if (propertyTypes.length > 0 && !propertyTypes.includes(data.propertyType)) {
        return false
      }

      // Category filter (Residential/Commercial)
      if (propertyCategory && data.propertyCategory !== propertyCategory) {
        return false
      }

      // Beds filter
      if (beds) {
        const bedMatch = data.features?.match(/(\d+)\s*Bed/)
        if (bedMatch && bedMatch[1] !== beds) return false
      }

      // Price filter
      const numericPrice = parsePrice(data.price)
      if (numericPrice < priceRange[0] || numericPrice > priceRange[1]) {
        return false
      }

      return true
    })
  }, [initialPosts, search, selectedAreas, propertyStatus, propertyTypes, propertyCategory, beds, priceRange])

  const resetFilters = () => {
    setSearch('')
    setSelectedAreas([])
    setPropertyStatus(null)
    setPropertyTypes([])
    setPropertyCategory(null)
    setBeds(null)
    setPriceRange([0, 100000000])
  }

  const SearchBar = (
     <Box>
        <Grid gutter="xs" align="center">
            {/* 1. Keyword/Ref Search */}
            <Grid.Col span={{ base: 12, sm: 6, lg: 2.5 }}>
                <TextInput 
                    placeholder="Keyword or Ref No." 
                    leftSection={<IconSearch size={16} c="dimmed" />}
                    size="md"
                    variant="default"
                    radius="md"
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                />
            </Grid.Col>

            {/* 2. Area Popover Checklist */}
            <Grid.Col span={{ base: 12, sm: 6, lg: 2 }}>
                <Popover width={300} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                        <Button 
                            variant="default" 
                            size="md" 
                            radius="md" 
                            fullWidth 
                            justify="flex-start"
                            leftSection={<IconMapPin size={16} c="dimmed" />}
                            styles={{ 
                                root: { color: 'var(--mantine-color-text)', fontWeight: 400 },
                                label: { overflow: 'hidden', textOverflow: 'ellipsis' }
                            }}
                        >
                            {selectedAreas.length > 0 ? selectedAreas.join(', ') : 'Select Areas'}
                        </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <ScrollArea h={200}>
                            <Stack gap="xs">
                                {['Karen', 'Westlands', 'Kilimani', 'Lavington', 'Runda', 'Muthaiga', 'Langata', 'Kileleshwa'].map(area => (
                                    <Checkbox 
                                        key={area}
                                        label={area}
                                        checked={selectedAreas.includes(area)}
                                        onChange={(event) => {
                                            if (event.currentTarget.checked) {
                                                setSelectedAreas([...selectedAreas, area])
                                            } else {
                                                setSelectedAreas(selectedAreas.filter(a => a !== area))
                                            }
                                        }}
                                    />
                                ))}
                            </Stack>
                        </ScrollArea>
                    </Popover.Dropdown>
                </Popover>
            </Grid.Col>

            {/* 3. Bedrooms Select */}
            <Grid.Col span={{ base: 6, sm: 3, lg: 1.5 }}>
                <Select 
                    placeholder="Beds"
                    data={['1', '2', '3', '4', '5']}
                    value={beds}
                    onChange={setBeds}
                    size="md"
                    variant="default"
                    radius="md"
                    leftSection={<IconBed size={16} c="dimmed" />}
                    clearable
                />
            </Grid.Col>

            {/* 4. Max Price Input */}
            <Grid.Col span={{ base: 6, sm: 3, lg: 1.5 }}>
                <NumberInput
                    placeholder="Max Price"
                    value={priceRange[1] >= 100000000 ? '' : priceRange[1]}
                    onChange={(val) => setPriceRange([priceRange[0], val === '' ? 100000000 : Number(val)])}
                    thousandSeparator=","
                    prefix="KES "
                    size="md"
                    variant="default"
                    radius="md"
                    leftSection={<IconCoin size={16} c="dimmed" />}
                    hideControls
                />
            </Grid.Col>

            {/* 5. Status Select */}
            <Grid.Col span={{ base: 6, sm: 3, lg: 1.5 }}>
                <Select 
                    placeholder="Status"
                    data={['For Rent', 'For Sale']}
                    value={propertyStatus}
                    onChange={setPropertyStatus}
                    size="md"
                    variant="default"
                    radius="md"
                    leftSection={<IconList size={16} c="dimmed" />}
                    clearable
                />
            </Grid.Col>

            {/* 6. Action Group */}
            <Grid.Col span={{ base: 12, lg: 3 }}>
                <Group gap="xs" grow>
                    <Button 
                        variant={showFilters ? 'filled' : 'light'} 
                        color="gray" 
                        onClick={() => setShowFilters(!showFilters)}
                        size="md"
                        radius="md"
                        title="Advanced Filters"
                        leftSection={<IconFilter size={18} />}
                    >
                        Filters
                    </Button>
                    <Button 
                        color={primaryColor} 
                        size="md" 
                        radius="md"
                        onClick={() => {}}
                        leftSection={<IconSearch size={18} />}
                    >
                        Search
                    </Button>
                </Group>
            </Grid.Col>
        </Grid>
        <Collapse in={showFilters}>
            <Divider my="xl" label="Advanced Options" labelPosition="center" color="var(--mantine-color-default-border)" />
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" px="xs">
                <MultiSelect 
                    label="Property Types"
                    placeholder="Apartment, Villa, etc."
                    data={['Apartment', 'Villa', 'Townhouse', 'Land', 'Commercial', 'Mansion', 'Studio']}
                    value={propertyTypes}
                    onChange={setPropertyTypes}
                    variant="default"
                    leftSection={<IconHome size={16} />}
                    hidePickedOptions
                />
                <Select 
                    label="Listing Category"
                    placeholder="Residential, Commercial..."
                    data={['Residential', 'Commercial', 'Industrial']}
                    value={propertyCategory}
                    onChange={setPropertyCategory}
                    clearable
                    variant="default"
                />
                <Box pt={25}>
                    <Button variant="light" color="red" fullWidth size="md" onClick={resetFilters}>Clear All Filters</Button>
                </Box>
            </SimpleGrid>
        </Collapse>
    </Box>
  )

  const StickyHeader = (
      <Paper 
          shadow="sm" 
          p="md" 
          radius={0}
          style={{ 
              position: 'sticky', 
              top: '60px', // Height of the main StorefrontHeader
              zIndex: 50,
              backgroundColor: 'var(--mantine-color-body)',
              borderBottom: '1px solid var(--mantine-color-default-border)',
          }}
      >
          <Container fluid={view === 'map'} size="xl">
            <Stack gap="xs" mb={view !== 'map' ? 'md' : 0}>
                {view !== 'map' && (
                    <>
                        <Title order={1} size={rem(42)} fw={900} style={{ letterSpacing: -1 }}>
                            Explore Properties
                        </Title>
                        <Text size="lg" style={{ opacity: 0.8 }}>Discover exclusive real estate opportunities managed by {tenantName}.</Text>
                    </>
                )}
                {SearchBar}
            </Stack>
          </Container>
      </Paper>
  )

  return (
    <Box>
        {StickyHeader}
        {view === 'map' ? (
            <MapSplitView posts={filteredPosts} />
        ) : (
            <Container size="xl" py={40}>
                 <Group justify="space-between" mb="xl" align="center">
                    <Group gap="sm">
                        <Text fw={700} size="lg">Showing {filteredPosts.length} Results</Text>
                        {filteredPosts.length > 0 && (
                            <Badge variant="light" color={primaryColor}>{propertyStatus || 'All Status'}</Badge>
                        )}
                    </Group>
                    <SegmentedControl 
                        value={view}
                        onChange={(v: any) => {
                            if (v === 'map' && selectedAreas.length === 0) return;
                            setView(v);
                        }}
                        data={[
                            { label: <Center><IconLayoutGrid size={16} /></Center>, value: 'grid' },
                            { label: <Center><IconList size={16} /></Center>, value: 'list' },
                            { label: <Center><IconMap2 size={16} /></Center>, value: 'map', disabled: selectedAreas.length === 0 },
                        ]}
                        radius="md"
                        size="xs"
                    />
                </Group>

                {/* Results List/Grid */}
                {filteredPosts.length > 0 ? (
                    view === 'grid' ? (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg" verticalSpacing="xl">
                            {filteredPosts.map(post => <RealEstateCard key={post.id} post={post} />)}
                        </SimpleGrid>
                    ) : (
                        <Stack gap="lg">
                            {filteredPosts.map(post => <RealEstateListRow key={post.id} post={post} />)}
                        </Stack>
                    )
                ) : (
                    <Center py={100}>
                        <Stack align="center" gap="md">
                            <ThemeIcon size={80} radius="xl" variant="light" color="gray">
                                <IconX size={40} />
                            </ThemeIcon>
                            <Title order={3}>No Properties Found</Title>
                            <Text c="dimmed">Try adjusting your filters or search keywords.</Text>
                            <Button variant="subtle" onClick={resetFilters}>Clear All Filters</Button>
                        </Stack>
                    </Center>
                )}
            </Container>
        )}
    </Box>
  )
}
