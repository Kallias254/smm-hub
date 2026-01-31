'use client'

import React, { useState } from 'react'
import { Paper, Group, TextInput, Button, ActionIcon, Box, Text, rem } from '@mantine/core'
import { IconSearch, IconArrowRight, IconMapPin } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

const SUGGESTIONS = ['Karen', 'Westlands', 'Kilimani', 'Lavington', 'Runda']

export function SmartSearch({ primaryColor }: { primaryColor: string }) {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowFilters] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (!value) return
    router.push(`/properties?search=${encodeURIComponent(value)}`)
  }

  const filteredSuggestions = SUGGESTIONS.filter(s => 
    s.toLowerCase().includes(value.toLowerCase()) && value.length > 0 && s.toLowerCase() !== value.toLowerCase()
  )

  return (
    <Box style={{ width: '100%', maxWidth: 700, position: 'relative' }}>
        <Paper p={8} radius="xl" withBorder shadow="xl" style={{ backgroundColor: 'var(--mantine-color-body)', position: 'relative', zIndex: 20 }}>
            <Group gap={0}>
                <TextInput 
                    placeholder="Search by Ref No, Area or Keyword..." 
                    size="lg" 
                    variant="unstyled" 
                    px="xl" 
                    style={{ flex: 1 }}
                    value={value}
                    onChange={(e) => setValue(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    leftSection={<IconSearch size={20} c="dimmed" />}
                />
                <Button 
                    color={primaryColor} 
                    size="lg" 
                    radius="xl" 
                    px="xl" 
                    onClick={handleSearch}
                    rightSection={<IconArrowRight size={18} />}
                >
                    Search
                </Button>
            </Group>
        </Paper>

        {filteredSuggestions.length > 0 && (
            <Paper 
                pos="absolute" 
                top="100%" 
                left={20} 
                right={20} 
                mt="xs" 
                shadow="md" 
                withBorder 
                radius="md" 
                p={4}
                style={{ zIndex: 10, backgroundColor: 'var(--mantine-color-body)' }}
            >
                {filteredSuggestions.map(s => (
                    <Group 
                        key={s} 
                        px="md" 
                        py="sm" 
                        style={{ cursor: 'pointer', borderRadius: rem(4) }}
                        className="hover-light"
                        onClick={() => {
                            setValue(s)
                            router.push(`/properties?search=${s}`)
                        }}
                    >
                        <IconMapPin size={16} c="dimmed" />
                        <Text size="sm" fw={600}>{s}</Text>
                    </Group>
                ))}
            </Paper>
        )}
    </Box>
  )
}
