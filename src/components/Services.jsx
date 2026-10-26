import { useTable } from '../hooks/useSupabase'
import Reveal from './Reveal'

export default function Services({ s }) {
  const services = useTable('services')

  return (
    <section id="services" className="section alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>Services</small>
            <h2>{s.services_title}</h2>
          </div>
        </Reveal>

        <div className="cards-grid">
          {services.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.1}>
              <div className="service-card">
                <div className="service-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}