import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n/context'

// what can be picked, and how to find it on the page
const SEL = {
  project: '.work-card',
  reel: '#reels .phone',
  blog: '#blogs .slider',
  campaign: '#campaigns .cmp-card',
}
const NAME = {
  en: { project: 'a project', reel: 'a reel', blog: 'my writings', campaign: 'a campaign' },
  hi: { project: 'एक प्रोजेक्ट', reel: 'एक रील', blog: 'मेरा लेखन', campaign: 'एक अभियान' },
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const $$ = (sel) => Array.from(document.querySelectorAll(sel))

export default function SurpriseButton({ s }) {
  const { lang } = useLang()
  const hi = lang === 'hi'
  const [show, setShow] = useState(false)
  const [label, setLabel] = useState('')
  const busy = useRef(false)
  const last = useRef('')

  if (s.show_surprise === 'false') return null

  const run = async () => {
    if (busy.current) return
    // only sections that are on the page (hidden ones are skipped)
    const kinds = Object.keys(SEL).filter((k) => document.querySelector(SEL[k]))
    if (kinds.length === 0) return

    busy.current = true
    const pool = kinds.length > 1 ? kinds.filter((k) => k !== last.current) : kinds
    const kind = rand(pool)
    last.current = kind
    const names = NAME[hi ? 'hi' : 'en']

    // quick shuffle animation
    setShow(true)
    for (let i = 0; i < 8; i++) {
      setLabel(names[rand(kinds)])
      await pause(100)
    }
    setLabel(names[kind])
    await pause(500)

    let el = kind === 'project' ? rand($$(SEL.project)) : document.querySelector(SEL[kind])

    // jump to a random blog or a random campaign before scrolling there
    if (kind === 'blog') {
      const dots = $$('#blogs .slider-dots button')
      if (dots.length) rand(dots).click()
    }
    if (kind === 'campaign') {
      const tabs = $$('.cmp-tabs button')
      if (tabs.length) {
        rand(tabs).click()
        await pause(300)
        el = document.querySelector(SEL.campaign) || el
      }
    }

    if (!el) {
      setShow(false)
      busy.current = false
      return
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setShow(false)
    await pause(1000)

    el.classList.add('surprise-hit')
    setTimeout(() => el.classList.remove('surprise-hit'), 2400)

    // a reel: skip ahead a few reels; a project with a YouTube link: start its short preview
    if (kind === 'reel') {
      const screen = el.querySelector('.phone-screen')
      const times = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < times; i++) {
        await pause(900)
        screen?.click()
      }
    }
    if (kind === 'project') {
      el.querySelector('.yt-wrap')?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    }

    busy.current = false
  }

  return (
    <>
      <motion.button
        type="button"
        className="surprise-fab"
        onClick={run}
        aria-label={hi ? 'सरप्राइज़ मी' : 'Surprise me'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 3.6, type: 'spring', stiffness: 200, damping: 14 }}
      >
        <span aria-hidden="true">🎲</span>
        <em className="surprise-tip">{hi ? 'सरप्राइज़ मी' : 'Surprise me'}</em>
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            className="surprise-pop"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <span className="dice" aria-hidden="true">🎲</span>
            <div>
              <small>{hi ? 'सरप्राइज़!' : 'Surprise!'}</small>
              <p>
                {hi ? 'चलिए देखते हैं ' : 'Let’s look at '}
                <b>{label}</b>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}