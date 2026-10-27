import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSettings } from './hooks/useSupabase'
import useSmoothScroll from './hooks/useSmoothScroll'
import useTheme from './hooks/useTheme'
import Loader from './components/Loader'
import ScrollProgress from './components/ScrollProgress'
import Cursor from './components/Cursor'
import CardEffects from './components/CardEffects'
import MediaReveal from './components/MediaReveal'
import WhatsAppButton from './components/WhatsAppButton'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import SkillOrbit from './components/SkillOrbit'
import Resume from './components/Resume'
import Portfolio from './components/Portfolio'
import Gallery from './components/Gallery'
import Awards from './components/Awards'
import SocialPosts from './components/SocialPosts'
import ReelPhone from './components/ReelPhone'
import BlogSlider from './components/BlogSlider'
import Services from './components/Services'
import BrandGlobe from './components/BrandGlobe'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const s = useSettings()
  const [loaded, setLoaded] = useState(false)
  const finish = useCallback(() => setLoaded(true), [])
  const [theme, toggleTheme] = useTheme(s.default_theme)

  useSmoothScroll()

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
        {!loaded && <Loader key="loader" name={s.brand_name} onDone={finish} />}
      </AnimatePresence>

      <Cursor />
      <CardEffects />
      <MediaReveal />
      <ScrollProgress />
      <Navbar s={s} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero key={String(loaded)} s={s} />
        <Marquee s={s} />
        <About s={s} />
        <SkillOrbit s={s} />
        <Resume s={s} />
        <Portfolio s={s} />
        <Gallery s={s} />
        <Awards s={s} />
        <SocialPosts s={s} />
        <ReelPhone s={s} />
        <BlogSlider s={s} />
        <Services s={s} />
        <BrandGlobe s={s} />
        <Testimonials s={s} />
        <Contact s={s} />
      </main>
      <Footer s={s} />
      <WhatsAppButton s={s} />
    </>
  )
}