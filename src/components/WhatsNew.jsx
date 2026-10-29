import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'

const TYPES = [
  { key: 'campaigns', table: 'campaigns', target: '#campaigns', en: ['campaign', 'campaigns'], hi: 'अभियान' },
  { key: 'blogs', table: 'blogs', target: '#blogs', en: ['blog', 'blogs'], hi: 'ब्लॉग' },
  { key: 'projects', table: 'portfolio_items', target: '#portfolio', en: ['project', 'projects'], hi: 'प्रोजेक्ट' },
  { key: 'reels', table: 'reels', target: '#reels', en: ['reel', 'reels'], hi: 'रील' },
  { key: 'writing', table: 'writings', target: '#writing', en: ['writing piece', 'writing pieces'], hi: 'लेख' },
  { key: 'awards', table: 'awards', target: '#awards', en: ['award', 'awards'], hi: 'सम्मान' },
]

const CACHE = 'portfolio-cache-v1:t:'
const SKEY = 'whatsnew-v1'

// what the visitor saw last time = the saved copy of each table, read before anything new loads
function readBaseline() {
  const out = {}
  let any = false
  for (const t of TYPES) {
    out[t.key] = null
    try {
      const raw = localStorage.getItem(CACHE + t.table)
      if (raw) {
        out[t.key] = JSON.parse(raw).reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)
        any = true
      }
    } catch {
      /* unreadable, treat as unknown */
    }
  }
  return any ? out : null // null = first visit, nothing to compare with
}

const sGet = (k) => {
  try {
    return sessionStorage.getItem(k)
  } catch {
    return null
  }
}
const sSet = (k, v) => {
  try {
    sessionStorage.setItem(k, v)
  } catch {
    /* storage blocked */
  }
}

export default function WhatsNew({ s, show }) {
  const { lang } = useLang()
  const hi = lang === 'hi'
  const [base] = useState(readBaseline)

  const campaigns = useTable('campaigns')
  const blogs = useTable('blogs')
  const projects = useTable('portfolio_items')
  const reels = useTable('reels')
  const writing = useTable('writings')
  const awards = useTable('awards')

  // rows added since the visitor's last visit
  const live = useMemo(() => {
    if (!base) return []
    const rows = { campaigns, blogs, projects, reels, writing, awards }
    return TYPES.map((t) => {
      const mark = base[t.key]
      if (mark === null) return { key: t.key, n: 0 }
      return { key: t.key, n: rows[t.key].filter((r) => r.is_visible !== false && Number(r.id) > mark).length }
    }).filter((x) => x.n > 0)
  }, [base, campaigns, blogs, projects, reels, writing, awards])

  // keep the note for the whole visit (a refresh would otherwise lose it)
  const [saved] = useState(() => {
    try {
      return JSON.parse(sGet(SKEY) || 'null')
    } catch {
      return null
    }
  })
  const [gone, setGone] = useState(() => sGet(SKEY + ':x') === '1')
  const items = live.length ? live : saved || []

  useEffect(() => {
    if (live.length) sSet(SKEY, JSON.stringify(live))
  }, [live])

  const close = () => {
    setGone(true)
    sSet(SKEY + ':x', '1')
  }

  const visible = s.show_whatsnew !== 'false' && !!show && !gone && items.length > 0

  useEffect(() => {
    if (!visible) return
    const id = setTimeout(close, 14000)
    return () => clearTimeout(id)
  }, [visible])

  const parts = items
    .map((i) => ({ n: i.n, t: TYPES.find((x) => x.key === i.key) }))
    .filter((p) => p.t)
    .slice(0, 3)

  let text = ''
  if (parts.length) {
    if (hi) {
      text = `पिछली विज़िट के बाद नया: ${parts.map((p) => `${p.t.hi} (${p.n})`).join(', ')}`
    } else {
      const bits = parts.map((p) => `${p.n} new ${p.n === 1 ? p.t.en[0] : p.t.en[1]}`)
      const joined = bits.length > 1 ? `${bits.slice(0, -1).join(', ')} and ${bits[bits.length - 1]}` : bits[0]
      text = `${joined} since you were last here`
    }
  }

  const jump = () => {
    document.querySelector(parts[0].t.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    close()
  }

  return (
    <div className="whatsnew">
      <AnimatePresence>
        {visible && parts.length > 0 && (
          <motion.div
            className="wn-card"
            role="status"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, delay: 1.2 }}
          >
            <span className="wn-spark" aria-hidden="true">✨</span>
            <span className="wn-text">{text}</span>
            <button type="button" className="wn-btn" onClick={jump}>
              {hi ? 'देखें' : 'See what’s new'}
            </button>
            <button type="button" className="wn-x" onClick={close} aria-label="Close">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}