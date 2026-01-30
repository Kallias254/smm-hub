'use client'

import React, { useState, useEffect } from 'react'
import { Paper, Title, Stack, NumberInput, Text, Group, Box, rem, Divider } from '@mantine/core'
import { IconCalculator } from '@tabler/icons-react'

export const MortgageCalculator = ({ initialAmount }: { initialAmount?: string | number }) => {
  // Parse numeric amount from string like "KES 8,500,000"
  const parseAmount = (val: string | number | undefined) => {
    if (typeof val === 'number') return val
    if (!val) return 0
    return parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0
  }

  const [totalAmount, setTotalAmount] = useState<number>(parseAmount(initialAmount))
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20)
  const [interestRate, setInterestRate] = useState<number>(13)
  const [loanTerms, setLoanTerms] = useState<number>(20)
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)

  useEffect(() => {
    const P = totalAmount - (totalAmount * (downPaymentPercent / 100))
    const r = (interestRate / 100) / 12
    const n = loanTerms * 12

    if (r === 0) {
      setMonthlyPayment(P / n)
    } else {
      const payment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      setMonthlyPayment(isNaN(payment) ? 0 : payment)
    }
  }, [totalAmount, downPaymentPercent, interestRate, loanTerms])

  return (
    <Paper p="lg" radius="md" withBorder shadow="md" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
      <Group gap="xs" mb="md">
        <IconCalculator size={22} color="var(--mantine-color-blue-7)" />
        <Title order={4} fw={800} size="h4">Mortgage Calculator</Title>
      </Group>

      <Stack gap="md">
        <NumberInput
          label="Total Amount"
          placeholder="Property Price"
          value={totalAmount}
          onChange={(val) => setTotalAmount(Number(val))}
          thousandSeparator=","
          prefix="KES "
          size="sm"
        />

        <NumberInput
          label="Down Payment (%)"
          placeholder="20"
          value={downPaymentPercent}
          onChange={(val) => setDownPaymentPercent(Number(val))}
          max={100}
          min={0}
          size="sm"
        />

        <Group grow gap="sm">
          <NumberInput
            label="Interest Rate (%)"
            placeholder="13"
            value={interestRate}
            onChange={(val) => setInterestRate(Number(val))}
            min={0}
            size="sm"
          />
          <NumberInput
            label="Terms (Years)"
            placeholder="20"
            value={loanTerms}
            onChange={(val) => setLoanTerms(Number(val))}
            min={1}
            size="sm"
          />
        </Group>

        <Divider my="sm" />

        <Box ta="center" py="xs" bg="var(--mantine-color-default-hover)" style={{ borderRadius: rem(8) }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={1}>Estimated Monthly</Text>
          <Text size={rem(28)} fw={900} c="blue.7">
            KES {Math.round(monthlyPayment).toLocaleString()}
          </Text>
        </Box>
      </Stack>
    </Paper>
  )
}
