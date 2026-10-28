import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n/context'

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
  </svg>
)

export default function ShareButton({ s }) {
  const { lang } = useLang()
  const hi = lang === 'hi'
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState({ url: '', data: '' })

  const url = s.share_url || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '')
  const title = s.share_title || s.brand_name || 'Portfolio'
  const text = s.share_text || `Take a look at ${s.brand_name || 'this'} portfolio`
  const canNative = typeof navigator !== 'undefined' && !!navigator.share

  // make the QR code only when the card is opened
  useEffect(() => {
    if (!open || qr.url === url) return
    let alive = true
    import('qrcode')
      .then((m) =>
        (m.default || m).toDataURL(url, {
          width: 640,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#111111', light: '#ffffff' },
        })
      )
      .then((data) => alive && setQr({ url, data }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [open, qr.url, url])

  // card open: lock page scroll, Esc closes
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (s.show_share === 'false') return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* nothing else to try */
      }
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nativeShare = () => navigator.share({ title, text, url }).catch(() => {})

  const enc = encodeURIComponent
  const options = [
    { key: 'wa', label: 'WhatsApp', ic: '💬', c: '#25d366', href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { key: 'in', label: 'LinkedIn', ic: 'in', c: '#0a66c2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { key: 'fb', label: 'Facebook', ic: 'f', c: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { key: 'x', label: 'X', ic: '𝕏', c: '#1a1a1a', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { key: 'mail', label: hi ? 'ईमेल' : 'Email', ic: '✉', c: 'var(--accent)', href: `mailto:?subject=${enc(title)}&body=${enc(`${text}\n${url}`)}` },
  ]

  return (
    <>
      <motion.button
        type="button"
        className="share-fab"
        onClick={() => setOpen(true)}
        aria-label={hi ? 'शेयर करें' : 'Share this portfolio'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 3.2, type: 'spring', stiffness: 200, damping: 14 }}
      >
        <ShareIcon />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="share-card"
              initial={{ scale: 0.94, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="share-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
              <h3>{hi ? 'इस पोर्टफोलियो को शेयर करें' : 'Share this portfolio'}</h3>
              <p className="share-sub">{hi ? 'किसी ऐसे व्यक्ति को भेजें जिसे यह पसंद आएगा।' : 'Send it to someone who would like it.'}</p>

              <div className="share-grid">
                {options.map((o) => (
                  <a key={o.key} className="share-opt" href={o.href} target="_blank" rel="noopener noreferrer" style={{ '--c': o.c }}>
                    <span className="ic">{o.ic}</span>
                    {o.label}
                  </a>
                ))}
                <button type="button" className="share-opt" onClick={copy} style={{ '--c': 'var(--accent)' }}>
                  <span className="ic">{copied ? '✓' : '🔗'}</span>
                  {copied ? (hi ? 'कॉपी हो गया' : 'Copied') : hi ? 'लिंक कॉपी' : 'Copy link'}
                </button>
                {canNative && (
                  <button type="button" className="share-opt" onClick={nativeShare} style={{ '--c': '#6b7280' }}>
                    <span className="ic">⋯</span>
                    {hi ? 'और' : 'More'}
                  </button>
                )}
              </div>

              <div className="share-qr">
                {qr.url === url && qr.data ? <img src={qr.data} alt="QR code" draggable={false} /> : <div className="share-qr-ph" />}
                <small>{hi ? 'फ़ोन के कैमरे से स्कैन करें' : 'Scan with a phone camera'}</small>
                {qr.url === url && qr.data && (
                  <a className="btn ghost" href={qr.data} download="portfolio-qr.png" style={{ padding: '8px 22px', fontSize: '.8rem' }}>
                    {hi ? 'QR डाउनलोड करें' : 'Download QR'}
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}