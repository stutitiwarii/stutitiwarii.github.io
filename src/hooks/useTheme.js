import { useCallback, useEffect, useState } from 'react'

const KEY = 'theme'

const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export default function useTheme(defaultTheme) {
  const [saved, setSaved] = useState(read)
  const theme = saved || (defaultTheme === 'light' ? 'light' : 'dark')

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setSaved(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage blocked, the choice just won't be remembered */
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return [theme, toggle]
}