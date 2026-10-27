import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'

// splits text into visible characters (keeps Hindi letters joined)
const graphemes = (str) =>
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(str), (x) => x.segment)
    : Array.from(str)

function RotatingRole({ roles }) {
  const key = roles.join('|')
  const list = useMemo(() => key.split('|').map(graphemes), [key])
  const [idx, setIdx] = useState(0)
  const [count, setCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (list.length === 0) return
    const cur = list[idx % list.length]
    let timer
    if (!deleting && count >= cur.length) {
      timer = setTimeout(() => setDeleting(true), 1700)
    } else if (deleting && count <= 0) {
      timer = setTimeout(() => {
        setDeleting(false)
        setIdx((i) => (i + 1) % list.length)
      }, 350)
    } else {
      timer = setTimeout(() => setCount((c) => c + (deleting ? -1 : 1)), deleting ? 35 : 75)
    }
    return () => clearTimeout(timer)
  }, [count, deleting, idx, list])

  const cur = list[idx % list.length] || []
  return (
    <>
      {cur.slice(0, count).join('')}
      <span className="caret" />
    </>
  )
}

function PhotoTrail({ images, hostRef }) {
  const [items, setItems] = useState([])
  const last = useRef({ x: -999, y: -999 })
  const counter = useRef(0)

  useEffect(() => {
    const host = hostRef.current
    if (!host || images.length === 0) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e) => {
      const r = host.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (Math.hypot(x - last.current.x, y - last.current.y) < 120) return
      last.current = { x, y }
      const id = ++counter.current
      const item = { id, x, y, src: images[id % images.length], rot: (Math.random() - 0.5) * 20 }
      setItems((arr) => [...arr.slice(-6), item])
      setTimeout(() => setItems((arr) => arr.filter((it) => it.id !== id)), 1150)
    }

    host.addEventListener('mousemove', onMove)
    return () => host.removeEventListener('mousemove', onMove)
  }, [images, hostRef])

  return items.map((it) => (
    <img
      key={it.id}
      className="trail-img"
      src={it.src}
      alt=""
      draggable={false}
      style={{ left: it.x, top: it.y, '--rot': `${it.rot}deg` }}
    />
  ))
}

export default function Hero({ s }) {
  const { t } = useLang()
  const calm = useReducedMotion()
  const ref = useRef(null)
  const words = (s.hero_title || '').split(' ')

  const roles = (s.hero_roles || '').split(',').map((r) => r.trim()).filter(Boolean)
  const gallery = useTable('gallery')
  const trailImages = useMemo(
    () => gallery.filter((g) => g.is_visible !== false && g.image_url).map((g) => g.image_url).slice(0, 12),
    [gallery]
  )

  // parallax: values change as the hero scrolls out of view
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], calm ? ['0%', '0%'] : ['0%', '10%'])
  const textY = useTransform(scrollYProgress, [0, 1], calm ? [0, 0] : [0, 90])
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], calm ? [1, 1] : [1, 0])
  const shapeA = useTransform(scrollYProgress, [0, 1], calm ? [0, 0] : [0, -140])
  const shapeB = useTransform(scrollYProgress, [0, 1], calm ? [0, 0] : [0, 180])

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
      <motion.div className="hero-parallax" style={{ y: bgY }}>
        <motion.div
          className="hero-bg"
          style={{ backgroundImage: `url(${s.hero_image})` }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.8, ease: 'easeOut' }}
        />
      </motion.div>
      <div className="hero-overlay" />
      <div className="hero-spot" />
      <motion.div className="hero-shape a" style={{ y: shapeA }} />
      <motion.div className="hero-shape b" style={{ y: shapeB }} />

      {s.hero_trail !== 'false' && <PhotoTrail images={trailImages} hostRef={ref} />}

      <motion.div className="hero-inner" style={{ y: textY, opacity: textOpacity }}>
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

        {roles.length > 0 && (
          <motion.p
            className="hero-role"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {calm ? roles.join(' · ') : <RotatingRole key={roles.join('|')} roles={roles} />}
          </motion.p>
        )}

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {s.hero_subtitle}
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          {s.hero_cta_text && <a className="btn" href={s.hero_cta_link}>{s.hero_cta_text}</a>}
          {s.resume_url && (
            <a className="btn ghost" href={s.resume_url} target="_blank" rel="noreferrer">{t('download_resume')}</a>
          )}
        </motion.div>
      </motion.div>

      <div className="scroll-hint" />
    </section>
  )
}