"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function ThemeScript() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    if (theme) {
      const html = document.documentElement
      
      if (theme.startsWith('dark.')) {
        html.classList.add('dark')
      } else if (theme === 'light' || theme === 'zinc' || theme === 'blue' || theme === 'green' || theme === 'rose' || theme === 'purple') {
        html.classList.remove('dark')
      }
    }
  }, [theme])

  return null
}
