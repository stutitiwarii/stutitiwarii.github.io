import { motion } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import Reveal from './Reveal'
   import RevealText from './RevealText'

function Timeline({ title, items, titleKey, orgKey }) {
  return (
    <div className="resume-col">
      <Reveal>
        <h3>{title}</h3>
      </Reveal>
      <div className="timeline">
        {items.map((it, i) => (
          <Reveal key={it.id} delay={i * 0.1} y={30} className="t-item">
            <span className="t-period">{it.period}</span>
            <h4>{it[titleKey]}</h4>
            <div className="t-org">{it[orgKey]}</div>
            {it.description && <p>{it.description}</p>}
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export default function Resume({ s }) {
  const education = useTable('education')
  const experience = useTable('experience')
  const skills = useTable('skills')

  // group skills by category
  const groups = skills.reduce((acc, sk) => {
    const key = sk.category || 'Skills'
    ;(acc[key] = acc[key] || []).push(sk)
    return acc
  }, {})

  return (
    <section id="resume" className="section alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>Background</small>
            <h2>{s.experience_title ? `${s.education_title} & ${s.experience_title}` : 'Resume'}</h2>
          </div>
        </Reveal>

        <div className="resume-cols">
          <Timeline title={s.education_title || 'Education'} items={education} titleKey="degree" orgKey="institution" />
          <Timeline title={s.experience_title || 'Experience'} items={experience} titleKey="role" orgKey="company" />
        </div>

        {skills.length > 0 && (
          <div className="skills-wrap">
            <Reveal><h3>{s.skills_title || 'Skills'}</h3></Reveal>
            <div className="skills-grid">
              {Object.entries(groups).map(([cat, list]) => (
                <div className="skill-group" key={cat}>
                  <Reveal><h4>{cat}</h4></Reveal>
                  {list.map((sk, i) => (
                    <Reveal key={sk.id} delay={i * 0.08} y={20} className="skill">
                      <div className="skill-top">
                        <span>{sk.name}</span>
                        <em>{sk.level}%</em>
                      </div>
                      <div className="bar">
                        <motion.div
                          className="bar-fill"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${sk.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.4, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </Reveal>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {s.resume_url && (
          <Reveal className="resume-cta">
            <a className="btn" href={s.resume_url} target="_blank" rel="noreferrer">Download Full Resume (PDF)</a>
          </Reveal>
        )}
      </div>
    </section>
  )
}