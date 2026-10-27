import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

// turns a long description into paragraphs + bullet points for the popup
function parse(text = '') {
  const raw = String(text).trim()
  if (!raw) return []
  const bullet = /^[-–•*]\s*/

  if (raw.includes('\n')) {
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => (bullet.test(l) ? { type: 'li', text: l.replace(bullet, '') } : { type: 'p', text: l }))
  }

  const startsWithBullet = bullet.test(raw)
  const parts = raw
    .replace(bullet, '')
    .split(/\s+[-–•]\s+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length < 3 && !startsWithBullet) return [{ type: 'p', text: raw }]
  return parts.map((p, i) => ({ type: i === 0 && !startsWithBullet ? 'p' : 'li', text: p }))
}

function ServiceCard({ v, label, onOpen }) {
  const ref = useRef(null)
  const [clipped, setClipped] = useState(false)

  // show "Read more" only when the text is actually cut off
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setClipped(el.scrollHeight > el.clientHeight + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [v.description])

  return (
    <div className="service-card">
      <div className="service-icon">{v.icon}</div>
      <h3>{v.title}</h3>
      <p ref={ref} className="svc-desc">{v.description}</p>
      {clipped && (
        <button type="button" className="svc-more" onClick={() => onOpen(v)}>{label} →</button>
      )}
    </div>
  )
}

export default function Services({ s }) {
  const { lang, t } = useLang()
  const services = useTable('services')
  const [open, setOpen] = useState(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const label = lang === 'hi' ? 'और पढ़ें' : 'Read more'

  return (
    <section id="services" className="section alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{t('services')}</small>
            <RevealText as="h2" text={s.services_title} />
          </div>
        </Reveal>

        <div className="cards-grid">
          {services.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.1}>
              <ServiceCard v={v} label={label} onOpen={setOpen} />
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="svc-modal"
              data-lenis-prevent
              initial={{ scale: 0.94, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
              <div className="service-icon">{open.icon}</div>
              <h3>{open.title}</h3>
              <div className="svc-body">
                {(() => {
                  const blocks = parse(open.description)
                  const out = []
                  let list = []
                  const flush = () => {
                    if (list.length) {
                      out.push(<ul key={`u${out.length}`}>{list}</ul>)
                      list = []
                    }
                  }
                  blocks.forEach((b, idx) => {
                    if (b.type === 'li') list.push(<li key={idx}>{b.text}</li>)
                    else {
                      flush()
                      out.push(<p key={idx}>{b.text}</p>)
                    }
                  })
                  flush()
                  return out
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}