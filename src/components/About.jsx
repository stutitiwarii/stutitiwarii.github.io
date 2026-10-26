import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

function Counter({ to, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to])

  return <span ref={ref}>{n}{suffix}</span>
}

export default function About({ s }) {
  const { t } = useLang()
  const stats = useTable('stats')

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about-grid">
          <Reveal className="about-photo">
            <img src={s.about_image} alt={s.brand_name} loading="lazy" />
          </Reveal>

          <Reveal delay={0.15} className="about-text">
            <small>{s.about_tagline}</small>
            <RevealText as="h2" text={s.about_title} />
            <p>{s.about_text}</p>

            <ul className="about-info">
              {s.about_location && <li><b>{t('location')}:</b>{s.about_location}</li>}
              {s.email && <li><b>{t('email')}:</b>{s.email}</li>}
              {s.about_availability && <li><b>{t('status')}:</b>{s.about_availability}</li>}
            </ul>

            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
              <a className="btn" href="#contact">{t('lets_talk')}</a>
              {s.resume_url && (
                <a className="btn ghost" href={s.resume_url} target="_blank" rel="noreferrer">{t('download_resume')}</a>
              )}
            </div>
          </Reveal>
        </div>

        {stats.length > 0 && (
          <div className="stats">
            {stats.map((st, i) => (
              <Reveal key={st.id} delay={i * 0.1} className="stat">
                <strong><Counter to={st.value} suffix={st.suffix} /></strong>
                <span>{st.label}</span>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}