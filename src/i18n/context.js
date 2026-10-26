import { createContext, useContext } from 'react'
import { UI } from './strings'

export const LangContext = createContext({ lang: 'en', toggle: () => {} })

export function useLang() {
  const { lang, toggle } = useContext(LangContext)

  const t = (key, vars) => {
    let str = UI[lang]?.[key] ?? UI.en[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, v)
    }
    return str
  }

  return { lang, toggle, t }
}