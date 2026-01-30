'use client'

import { createTheme, rem } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(32), lineHeight: '1.2' },
      h2: { fontSize: rem(26), lineHeight: '1.3' },
      h3: { fontSize: rem(22), lineHeight: '1.35' },
    },
  },
  components: {
    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
        padding: 'lg',
        radius: 'md',
      },
      styles: () => ({
        root: {
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--mantine-shadow-md)',
          },
        },
      }),
    },
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Container: {
      defaultProps: {
        size: 'xl',
      },
    },
  },
})