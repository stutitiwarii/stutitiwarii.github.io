import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

function QuoteCard({ item }) {
  return (
    <blockquote className="quote-card tm-card">
      <p>{item.message}</p>
      <div className="quote-who">
        {item.avatar_url && <img src={item.avatar_url} alt={item.name} loading="lazy" draggable={false} />}
        <div>
          <strong>{item.name}</strong>
          <span>{item.role}</span>
        </div>
      </div>
    </blockquote>
  )
}

// one moving row: the cards are repeated so the strip is always wider than the screen
function Row({ items, reverse, perCard }) {
  const reps = Math.max(1, Math.ceil(6 / items.length))
  const group = Array.from({ length: reps }, () => items).flat()
  const dur = Math.max(20, group.length * perCard)

  return (
    <div className="tm-row">
      <div className={`tm-track ${reverse ? 'rev' : ''}`} style={{ animationDuration: `${dur}s` }}>
        {[0, 1].map((k) => (
          <div className="tm-group" key={k} aria-hidden={k === 1 ? 'true' : undefined}>
            {group.map((item, i) => (
              <QuoteCard key={`${k}-${i}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Testimonials({ s }) {
  const { t } = useLang()
  const list = useTable('testimonials')
  if (list.length === 0) return null

  const perNum = Number(s.testimonials_speed)
  const perCard = perNum > 0 ? perNum : 7 // seconds per card: bigger = slower

  // 4 or more quotes: two rows going opposite ways; fewer: one row
  const two = list.length >= 4
  const rowA = two ? list.filter((_, i) => i % 2 === 0) : list
  const rowB = two ? list.filter((_, i) => i % 2 === 1) : []

  return (
    <section id="testimonials" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{t('testimonials')}</small>
            <RevealText as="h2" text={s.testimonials_title} />
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="tm-wrap">
          <Row items={rowA} perCard={perCard} />
          {rowB.length > 0 && <Row items={rowB} reverse perCard={perCard} />}
        </div>
      </Reveal>
    </section>
  )
}