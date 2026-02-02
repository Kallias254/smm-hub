'use client'

import React, { useState, useEffect } from 'react'
import { Container, Title, Text, Stack, Group, Paper, ActionIcon, Button, Textarea, Center, Box, Transition, ThemeIcon, Loader } from '@mantine/core'
import { IconThumbUpFilled, IconThumbDownFilled, IconSend, IconBrandGoogle, IconCheck, IconAlertCircle } from '@tabler/icons-react'

export default function ReviewGatePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const [unwrappedParams, setParams] = useState<{ tenantSlug: string } | null>(null)
  const [step, setStep] = useState<'initial' | 'positive' | 'negative' | 'submitted' | 'loading'>('initial')
  const [feedback, setFeedback] = useState('')
  const [tenant, setTenant] = useState<any>(null)

  // 0. Unwrap params
  useEffect(() => {
    params.then(setParams)
  }, [params])

  // 1. Fetch Tenant details on load
  useEffect(() => {
    if (!unwrappedParams) return;
    const fetchTenant = async () => {
      const res = await fetch(`/api/tenants?where[slug][equals]=${unwrappedParams.tenantSlug}`)
      const data = await res.json()
      if (data.docs?.length > 0) {
        setTenant(data.docs[0])
      }
    }
    fetchTenant()
  }, [unwrappedParams])

  const saveReview = async (rating: 'positive' | 'negative', text?: string) => {
    if (!tenant) return

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenant.id,
          clientName: 'Web Client', // In real use, we'd pass a name via URL param ?name=John
          rating,
          feedback: text,
          status: rating === 'positive' ? 'google_redirect' : 'received',
        })
      })
    } catch (e) {
      console.error('Failed to save review', e)
    }
  }

  const handleRating = async (isPositive: boolean) => {
    setStep('loading')
    if (isPositive) {
      await saveReview('positive')
      setStep('positive')
    } else {
      setStep('negative')
    }
  }

  const submitFeedback = async () => {
    setStep('loading')
    await saveReview('negative', feedback)
    setStep('submitted')
  }

  if (!tenant) return <Center h="100vh"><Loader size="xl" /></Center>

  return (
    <Box mih="100vh" bg="gray.0" py={100}>
      <Container size="xs">
        <Paper p={40} radius="xl" shadow="xl" withBorder>
          <Stack align="center" gap="xl">
            
            {step === 'loading' && <Loader size="xl" />}

            {step === 'initial' && (
              <>
                <Title order={2} ta="center" fw={900} style={{ letterSpacing: -1 }}>
                  How was your experience with {tenant.name}?
                </Title>
                <Text c="dimmed" ta="center" size="lg">
                  Your feedback helps us provide the best service in the industry.
                </Text>
                
                <Group gap="xl" mt="xl">
                  <Stack align="center">
                    <ActionIcon 
                      variant="light" 
                      color="green" 
                      size={120} 
                      radius={100} 
                      onClick={() => handleRating(true)}
                      className="hover-lift"
                    >
                      <IconThumbUpFilled size={60} />
                    </ActionIcon>
                    <Text fw={700} c="green">GREAT</Text>
                  </Stack>

                  <Stack align="center">
                    <ActionIcon 
                      variant="light" 
                      color="red" 
                      size={120} 
                      radius={100}
                      onClick={() => handleRating(false)}
                      className="hover-lift"
                    >
                      <IconThumbDownFilled size={60} />
                    </ActionIcon>
                    <Text fw={700} c="red">COULD BE BETTER</Text>
                  </Stack>
                </Group>
              </>
            )}

            {step === 'positive' && (
              <Stack align="center" gap="lg" ta="center">
                <Title order={2} fw={900}>You&apos;re the best! 🌟</Title>
                <Text size="lg">
                  We are so glad you had a great experience. Would you mind sharing your 5-star review on Google? It takes less than 30 seconds.
                </Text>
                <Button 
                  size="xl" 
                  radius="md" 
                  color="blue" 
                  leftSection={<IconBrandGoogle size={24} />}
                  fullWidth
                  component="a"
                  href={tenant.integrations?.googleReviewLink || `https://www.google.com/search?q=${encodeURIComponent(tenant.name)}+reviews`}
                  target="_blank"
                >
                  Write Review on Google
                </Button>
                <Button variant="subtle" color="gray" onClick={() => setStep('initial')}>
                  Go Back
                </Button>
              </Stack>
            )}

            {step === 'negative' && (
              <Stack w="100%" gap="lg">
                <Title order={2} ta="center" fw={900}>We want to make it right.</Title>
                <Text c="dimmed" ta="center">
                  Tell us what went wrong. Your message goes directly to our management team.
                </Text>
                <Textarea 
                  placeholder="Share your feedback privately..." 
                  minRows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.currentTarget.value)}
                  radius="md"
                />
                <Button 
                  size="lg" 
                  radius="md" 
                  color="black" 
                  rightSection={<IconSend size={20} />}
                  onClick={submitFeedback}
                >
                  Send Private Feedback
                </Button>
              </Stack>
            )}

            {step === 'submitted' && (
              <Stack align="center" gap="md" ta="center" py={40}>
                <ThemeIcon color="green" size={80} radius={100}>
                  <IconCheck size={40} />
                </ThemeIcon>
                <Title order={2} fw={900}>Thank You.</Title>
                <Text size="lg" c="dimmed">
                  We have received your feedback and our team will be in touch shortly to resolve any issues.
                </Text>
              </Stack>
            )}

          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
