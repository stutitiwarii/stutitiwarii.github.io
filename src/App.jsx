import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSettings } from './hooks/useSupabase'
import useSmoothScroll from './hooks/useSmoothScroll'
import Loader from './components/Loader'
import ScrollProgress from './components/ScrollProgress'
import Cursor from './components/Cursor'
import CardEffects from './components/CardEffects'
import WhatsAppButton from './components/WhatsAppButton'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Resume from './components/Resume'
import Portfolio from './components/Portfolio'
import Gallery from './components/Gallery'
import SocialPosts from './components/SocialPosts'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const s = useSettings()
  const [loaded, setLoaded] = useState(false)
  const finish = useCallback(() => setLoaded(true), [])

  useSmoothScroll()

  useEffect(() => {
    const root = document.documentElement.style
    if (s.accent_color) root.setProperty('--accent', s.accent_color)
    if (s.bg_color) root.setProperty('--bg', s.bg_color)
    if (s.text_color) root.setProperty('--text', s.text_color)

    const title = s.seo_title || s.brand_name
    if (title) document.title = title
    if (s.seo_description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', s.seo_description)
    }
  }, [s])

  return (
    <>
      <AnimatePresence>
        {!loaded && <Loader key="loader" name={s.brand_name} onDone={finish} />}
      </AnimatePresence>

      <Cursor />
      <CardEffects />
      <ScrollProgress />
      <Navbar s={s} />
      <main>
        <Hero key={String(loaded)} s={s} />
        <Marquee s={s} />
        <About s={s} />
        <Resume s={s} />
        <Portfolio s={s} />
        <Gallery s={s} />
        <SocialPosts s={s} />
        <Services s={s} />
        <Testimonials s={s} />
        <Contact s={s} />
      </main>
      <Footer s={s} />
      <WhatsAppButton s={s} />
    </>
  )
}