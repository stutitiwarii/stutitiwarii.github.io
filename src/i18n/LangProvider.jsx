import { useEffect, useState } from 'react'
import { LangContext } from './context'

const KEY = 'lang'

// the visitor's own choice wins; otherwise Hindi if the browser's first language is Hindi
const read = () => {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'hi' || saved === 'en') return saved
  } catch {
    /* storage blocked */
  }
  const list = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : []
  return String(list[0] || '').toLowerCase().startsWith('hi') ? 'hi' : 'en'
}

export default function LangProvider({ children }) {
  const [lang, setLang] = useState(read)

  const toggle = () => {
    const next = lang === 'en' ? 'hi' : 'en'
    setLang(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage blocked, the choice just won't be remembered */
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>
}