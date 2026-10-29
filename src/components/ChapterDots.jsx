import { motion } from 'framer-motion'
import useActiveSection from '../hooks/useActiveSection'
import { useLang } from '../i18n/context'
import { labelFor } from '../i18n/sections'

export default function ChapterDots({ s }) {
  const { lang } = useLang()
  const { ids, active } = useActiveSection()

  if (s.show_dots === 'false' || ids.length < 3) return null

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <motion.nav
      className="chapters"
      aria-label="Sections"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.8, duration: 0.6 }}
    >
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          className={id === active ? 'active' : ''}
          onClick={() => go(id)}
          aria-label={labelFor(id, lang)}
        >
          <span className="ch-label">{labelFor(id, lang)}</span>
          <i />
        </button>
      ))}
    </motion.nav>
  )
}