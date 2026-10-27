import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import { getYouTubeId } from './YouTubePreview'
import Reveal from './Reveal'
import RevealText from './RevealText'

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d={d} />
  </svg>
)
const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.4 4.5c2.1 0 3.8 1.2 5.6 3.4 1.8-2.2 3.5-3.4 5.6-3.4 3.7 0 5.5 3.9 4 7.3C19.5 16.4 12 21 12 21z'
const CHAT = 'M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20.5l1.5-5.3A8.5 8.5 0 1 1 21 11.5z'
const SEND = 'M22 3 2 10.5l7.5 3L12.5 21 22 3zM9.5 13.5 22 3'

function Media({ r }) {
  const yt = getYouTubeId(r.youtube_url)

  if (yt) {
   const short = /\/shorts\//.test(r.youtube_url || '')
    const src =
      `https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}` +
      `&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&start=${r.start_at || 0}`
    return (
      <>
        <img className="reel-img" src={r.image_url || `https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt="" draggable={false} />
        <iframe className={`reel-frame ${short ? 'short' : ''}`} src={src} title={r.caption || 'reel'} allow="autoplay; encrypted-media" />
      </>
    )
  }
  if (r.video_url) {
    return <video className="reel-img" src={r.video_url} poster={r.image_url || undefined} muted loop playsInline autoPlay />
  }
  if (r.image_url) return <img className="reel-img" src={r.image_url} alt={r.caption || ''} draggable={false} />
  return <div className="reel-fallback" />
}

export default function ReelPhone({ s }) {
  const { lang } = useLang()
  const calm = useReducedMotion()
  const reels = useTable('reels').filter((r) => r.is_visible !== false)
  const [idx, setIdx] = useState(0)

  const n = reels.length
  const at = n ? idx % n : 0
  const cur = reels[at]
  const defNum = Number(s.phone_seconds)
  const defSecs = defNum > 0 ? defNum : 6
  const secs = Number(cur?.seconds) > 0 ? Number(cur.seconds) : defSecs

  // go to the next reel after its time is up
  useEffect(() => {
    if (n < 2) return
    const timer = setTimeout(() => setIdx((i) => (i + 1) % n), secs * 1000)
    return () => clearTimeout(timer)
  }, [idx, n, secs])

  // 3D tilt that follows the mouse (PC only)
  const tiltNum = Number(s.phone_tilt)
  const tilt = calm ? 0 : Number.isFinite(tiltNum) && s.phone_tilt !== '' && s.phone_tilt !== undefined ? tiltNum : 14
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [tilt, -tilt]), { stiffness: 110, damping: 14 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-tilt, tilt]), { stiffness: 110, damping: 14 })

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  if (n === 0 || s.show_phone === 'false') return null

  const hi = lang === 'hi'
  const handle = s.phone_handle || `@${(s.brand_name || '').toLowerCase().replace(/\s+/g, '')}`
  const avatar = s.phone_avatar || s.about_image

  return (
    <section id="reels" className="section brands-sec">
      <div className="container">
        <div className="phone-grid">
          <Reveal className="phone-copy">
            <div className="section-head">
              <small>{s.phone_tagline}</small>
              <RevealText as="h2" text={s.phone_title} />
            </div>
            {s.phone_subtitle && <p className="phone-sub">{s.phone_subtitle}</p>}
            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
              {s.instagram && (
                <a className="btn" href={s.instagram} target="_blank" rel="noopener noreferrer">
                  {hi ? 'इंस्टाग्राम पर फ़ॉलो करें' : 'Follow on Instagram'}
                </a>
              )}
              <a className="btn ghost" href="#contact">{hi ? 'बात करें' : "Let's Talk"}</a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="phone-stage" onPointerMove={onMove} onPointerLeave={onLeave}>
              <div className="phone-float">
                <motion.div className="phone-tilt" style={{ rotateX, rotateY }}>
                  <div className="phone">
                    <div
                      className="phone-screen"
                      onClick={() => n > 1 && setIdx((i) => (i + 1) % n)}
                      role="button"
                      aria-label="Next reel"
                    >
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={cur.id}
                          className="reel"
                          initial={{ y: '100%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '-100%' }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Media r={cur} />
                          <div className="reel-shade" />

                          <div className="reel-side">
                            <span><Icon d={HEART} />{cur.likes}</span>
                            <span><Icon d={CHAT} /></span>
                            <span><Icon d={SEND} /></span>
                          </div>

                          <div className="reel-bottom">
                            {cur.caption && <p className="reel-cap">{cur.caption}</p>}
                            {cur.link_url && (
                              <a
                                className="reel-view"
                                href={cur.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {hi ? 'देखें' : 'View'} ↗
                              </a>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      <div className="phone-island" />

                      {n > 1 && n <= 8 && (
                        <div className="reel-bars">
                          {reels.map((r, i) => (
                            <span key={r.id} className="reel-bar">
                              <i
                                key={`${r.id}-${i === at ? `run${idx}` : 'idle'}`}
                                className={i < at ? 'done' : i === at ? 'run' : ''}
                                style={i === at ? { animationDuration: `${secs}s` } : undefined}
                              />
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="reel-head">
                        {avatar && <img src={avatar} alt="" draggable={false} />}
                        <b>{handle}</b>
                        {s.instagram && (
                          <a href={s.instagram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            {hi ? 'फ़ॉलो' : 'Follow'}
                          </a>
                        )}
                        {n > 8 && <em>{at + 1}/{n}</em>}
                      </div>
                    </div>
                    <div className="phone-gloss" />
                  </div>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}