import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

// stable "random" numbers so the tiles always fly in from the same places
const rnd = (i, k) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// shows one tile of a big combined grid image
const sliceStyle = (url, col, row, cols, rows) => ({
  backgroundImage: `url(${url})`,
  backgroundSize: `${cols * 100}% ${rows * 100}%`,
  backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`,
})

function TileMedia({ t, c, cols, rows }) {
  if (t.image_url) return <img src={t.image_url} alt={t.label || ''} draggable={false} loading="lazy" />
  if (c.grid_image_url) {
    return <div className="cmp-slice" style={sliceStyle(c.grid_image_url, t.index % cols, Math.floor(t.index / cols), cols, rows)} />
  }
  return (
    <div className="cmp-ph">
      <b>{String(t.index + 1).padStart(2, '0')}</b>
    </div>
  )
}

function CampaignCard({ c, posts, hi }) {
  const calm = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3 })
  const holdTimer = useRef(null)

  const cols = Math.max(1, Number(c.grid_cols) || 3)
  const rows = Math.max(1, Number(c.grid_rows) || 3)

  // the tiles: from the campaign_posts rows, or empty numbered tiles to start with
  const tiles = useMemo(() => {
    const mine = posts.filter((p) => p.is_visible !== false)
    const base = mine.length ? mine : Array.from({ length: cols * rows }, (_, i) => ({ id: `ph${i}` }))
    return base.map((p, i) => ({ ...p, index: i }))
  }, [posts, cols, rows])
  const n = tiles.length

  // when only one combined grid image is used, measure it so the tiles keep the right shape
  const slicing = !!c.grid_image_url && tiles.every((t) => !t.image_url)
  const [natural, setNatural] = useState(null)
  useEffect(() => {
    if (!slicing) return
    const img = new Image()
    img.onload = () => setNatural(`${img.naturalWidth / cols} / ${img.naturalHeight / rows}`)
    img.src = c.grid_image_url
  }, [slicing, c.grid_image_url, cols, rows])
  const ratio = slicing && natural ? natural : c.tile_ratio || '4 / 5'

  // countdown: step k = k-th post that went out; the grid shows the newest post top-left
  const newestFirst = c.grid_newest_first !== false
  const [k, setK] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hold, setHold] = useState(false)
  const [open, setOpen] = useState(null)

  const kk = k % n
  const tileOf = (step) => (newestFirst ? n - 1 - step : step)
  const activeTile = tileOf(kk)

  useEffect(() => {
    if (!inView || paused || hold || n < 2 || calm) return
    const id = setInterval(() => setK((v) => (v + 1) % n), 1600)
    return () => clearInterval(id)
  }, [inView, paused, hold, n, calm])

  useEffect(() => () => clearTimeout(holdTimer.current), [])

  const pick = (j) => {
    setK(j)
    setHold(true)
    clearTimeout(holdTimer.current)
    holdTimer.current = setTimeout(() => setHold(false), 5000)
  }

  // full screen popup: lock page scroll, Esc closes, arrow keys move
  useEffect(() => {
    if (open === null) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % n)
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + n) % n)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, n])

  const lb = open !== null ? tiles[open % n] : null
  const move = (e, d) => {
    e.stopPropagation()
    setOpen((i) => (i + d + n) % n)
  }

  const paragraphs = String(c.description || '').split(/\n+/).map((p) => p.trim()).filter(Boolean)
  const roles = String(c.role || '').split(/[,•|]/).map((r) => r.trim()).filter(Boolean)
  const nowLabel = tiles[activeTile]?.label || `${hi ? 'पोस्ट' : 'Post'} ${kk + 1} / ${n}`

  return (
    <article className="cmp-card" ref={ref} style={{ '--cmp': c.theme_color || 'var(--accent)', '--ratio': ratio }}>
      {c.tricolor && <span className="cmp-tri" />}
      {c.map_url && <img className="cmp-map" src={c.map_url} alt="" aria-hidden="true" draggable={false} />}

      <div className="cmp-grid-wrap">
        <div
          className="cmp-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {tiles.map((t, i) => (
            <motion.button
              key={t.id}
              type="button"
              className={`cmp-tile ${i === activeTile ? 'on' : ''}`}
              onClick={() => setOpen(i)}
              aria-label={t.label || `Post ${i + 1}`}
              initial={
                calm
                  ? false
                  : { opacity: 0, scale: 0.5, x: (rnd(i, 1) - 0.5) * 240, y: (rnd(i, 2) - 0.5) * 240, rotate: (rnd(i, 3) - 0.5) * 40 }
              }
              whileInView={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
              whileHover={calm ? undefined : { scale: 1.05, zIndex: 3 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <TileMedia t={t} c={c} cols={cols} rows={rows} />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="cmp-info">
        <span className="cmp-kind">{c.kind || 'Campaign'}</span>
        <h3>{c.title}</h3>
        {c.tagline && <p className="cmp-tag">{c.tagline}</p>}
        {c.client && <span className="cmp-client">{hi ? 'क्लाइंट' : 'Client'}: {c.client}</span>}

        {paragraphs.length > 0 && (
          <>
            <h4>{hi ? 'अभियान विवरण' : 'Campaign Description'}</h4>
            <div className="cmp-desc">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </>
        )}

        {roles.length > 0 && (
          <>
            <h4>{hi ? 'मेरी भूमिका' : 'My Role'}</h4>
            <div className="cmp-roles">
              {roles.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
          </>
        )}

        {c.post_url && (
          <a className="btn" href={c.post_url} target="_blank" rel="noopener noreferrer" style={{ marginTop: 26 }}>
            {hi ? 'अभियान देखें' : 'View campaign'} ↗
          </a>
        )}
      </div>

      {n > 1 && (
        <div className="cmp-timeline" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <span className="cmp-tl-end">{c.timeline_start}</span>
          <div className="cmp-tl-track">
            <i className="cmp-tl-fill" style={{ width: `${(kk / (n - 1)) * 100}%` }} />
            {tiles.map((_, j) => (
              <button
                key={j}
                type="button"
                className={`cmp-tl-dot ${j < kk ? 'done' : ''} ${j === kk ? 'now done' : ''}`}
                style={{ left: `${(j / (n - 1)) * 100}%` }}
                onClick={() => pick(j)}
                aria-label={tiles[tileOf(j)]?.label || `Post ${j + 1}`}
              />
            ))}
          </div>
          <span className="cmp-tl-end r">{c.timeline_end}</span>
          <p className="cmp-now">{nowLabel}</p>
        </div>
      )}

      <AnimatePresence>
        {lb && (
          <motion.div
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            {n > 1 && <button type="button" className="cmp-arrow prev" onClick={(e) => move(e, -1)} aria-label="Previous">‹</button>}
            {n > 1 && <button type="button" className="cmp-arrow next" onClick={(e) => move(e, 1)} aria-label="Next">›</button>}

            <motion.div
              key={lb.id}
              className="cmp-lb"
              initial={{ scale: 0.94, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
              {lb.image_url ? (
                <img src={lb.image_url} alt={lb.label || ''} draggable={false} />
              ) : c.grid_image_url ? (
                <div
                  className="cmp-lb-slice"
                  style={{ ...sliceStyle(c.grid_image_url, lb.index % cols, Math.floor(lb.index / cols), cols, rows), aspectRatio: ratio }}
                />
              ) : (
                <div className="cmp-ph big"><b>{String(lb.index + 1).padStart(2, '0')}</b></div>
              )}
              <div className="cmp-lb-cap">
                {lb.label && <b>{lb.label}</b>}
                {lb.caption && <span>{lb.caption}</span>}
                <em>{(open % n) + 1} / {n}</em>
                {lb.post_url && (
                  <a className="btn" href={lb.post_url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 22px', marginTop: 6 }}>
                    {hi ? 'पोस्ट देखें' : 'View post'} ↗
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}

export default function Campaigns({ s }) {
  const { lang } = useLang()
  const campaigns = useTable('campaigns').filter((c) => c.is_visible !== false)
  const allPosts = useTable('campaign_posts')
  const [selId, setSelId] = useState(null)

  const cur = campaigns.find((c) => c.id === selId) || campaigns[0]
  const curPosts = useMemo(() => (cur ? allPosts.filter((p) => p.campaign_id === cur.id) : []), [allPosts, cur])

  if (!cur || s.show_campaigns === 'false') return null

  const hi = lang === 'hi'

  return (
    <section id="campaigns" className="section campaigns">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{s.campaigns_tagline}</small>
            <RevealText as="h2" text={s.campaigns_title} />
            {s.campaigns_subtitle && <p className="brands-sub">{s.campaigns_subtitle}</p>}
          </div>
        </Reveal>

        {campaigns.length > 1 && (
          <div className="cmp-tabs">
            {campaigns.map((c) => (
              <button key={c.id} type="button" className={c.id === cur.id ? 'active' : ''} onClick={() => setSelId(c.id)}>
                {c.title}
              </button>
            ))}
          </div>
        )}

        <CampaignCard key={cur.id} c={cur} posts={curPosts} hi={hi} />
      </div>
    </section>
  )
}