import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Hero({ s }) {
  const ref = useRef(null)
  const words = (s.hero_title || '').split(' ')

  // the glow follows the mouse (PC only, the CSS hides it on touch screens)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--sx', `${e.clientX - r.left}px`)
    el.style.setProperty('--sy', `${e.clientY - r.top}px`)
  }

  return (
    <section id="top" className="hero" ref={ref} onMouseMove={onMove}>
      <motion.div
        className="hero-bg"
        style={{ backgroundImage: `url(${s.hero_image})` }}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.8, ease: 'easeOut' }}
      />
      <div className="hero-overlay" />
      <div className="hero-spot" />

      <div className="hero-inner">
        <motion.span
          className="hero-tag"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {s.hero_tagline}
        </motion.span>

        <h1>
          {words.map((w, i) => (
            <span className="word-wrap" key={`${w}-${i}`}>
              <motion.span
                className="word"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              >
                {w + '\u00A0'}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {s.hero_subtitle}
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {s.hero_cta_text && <a className="btn" href={s.hero_cta_link}>{s.hero_cta_text}</a>}
          {s.resume_url && (
            <a className="btn ghost" href={s.resume_url} target="_blank" rel="noreferrer">Download Resume</a>
          )}
        </motion.div>
      </div>

      <div className="scroll-hint" />
    </section>
  )
}