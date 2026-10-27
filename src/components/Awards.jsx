import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import Reveal from './Reveal'
import RevealText from './RevealText'

const variants = {
  enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
}

export default function Awards({ s }) {
  const slides = useTable('awards').filter((x) => x.is_visible !== false)
  const [[index, dir], setPage] = useState([0, 1])
  const [paused, setPaused] = useState(false)

  const count = slides.length
  const i = count ? ((index % count) + count) % count : 0
  const current = slides[i]

  // seconds: this certificate's own value, else the default from site_settings, else 4
  const seconds = Number(current?.seconds) || Number(s.awards_seconds) || 4
  const autoplay = s.awards_autoplay !== 'false'

  const go = useCallback((d) => setPage(([p]) => [p + d, d]), [])
  const jump = (n) => setPage([n, n > i ? 1 : -1])

  // auto slide
  useEffect(() => {
    if (!autoplay || paused || count < 2) return
    const t = setTimeout(() => go(1), seconds * 1000)
    return () => clearTimeout(t)
  }, [index, paused, autoplay, count, seconds, go])

  if (count === 0 || s.show_awards === 'false') return null

  const meta = [current.issuer, current.year].filter(Boolean).join(' · ')

  return (
    <section id="awards" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{s.awards_tagline}</small>
            <RevealText as="h2" text={s.awards_title} />
          </div>
        </Reveal>

        <Reveal>
          <div
            className="slider awards"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={current.id + '-' + index}
                className="slide"
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragStart={() => setPaused(true)}
                onDragEnd={(e, { offset, velocity }) => {
                  setPaused(false)
                  if (offset.x < -80 || velocity.x < -500) go(1)
                  else if (offset.x > 80 || velocity.x > 500) go(-1)
                }}
              >
                {current.image_url ? (
                  <>
                    <div className="slide-bg" style={{ backgroundImage: `url(${current.image_url})` }} />
                    <img src={current.image_url} alt={current.title || ''} draggable={false} />
                  </>
                ) : (
                  <div className="slide-ph">🏆</div>
                )}
              </motion.div>
            </AnimatePresence>

            {count > 1 && (
              <>
                <button className="slider-arrow prev" onClick={() => go(-1)} aria-label="Previous">‹</button>
                <button className="slider-arrow next" onClick={() => go(1)} aria-label="Next">›</button>

                <div className="slider-count">
                  {String(i + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </div>

                <div className="slider-dots">
                  {slides.map((sl, n) => (
                    <button key={sl.id} className={n === i ? 'active' : ''} onClick={() => jump(n)} aria-label={`Slide ${n + 1}`} />
                  ))}
                </div>

                {autoplay && (
                  <motion.div
                    key={`${index}-${paused}-${seconds}`}
                    className="slider-progress"
                    initial={{ width: 0 }}
                    animate={{ width: paused ? 0 : '100%' }}
                    transition={{ duration: paused ? 0 : seconds, ease: 'linear' }}
                  />
                )}
              </>
            )}
          </div>
        </Reveal>

        <motion.div
          key={current.id}
          className="award-cap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>{current.title}</h3>
          {meta && <p>{meta}</p>}
        </motion.div>
      </div>
    </section>
  )
}