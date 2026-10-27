import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'
import YouTubePreview from './YouTubePreview'

// pulls the file id out of a Google Drive share link
const getDriveId = (url = '') => {
  const m = String(url).match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^\s]*?id=)([\w-]+)/)
  return m ? m[1] : null
}

export default function Portfolio({ s }) {
  const { t } = useLang()
  const all = useTable('portfolio_items')
  const items = all.filter((i) => i.is_visible !== false)
  const categories = ['All', ...new Set(items.map((i) => i.category).filter(Boolean))]
  const [cat, setCat] = useState('All')
  const [modal, setModal] = useState(null)
  const shown = cat === 'All' || !categories.includes(cat) ? items : items.filter((i) => i.category === cat)

  // lock scroll + close on Esc while popup is open
  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setModal(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  return (
    <section id="portfolio" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{t('portfolio')}</small>
            <RevealText as="h2" text={s.portfolio_title} />
          </div>
        </Reveal>

        {categories.length > 2 && (
          <Reveal>
            <div className="filters">
              {categories.map((c) => (
                <button key={c} className={c === cat ? 'active' : ''} onClick={() => setCat(c)}>
                  {c === 'All' ? t('all') : c}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <motion.div layout className="work-grid">
          <AnimatePresence mode="popLayout">
            {shown.map((i) => {
              const driveId = getDriveId(i.video_url)
              return (
                <motion.article
                  layout
                  key={i.id}
                  className="work-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="work-media">
                    {i.youtube_url ? (
                      <YouTubePreview
                        url={i.youtube_url}
                        start={i.preview_start || 0}
                        seconds={i.preview_seconds || 6}
                        poster={i.image_url}
                        title={i.title}
                        onOpen={setModal}
                      />
                    ) : driveId ? (
                      <div className="yt-wrap" onClick={() => setModal({ type: 'drive', id: driveId })}>
                        <img
                          src={i.image_url || `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`}
                          alt={i.title}
                          loading="lazy"
                        />
                        <span className="play-badge">▶</span>
                      </div>
                    ) : i.video_url ? (
                      <video src={i.video_url} poster={i.image_url} muted loop playsInline autoPlay />
                    ) : (
                      <img
                        src={i.image_url}
                        alt={i.title}
                        loading="lazy"
                        onClick={() => setModal({ type: 'img', src: i.image_url })}
                      />
                    )}
                  </div>
                  <div className="work-body">
                    <small>{i.category}</small>
                    <h3>{i.title}</h3>
                    <p>{i.description}</p>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
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
                {modal.type === 'yt' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${modal.id}?autoplay=1&rel=0`}
                    title="video"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                ) : modal.type === 'drive' ? (
                  <iframe
                    src={`https://drive.google.com/file/d/${modal.id}/preview`}
                    title="video"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <img src={modal.src} alt="" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}