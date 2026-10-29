import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSettings, useDataStatus } from './hooks/useSupabase'
import { useLang } from './i18n/context'
import { greetingFor } from './i18n/greeting'
import useSmoothScroll from './hooks/useSmoothScroll'
import useTheme from './hooks/useTheme'
import Loader from './components/Loader'
import ScrollProgress from './components/ScrollProgress'
import Cursor from './components/Cursor'
import CardEffects from './components/CardEffects'
import MediaReveal from './components/MediaReveal'
import WhatsAppButton from './components/WhatsAppButton'
import ShareButton from './components/ShareButton'
import SurpriseButton from './components/SurpriseButton'
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

  useSmoothScroll()

  // time-of-day greeting replaces the hero title (turn it off with greeting_on = false)
  const greeting = useMemo(() => greetingFor(s, lang), [s, lang])
  const heroS = useMemo(() => (greeting ? { ...s, hero_title: greeting } : s), [s, greeting])

  const order = useMemo(() => parseOrder(s.section_order), [s.section_order])

  // colors come from Supabase: dark colors in dark mode, light_* colors in light mode
  useEffect(() => {
    const root = document.documentElement.style
    const light = theme === 'light'
    const bg = light ? s.light_bg_color || '#faf7f2' : s.bg_color
    const text = light ? s.light_text_color || '#1a1a1a' : s.text_color
    const accent = light ? s.light_accent_color || s.accent_color : s.accent_color

    if (bg) root.setProperty('--bg', bg)
    if (text) root.setProperty('--text', text)
    if (accent) root.setProperty('--accent', accent)

    const title = s.seo_title || s.brand_name
    if (title) document.title = title
    if (s.seo_description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', s.seo_description)
    }
  }, [s, theme])

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
      <WhatsAppButton s={s} />
      <ShareButton s={s} />
      <SurpriseButton s={s} />
      <DataNotice empty={Object.keys(s).length === 0} />
    </>
  )
}