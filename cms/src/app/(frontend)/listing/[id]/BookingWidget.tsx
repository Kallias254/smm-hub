'use client'

import React, { useState } from 'react'
import { Paper, Title, Stack, SegmentedControl, SimpleGrid, Button, Text, Modal, TextInput, Group, ThemeIcon, Box } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconCalendar, IconDeviceMobile, IconCheck, IconClock } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

interface BookingWidgetProps {
    postId: string
    tenantId: string
    propertyTitle: string
}

export function BookingWidget({ postId, tenantId, propertyTitle }: BookingWidgetProps) {
    const [opened, setOpened] = useState(false)
    const [step, setStep] = useState(1) // 1: Info, 2: Verification, 3: Success
    const [date, setDate] = useState<Date | null>(null)
    const [time, setTime] = useState('11:00 AM')
    const [method, setMethod] = useState('in-person')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRequestBooking = () => {
        if (!date) {
            notifications.show({
                title: 'Error',
                message: 'Please select a date first',
                color: 'red'
            })
            return
        }
        setOpened(true)
        setStep(1)
    }

    const handleSendOTP = async () => {
        if (!phone || phone.length < 9) {
            notifications.show({
                title: 'Error',
                message: 'Please enter a valid phone number',
                color: 'red'
            })
            return
        }
        setLoading(true)
        // Simulate API call to send OTP
        setTimeout(() => {
            setLoading(false)
            setStep(2)
            notifications.show({
                title: 'OTP Sent',
                message: 'A 4-digit code has been sent to your phone (Mock: 1234)',
                color: 'blue'
            })
        }, 1000)
    }

    const handleVerify = async () => {
        if (otp !== '1234') {
            notifications.show({
                title: 'Error',
                message: 'Invalid verification code. Try 1234',
                color: 'red'
            })
            return
        }
        setLoading(true)
        
        try {
            // In a real app, this would be a Payload API call
            // const res = await fetch('/api/leads', { ... })
            
            console.log('Creating Lead:', {
                type: 'booking',
                phone,
                tenant: tenantId,
                post: postId,
                bookingDetails: {
                    date,
                    slot: time,
                    method
                }
            })

            setTimeout(() => {
                setLoading(false)
                setStep(3)
            }, 1000)
        } catch (error) {
            setLoading(false)
            notifications.show({
                title: 'Error',
                message: 'Something went wrong. Please try again.',
                color: 'red'
            })
        }
    }

    return (
        <>
            <Paper p="lg" radius="md" withBorder shadow="md" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
                <Title order={4} mb="md" fw={800} size="h4">Schedule a Tour</Title>
                <Stack gap="md">
                    <SegmentedControl
                        fullWidth
                        value={method}
                        onChange={setMethod}
                        data={[
                            { label: 'In-Person', value: 'in-person' },
                            { label: 'Video Chat', value: 'video' },
                        ]}
                    />
                    
                    <DatePickerInput
                        leftSection={<IconCalendar size={18} stroke={1.5} />}
                        placeholder="Select a Date"
                        size="md"
                        value={date}
                        onChange={setDate}
                    />
                    
                    <SimpleGrid cols={3}>
                        {['10:00 AM', '11:00 AM', '02:00 PM'].map((t) => (
                            <Button 
                                key={t}
                                variant={time === t ? 'filled' : 'light'} 
                                color="blue" 
                                size="xs"
                                onClick={() => setTime(t)}
                            >
                                {t}
                            </Button>
                        ))}
                    </SimpleGrid>

                    <Button fullWidth color="blue" size="lg" mt="xs" onClick={handleRequestBooking}>
                        Request Booking
                    </Button>
                    
                    <Text size="xs" c="dimmed" ta="center">No credit card required. Free cancellation.</Text>
                </Stack>
            </Paper>

            <Modal 
                opened={opened} 
                onClose={() => !loading && setOpened(false)} 
                title={<Text fw={800}>{step === 3 ? 'Confirmed!' : 'Verify Your Identity'}</Text>}
                centered
                radius="md"
                padding="xl"
            >
                {step === 1 && (
                    <Stack>
                        <Text size="sm" c="dimmed">
                            You are requesting a <b>{method}</b> tour for <b>{propertyTitle}</b> on <b>{date?.toLocaleDateString?.() || 'selected date'}</b> at <b>{time}</b>.
                        </Text>
                        <TextInput 
                            label="Phone Number" 
                            placeholder="e.g. 0712 345 678" 
                            required 
                            size="md"
                            leftSection={<IconDeviceMobile size={18} />}
                            value={phone}
                            onChange={(e) => setPhone(e.currentTarget.value)}
                        />
                        <Button fullWidth size="lg" onClick={handleSendOTP} loading={loading}>
                            Verify & Continue
                        </Button>
                    </Stack>
                )}

                {step === 2 && (
                    <Stack>
                        <Box ta="center">
                            <Text size="sm" c="dimmed" mb="md">
                                Enter the 4-digit code sent to <b>{phone}</b>
                            </Text>
                            <TextInput 
                                placeholder="0 0 0 0" 
                                size="xl"
                                ta="center"
                                style={{ input: { textAlign: 'center', letterSpacing: '10px', fontSize: '24px', fontWeight: 900 } }}
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.currentTarget.value)}
                            />
                        </Box>
                        <Button fullWidth size="lg" onClick={handleVerify} loading={loading}>
                            Confirm Booking
                        </Button>
                        <Button variant="subtle" size="xs" onClick={() => setStep(1)}>
                            Change Phone Number
                        </Button>
                    </Stack>
                )}

                {step === 3 && (
                    <Stack align="center" py="xl">
                        <ThemeIcon size={80} radius={100} color="green" variant="light">
                            <IconCheck size={40} stroke={3} />
                        </ThemeIcon>
                        <Title order={3} fw={900}>Booking Requested!</Title>
                        <Text ta="center" c="dimmed" size="sm">
                            The agent has been notified of your request for <b>{date?.toLocaleDateString?.() || 'selected date'}</b> at <b>{time}</b>. They will contact you shortly to finalize.
                        </Text>
                        <Button fullWidth size="md" variant="light" onClick={() => setOpened(false)}>
                            Close
                        </Button>
                    </Stack>
                )}
            </Modal>
        </>
    )
}
