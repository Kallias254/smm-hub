'use client'

import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'
import classes from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      <IconSun className={`${classes.icon} ${classes.light}`} stroke={1.5} size={20} />
      <IconMoon className={`${classes.icon} ${classes.dark}`} stroke={1.5} size={20} />
    </ActionIcon>
  )
}
