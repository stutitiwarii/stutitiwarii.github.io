import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

export default function Testimonials({ s }) {
  const { t } = useLang()
  const list = useTable('testimonials')
  if (list.length === 0) return null

  return (
    <section id="testimonials" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{t('testimonials')}</small>
            <RevealText as="h2" text={s.testimonials_title} />
          </div>
        </Reveal>

        <div className="cards-grid">
          {list.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.1}>
              <blockquote className="quote-card">
                <p>{item.message}</p>
                <div className="quote-who">
                  {item.avatar_url && <img src={item.avatar_url} alt={item.name} loading="lazy" />}
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
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