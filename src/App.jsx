import { useEffect } from 'react'
import { useSettings } from './hooks/useSupabase'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Resume from './components/Resume'
import Portfolio from './components/Portfolio'
import Gallery from './components/Gallery'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const s = useSettings()

  useEffect(() => {
    const root = document.documentElement.style
    if (s.accent_color) root.setProperty('--accent', s.accent_color)
    if (s.bg_color) root.setProperty('--bg', s.bg_color)
    if (s.text_color) root.setProperty('--text', s.text_color)
    if (s.brand_name) document.title = s.brand_name
  }, [s])

  return (
    <>
      <Navbar s={s} />
      <main>
        <Hero s={s} />
        <About s={s} />
        <Resume s={s} />
        <Portfolio s={s} />
        <Gallery s={s} />
        <Services s={s} />
        <Testimonials s={s} />
        <Contact s={s} />
      </main>
      <Footer s={s} />
    </>
  )
}