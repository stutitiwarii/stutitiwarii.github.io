import { useCallback, useEffect, useState } from 'react'

const KEY = 'theme'

const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

const systemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'

// auto = follow the visitor's phone/computer setting until they press the toggle themselves
export default function useTheme(defaultTheme, auto = true) {
  const [saved, setSaved] = useState(read)
  const [system, setSystem] = useState(systemTheme)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const on = () => setSystem(mq.matches ? 'light' : 'dark')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const base = auto ? system : defaultTheme === 'light' ? 'light' : 'dark'
  const theme = saved === 'light' || saved === 'dark' ? saved : base

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