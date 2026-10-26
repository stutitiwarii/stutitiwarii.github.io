import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/context'

export default function Loader({ name = '', onDone }) {
  const { lang } = useLang()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const t = setTimeout(onDone, 2200)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [onDone])

  const parts = lang === 'hi' ? name.split(' ').map((w) => w + '\u00A0') : name.split('')

  return (
    <motion.div
      className="loader"
      data-lenis-prevent
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="loader-name">
        {parts.map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 + i * (lang === 'hi' ? 0.12 : 0.05), ease: [0.22, 1, 0.36, 1] }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        ))}
      </div>
      <div className="loader-line">
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}