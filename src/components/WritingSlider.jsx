import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import YouTubePreview, { getYouTubeId } from './YouTubePreview'
import Reveal from './Reveal'
import RevealText from './RevealText'

export default function WritingSlider({ s }) {
  const { lang } = useLang()
  const items = useTable('writings').filter((w) => w.is_visible !== false)
  const track = useRef(null)
  const [paused, setPaused] = useState(false)
  const [modal, setModal] = useState(null)

  const seconds = Number(s.writing_seconds) || 5
  const autoplay = s.writing_autoplay !== 'false'

  const slide = useCallback((dir) => {
    const el = track.current
    const card = el?.querySelector('.post-card')
    if (!el || !card) return
    const step = card.offsetWidth + 24
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    else el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  // auto slide (stops while the pointer is on the cards or a video popup is open)
  useEffect(() => {
    if (!autoplay || paused || modal || items.length < 2) return
    const timer = setInterval(() => slide(1), seconds * 1000)
    return () => clearInterval(timer)
  }, [autoplay, paused, modal, items.length, seconds, slide])

  // video popup: lock page scroll, close on Esc
  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setModal(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  if (items.length === 0 || s.show_writing === 'false') return null

  const hi = lang === 'hi'

  return (
    <section id="writing" className="section writing">
      <div className="container">
        <Reveal>
          <div className="posts-head">
            <div className="section-head">
              <small>{s.writing_tagline}</small>
              <RevealText as="h2" text={s.writing_title} />
              {s.writing_subtitle && <p className="brands-sub" style={{ marginLeft: 0 }}>{s.writing_subtitle}</p>}
            </div>
            {items.length > 1 && (
              <div className="posts-arrows">
                <button onClick={() => slide(-1)} aria-label="Previous">‹</button>
                <button onClick={() => slide(1)} aria-label="Next">›</button>
              </div>
            )}
          </div>
        </Reveal>

        <div
          className="posts-track"
          ref={track}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
        >
          {items.map((w) => {
            const yt = getYouTubeId(w.youtube_url)
            const label = w.platform || (yt ? 'YouTube' : 'Writing')
            const key = label.toLowerCase()

            // a card with a YouTube link: plays a short preview, click opens the full video
            if (yt) {
              return (
                <div key={w.id} className="post-card" data-platform={key}>
                  <div className="post-media">
                    <YouTubePreview
                      url={w.youtube_url}
                      start={w.preview_start || 0}
                      seconds={w.preview_seconds || 6}
                      poster={w.image_url}
                      title={w.title}
                      onOpen={setModal}
                    />
                    <span className="post-badge">{label}</span>
                  </div>
                  <div className="post-body">
                    {w.title && <h3>{w.title}</h3>}
                    {w.caption && <p>{w.caption}</p>}
                    <button type="button" className="post-link" onClick={() => setModal({ type: 'yt', id: yt })}>
                      {hi ? 'पूरा वीडियो देखें →' : 'Watch full video →'}
                    </button>
                  </div>
                </div>
              )
            }

            // a card with a link to an article or a post
            return (
              <a
                key={w.id}
                className="post-card"
                href={w.post_url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                data-platform={key}
              >
                <div className="post-media">
                  {w.image_url ? (
                    <img src={w.image_url} alt={w.title || label} loading="lazy" draggable={false} />
                  ) : (
                    <div className="post-fallback">{label}</div>
                  )}
                  <span className="post-badge">{label}</span>
                </div>
                <div className="post-body">
                  {w.title && <h3>{w.title}</h3>}
                  {w.caption && <p>{w.caption}</p>}
                  {w.post_url && <span className="post-link">{hi ? 'पढ़ें →' : 'Read →'}</span>}
                </div>
              </a>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="modal-box"
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setModal(null)} aria-label="Close">✕</button>
              <div className="frame">
                <iframe
                  src={`https://www.youtube.com/embed/${modal.id}?autoplay=1&rel=0`}
                  title="video"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}