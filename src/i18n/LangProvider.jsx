import { useEffect, useState } from 'react'
import { LangContext } from './context'

const KEY = 'lang'

const read = () => {
  try {
    return localStorage.getItem(KEY) === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
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