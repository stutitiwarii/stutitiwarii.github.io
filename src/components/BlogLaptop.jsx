import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

const hostOf = (url = '') => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export default function BlogLaptop({ s }) {
  const { lang } = useLang()
  const calm = useReducedMotion()
  const blogs = useTable('blogs').filter((b) => b.is_visible !== false)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const n = blogs.length
  const at = n ? idx % n : 0
  const cur = blogs[at]
  const defNum = Number(s.blogs_seconds)
  const secs = Number(cur?.seconds) > 0 ? Number(cur.seconds) : defNum > 0 ? defNum : 5

  useEffect(() => {
    if (n < 2 || paused) return
    const timer = setTimeout(() => setIdx((i) => (i + 1) % n), secs * 1000)
    return () => clearTimeout(timer)
  }, [idx, n, secs, paused])

  // gentle 3D tilt that follows the mouse (PC only)
  const tilt = calm ? 0 : 7
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [tilt, -tilt]), { stiffness: 110, damping: 16 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-tilt, tilt]), { stiffness: 110, damping: 16 })

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
    setPaused(false)
  }

  if (n === 0 || s.show_blogs === 'false') return null

  const hi = lang === 'hi'
  const step = (d) => setIdx((i) => (i + d + n) % n)

  return (
    <section id="blogs" className="section alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{s.blogs_tagline}</small>
            <RevealText as="h2" text={s.blogs_title} />
            {s.blogs_subtitle && <p className="brands-sub">{s.blogs_subtitle}</p>}
          </div>
        </Reveal>

        <Reveal>
          <div
            className={`laptop-stage ${paused ? 'paused' : ''}`}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
          >
            <div className="laptop-float">
              <motion.div className="laptop-tilt" style={{ rotateX, rotateY }}>
                <div className="laptop">
                  <div className="laptop-lid">
                    <div className="laptop-screen">
                      <div className="lt-bar">
                        <i /><i /><i />
                        <span className="lt-url">🔒 {hostOf(cur.blog_url) || 'blog'}</span>
                      </div>

                      <a
                        className="lt-view"
                        href={cur.blog_url || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={cur.title}
                      >
                        <AnimatePresence initial={false}>
                          <motion.div
                            key={cur.id}
                            className="lt-slide"
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7 }}
                          >
                            {cur.image_url ? (
                              <img
                                className="lt-shot"
                                src={cur.image_url}
                                alt={cur.title || ''}
                                draggable={false}
                                style={{ animationDuration: `${Math.max(secs, 4)}s` }}
                              />
                            ) : (
                              <div className="lt-fallback"><b>{cur.title}</b></div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                        {cur.blog_url && <span className="lt-cta">{hi ? 'ब्लॉग पढ़ें' : 'Read this blog'} ↗</span>}
                      </a>
                    </div>
                  </div>
                  <div className="laptop-base"><span /></div>
                </div>
              </motion.div>
            </div>
          </div>
        </Reveal>

        <motion.div
          key={cur.id}
          className="blog-info"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {(cur.source || cur.published_on) && (
            <div className="blog-meta">{[cur.source, cur.published_on].filter(Boolean).join(' · ')}</div>
          )}
          <h3>{cur.title}</h3>
          {cur.excerpt && <p>{cur.excerpt}</p>}

          <div className="blog-controls">
            {n > 1 && <button type="button" className="blog-arrow" onClick={() => step(-1)} aria-label="Previous">‹</button>}
            {n > 1 && n <= 12 && (
              <div className="blog-dots">
                {blogs.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    className={i === at ? 'active' : ''}
                    onClick={() => setIdx(i)}
                    aria-label={`Blog ${i + 1}`}
                  />
                ))}
              </div>
            )}
            {n > 1 && <button type="button" className="blog-arrow" onClick={() => step(1)} aria-label="Next">›</button>}
            {cur.blog_url && (
              <a className="btn" href={cur.blog_url} target="_blank" rel="noopener noreferrer">
                {hi ? 'ब्लॉग पढ़ें' : 'Read blog'} ↗
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}