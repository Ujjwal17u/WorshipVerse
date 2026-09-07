'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const current = mounted ? theme : 'system'
  const icon = !mounted
    ? <Monitor size={17} />
    : current === 'light'
      ? <Sun size={17} />
      : current === 'dark'
        ? <Moon size={17} />
        : <Monitor size={17} />

  const label = !mounted
    ? 'Toggle theme'
    : current === 'light'
      ? 'Switch to dark mode'
      : current === 'dark'
        ? 'Switch to system theme'
        : 'Switch to light mode'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className="text-muted-foreground hover:text-foreground"
    >
      {icon}
    </Button>
  )
}
