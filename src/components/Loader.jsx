import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/context'

export default function Loader({ name = '', ready = true, onDone }) {
  const { lang } = useLang()
  const [timeUp, setTimeUp] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const min = setTimeout(() => setTimeUp(true), 2200) // shortest time the screen stays
    const max = setTimeout(onDone, 9000) // never wait longer than this
    return () => {
      clearTimeout(min)
      clearTimeout(max)
      document.body.style.overflow = ''
    }
  }, [onDone])

  // leave once the animation is done AND her content has arrived
  useEffect(() => {
    if (timeUp && ready) onDone()
  }, [timeUp, ready, onDone])

  const parts = lang === 'hi' ? name.split(' ').map((w) => w + '\u00A0') : name.split('')
  const waiting = timeUp && !ready

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
      <div className={`loader-line ${waiting ? 'waiting' : ''}`}>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </div>
      {waiting && <p className="loader-hint">{lang === 'hi' ? 'लोड हो रहा है…' : 'Loading…'}</p>}
    </motion.div>
  )
}