import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSettings, useDataStatus } from './hooks/useSupabase'
import { useLang } from './i18n/context'
import { greetingFor } from './i18n/greeting'
import { PRESETS, loadFonts } from './presets'
import { okHex } from './festivals'
import useSmoothScroll from './hooks/useSmoothScroll'
import useTheme from './hooks/useTheme'
import useFestival from './hooks/useFestival'
import Loader from './components/Loader'
import ScrollProgress from './components/ScrollProgress'
import Cursor from './components/Cursor'
import CardEffects from './components/CardEffects'
import MediaReveal from './components/MediaReveal'
import WhatsAppButton from './components/WhatsAppButton'
import ShareButton from './components/ShareButton'
import SurpriseButton from './components/SurpriseButton'
import ChapterDots from './components/ChapterDots'
import WhatsNew from './components/WhatsNew'
import CtaBar from './components/CtaBar'
import Festive from './components/Festive'
import PageSkeleton from './components/PageSkeleton'
import DataNotice from './components/DataNotice'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import SkillOrbit from './components/SkillOrbit'
import Resume from './components/Resume'
import Portfolio from './components/Portfolio'
import Campaigns from './components/Campaigns'
import Gallery from './components/Gallery'
import Awards from './components/Awards'
import SocialPosts from './components/SocialPosts'
import ReelPhone from './components/ReelPhone'
import BlogSlider from './components/BlogSlider'
import WritingSlider from './components/WritingSlider'
import Services from './components/Services'
import BrandGlobe from './components/BrandGlobe'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'

// every section that the "section_order" row in Supabase can move or hide
const SECTIONS = {
  marquee: (s) => <Marquee s={s} />,
  about: (s) => <About s={s} />,
  orbit: (s) => <SkillOrbit s={s} />,
  resume: (s) => <Resume s={s} />,
  portfolio: (s) => <Portfolio s={s} />,
  campaigns: (s) => <Campaigns s={s} />,
  gallery: (s) => <Gallery s={s} />,
  awards: (s) => <Awards s={s} />,
  social: (s) => <SocialPosts s={s} />,
  reels: (s) => <ReelPhone s={s} />,
  blogs: (s) => <BlogSlider s={s} />,
  writing: (s) => <WritingSlider s={s} />,
  services: (s) => <Services s={s} />,
  brands: (s) => <BrandGlobe s={s} />,
  testimonials: (s) => <Testimonials s={s} />,
  contact: (s) => <Contact s={s} />,
}
const DEFAULT_ORDER = Object.keys(SECTIONS)

// "about,resume,-awards,portfolio": listed order, a "-" in front hides a section,
// and any section not mentioned shows up at the end
function parseOrder(value) {
  const seen = new Set()
  const out = []
  String(value || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .forEach((raw) => {
      const hidden = raw.startsWith('-') || raw.startsWith('!')
      const key = raw.replace(/^[-!]/, '')
      if (!SECTIONS[key] || seen.has(key)) return
      seen.add(key)
      if (!hidden) out.push(key)
    })
  DEFAULT_ORDER.forEach((k) => {
    if (!seen.has(k)) out.push(k)
  })
  return out
}

export default function App() {
  const s = useSettings()
  const { lang } = useLang()
  const status = useDataStatus()
  const [loaded, setLoaded] = useState(false)
  const finish = useCallback(() => setLoaded(true), [])
  const [theme, toggleTheme] = useTheme(s.default_theme, s.theme_auto !== 'false')
  const festival = useFestival(s)

  useSmoothScroll()

  // time-of-day greeting replaces the hero title; a festival wish replaces the small line above it
  const greeting = useMemo(() => greetingFor(s, lang), [s, lang])
  const heroS = useMemo(() => {
    let out = s
    if (greeting) out = { ...out, hero_title: greeting }
    if (festival) {
      const wish = festival.greeting || festival.name
      const e = festival.emoji ? `${festival.emoji} ` : ''
      out = { ...out, hero_tagline: `${e}${wish}${festival.emoji ? ` ${festival.emoji}` : ''}` }
    }
    return out
  }, [s, greeting, festival])

  const order = useMemo(() => parseOrder(s.section_order), [s.section_order])

  // colours, fonts and corners: from the festival, the style preset, or (classic) from site_settings
  useEffect(() => {
    const root = document.documentElement
    const rs = root.style
    const light = theme === 'light'
    const key = String(s.style_preset || '').trim().toLowerCase()
    const preset = PRESETS[key] || null
    const p = preset ? preset[light ? 'light' : 'dark'] : null

    const bg = p ? p.bg : light ? s.light_bg_color || '#faf7f2' : s.bg_color
    const text = p ? p.text : light ? s.light_text_color || '#1a1a1a' : s.text_color
    const accent = p ? p.accent : light ? s.light_accent_color || s.accent_color : s.accent_color

    if (bg) rs.setProperty('--bg', bg)
    if (text) rs.setProperty('--text', text)
    if (accent) rs.setProperty('--accent', accent)

    if (preset) {
      loadFonts(preset.fonts)
      rs.setProperty('--font-head', preset.head)
      rs.setProperty('--font-body', preset.body)
      rs.setProperty('--radius', preset.radius)
      rs.setProperty('--btn-radius', preset.btn)
      rs.setProperty('--hero-bg', p.hero)
    } else {
      ;['--font-head', '--font-body', '--radius', '--btn-radius', '--hero-bg'].forEach((k) => rs.removeProperty(k))
    }
    root.dataset.preset = preset ? key : 'classic'

    // a festival changes the accent colour (and the dark background) for its days
    if (festival) {
      const fa = light ? (okHex(festival.light_accent) ? festival.light_accent : okHex(festival.accent) ? festival.accent : null) : okHex(festival.accent) ? festival.accent : null
      if (fa) rs.setProperty('--accent', fa)
      if (!light && okHex(festival.bg_dark)) {
        rs.setProperty('--bg', festival.bg_dark)
        rs.setProperty('--hero-bg', festival.bg_dark)
      }
    }
    root.dataset.festival = festival?.slug || ''

    const title = s.seo_title || s.brand_name
    if (title) document.title = title
    if (s.seo_description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', s.seo_description)
    }
  }, [s, theme, festival])

  return (
    <>
      <AnimatePresence>
        {!loaded && <Loader key="loader" name={s.brand_name} ready={status.ready} onDone={finish} />}
      </AnimatePresence>

      <Cursor />
      <CardEffects />
      <MediaReveal />
      <ScrollProgress />
      <Navbar s={s} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero key={String(loaded)} s={heroS} />
        {status.booting && <PageSkeleton />}
        {order.map((key) => (
          <Fragment key={key}>{SECTIONS[key](s)}</Fragment>
        ))}
      </main>
      <Footer s={s} />
      <Festive festival={festival} theme={theme} />
      <ChapterDots s={s} />
      <WhatsAppButton s={s} />
      <ShareButton s={s} />
      <SurpriseButton s={s} />
      <WhatsNew s={s} show={loaded} />
      <CtaBar s={s} show={loaded} />
      <DataNotice empty={Object.keys(s).length === 0} />
    </>
  )
}