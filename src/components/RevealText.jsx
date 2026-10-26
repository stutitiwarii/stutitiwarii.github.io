import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLang } from '../i18n/context'

// true once the element has scrolled into view
function useSeen() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -60px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, seen]
}

export default function RevealText({ text = '', as: Tag = 'h2', delay = 0, className = '' }) {
  const calm = useReducedMotion()
  const { lang } = useLang()
  const [ref, seen] = useSeen()
  const value = String(text)

  if (calm) return <Tag className={className}>{value}</Tag>

  // Hindi: simple fade-up (the word mask can clip Hindi letter marks)
  if (lang === 'hi') {
    return (
      <Tag
        ref={ref}
        className={className}
        style={{
          opacity: seen ? 1 : 0,
          transform: seen ? 'none' : 'translateY(24px)',
          transition: 'opacity .8s ease, transform .8s ease',
        }}
      >
        {value}
      </Tag>
    )
  }

  // English: words slide up one after another
  const words = value.split(' ').filter(Boolean)
  return (
    <Tag ref={ref} className={className} aria-label={value}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="rt-mask" aria-hidden="true">
          <motion.span
            className="rt-word"
            initial={{ y: '115%', rotate: 3 }}
            animate={seen ? { y: 0, rotate: 0 } : { y: '115%', rotate: 3 }}
            transition={{ duration: 0.9, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {w + (i < words.length - 1 ? '\u00A0' : '')}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}