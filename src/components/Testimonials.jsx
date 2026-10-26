import { useTable } from '../hooks/useSupabase'
import Reveal from './Reveal'

export default function Testimonials({ s }) {
  const list = useTable('testimonials')
  if (list.length === 0) return null

  return (
    <section id="testimonials" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>Testimonials</small>
            <h2>{s.testimonials_title}</h2>
          </div>
        </Reveal>

        <div className="cards-grid">
          {list.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1}>
              <blockquote className="quote-card">
                <p>{t.message}</p>
                <div className="quote-who">
                  {t.avatar_url && <img src={t.avatar_url} alt={t.name} loading="lazy" />}
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}