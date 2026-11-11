import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n/context'
import { promptInstall, usePwa } from '../pwa'

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M12 7.5v6m0 0-2.5-2.5M12 13.5l2.5-2.5" />
    <path d="M10 18h4" />
  </svg>
)

export default function InstallApp({ s }) {
  const { lang } = useLang()
  const hi = lang === 'hi'
  const pwa = usePwa()
  const [help, setHelp] = useState(false)

  // help card open: lock page scroll, Esc closes
  useEffect(() => {
    if (!help) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setHelp(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [help])

  if (s.show_install === 'false') return null
  if (pwa.standalone) return null // already running inside the installed app

  if (pwa.installed) {
    return (
      <div className="install-row">
        <span className="install-done">✓ {hi ? 'ऐप इंस्टॉल हो गया' : 'App installed'}</span>
      </div>
    )
  }

  const click = () => {
    if (pwa.canPrompt) promptInstall()
    else setHelp(true)
  }

  const steps = pwa.ios
    ? hi
      ? ['स्क्रीन के नीचे शेयर बटन (तीर वाला चौकोर) दबाएँ।', '"Add to Home Screen" चुनें।', 'ऊपर दाईं ओर "Add" दबाएँ।']
      : ['Tap the Share button (the square with an arrow) at the bottom of the screen.', 'Scroll and tap “Add to Home Screen”.', 'Tap “Add” at the top right.']
    : hi
      ? ['ब्राउज़र का मेन्यू (⋮ या ⋯) खोलें।', '"Install app" या "Add to Home screen" चुनें।', 'पुष्टि करें, ऐप आपके फ़ोन या कंप्यूटर पर आ जाएगा।']
      : ['Open your browser menu (⋮ or ⋯).', 'Choose “Install app” or “Add to Home screen”.', 'Confirm, and the app appears on your phone or computer.']

  return (
    <>
      <div className="install-row">
        <button type="button" className="btn ghost install-btn" onClick={click}>
          <PhoneIcon />
          {hi ? 'ऐप इंस्टॉल करें' : 'Install app'}
        </button>
        <span className="install-hint">
          {hi ? 'फ़ोन या कंप्यूटर पर ऐप की तरह खोलें' : 'Open it like an app on your phone or computer'}
        </span>
      </div>

      <AnimatePresence>
        {help && (
          <motion.div
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHelp(false)}
          >
            <motion.div
              className="enq-card"
              initial={{ scale: 0.94, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="share-x" onClick={() => setHelp(false)} aria-label="Close">✕</button>
              <h3>{hi ? 'ऐप कैसे इंस्टॉल करें' : 'How to install the app'}</h3>
              <p className="share-sub">{hi ? 'बस तीन आसान कदम' : 'Just three quick steps'}</p>
              <ol className="install-steps">
                {steps.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}