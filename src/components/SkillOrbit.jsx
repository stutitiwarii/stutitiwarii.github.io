import { useMemo } from 'react'
import { useTable } from '../hooks/useSupabase'
import Reveal from './Reveal'
import RevealText from './RevealText'

// ring diameters (% of the box) for 2, 3 or 4 rings, and seconds per full turn
const LAYOUTS = { 2: [38, 70], 3: [34, 58, 82], 4: [30, 50, 70, 90] }
const DURATIONS = [38, 52, 68, 84]

export default function SkillOrbit({ s }) {
  const skills = useTable('skills')
  const list = useMemo(
    () => skills.filter((k) => k.in_orbit !== false && k.name).slice(0, 40),
    [skills]
  )

  // more skills = more rings; skills are shared over the rings by ring size
  const rings = useMemo(() => {
    const n = list.length
    const count = n <= 8 ? 2 : n <= 18 ? 3 : 4
    const diam = LAYOUTS[count]
    const total = diam.reduce((a, b) => a + b, 0)
    let at = 0
    return diam
      .map((d, i) => {
        const take = i === diam.length - 1 ? n - at : Math.round((n * d) / total)
        const items = list.slice(at, at + take)
        at += take
        return { d, t: DURATIONS[i], rev: i % 2 === 1, items }
      })
      .filter((r) => r.items.length > 0)
  }, [list])

    if (list.length === 0 || s.show_orbit === 'false') return null

  const num = Number(s.orbit_speed)
  const speed = s.orbit_speed === undefined || s.orbit_speed === '' || !Number.isFinite(num) ? 1 : num
  const coreNum = Number(s.orbit_core_size)
  const core = Number.isFinite(coreNum) && coreNum > 0 ? Math.min(40, Math.max(8, coreNum)) : 17
  const photo = s.orbit_image || s.about_image

  return (
    <section id="toolkit" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{s.orbit_tagline}</small>
            <RevealText as="h2" text={s.orbit_title} />
            {s.orbit_subtitle && <p className="brands-sub">{s.orbit_subtitle}</p>}
          </div>
        </Reveal>

        <Reveal>
          <div className={`orbit ${speed <= 0 ? 'still' : ''}`} style={{ '--core': `${core}cqw` }}>
            <div className="orbit-core">
              {photo ? (
                <img src={photo} alt={s.brand_name} loading="lazy" draggable={false} />
              ) : (
                <span>{(s.brand_name || 'S').charAt(0)}</span>
              )}
            </div>

            {rings.map((r, ri) => (
              <div
                key={ri}
                className={`orbit-ring ${r.rev ? 'rev' : ''}`}
                style={{ '--d': `${r.d}cqw`, '--t': `${speed > 0 ? r.t / speed : r.t}s` }}
              >
                {r.items.map((k, i) => (
                  <div
                    key={k.id}
                    className="orbit-item"
                    style={{ '--a': `${(i * 360) / r.items.length + ri * 28}deg` }}
                  >
                    <div className="orbit-chip">
                      {k.icon_url && <img src={k.icon_url} alt="" draggable={false} />}
                      <span>{k.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}