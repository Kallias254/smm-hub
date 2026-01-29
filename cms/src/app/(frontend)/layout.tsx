import React from 'react'
import '@mantine/core/styles.css'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { theme } from './theme'
import './styles.css'

export const metadata = {
  description: 'The high-performance content manufacturing plant for modern agencies.',
  title: 'SMM HUB',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <main>{children}</main>
        </MantineProvider>
      </body>
    </html>
  )
}
