import { useCallback, useEffect, useRef, useState } from 'react'
import { useTable } from '../hooks/useSupabase'
import Reveal from './Reveal'

const NAMES = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', youtube: 'YouTube', x: 'X' }

export default function SocialPosts({ s }) {
  const posts = useTable('social_posts').filter((p) => p.is_visible !== false)
  const track = useRef(null)
  const [paused, setPaused] = useState(false)

  const seconds = Number(s.social_seconds) || 4
  const autoplay = s.social_autoplay !== 'false'

  const slide = useCallback((dir) => {
    const el = track.current
    const card = el?.querySelector('.post-card')
    if (!el || !card) return
    const step = card.offsetWidth + 24
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    else el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  // auto slide
  useEffect(() => {
    if (!autoplay || paused || posts.length < 2) return
    const t = setInterval(() => slide(1), seconds * 1000)
    return () => clearInterval(t)
  }, [autoplay, paused, posts.length, seconds, slide])

  if (posts.length === 0) return null

  return (
    <section id="social" className="section alt">
      <div className="container">
        <Reveal>
          <div className="posts-head">
            <div className="section-head">
              <small>{s.social_tagline}</small>
              <h2>{s.social_title}</h2>
            </div>
            {posts.length > 1 && (
              <div className="posts-arrows">
                <button onClick={() => slide(-1)} aria-label="Previous">‹</button>
                <button onClick={() => slide(1)} aria-label="Next">›</button>
              </div>
            )}
          </div>
        </Reveal>

        <div
          className="posts-track"
          ref={track}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
        >
          {posts.map((p) => {
            const key = (p.platform || '').toLowerCase()
            const name = NAMES[key] || p.platform
            return (
              <a
                key={p.id}
                className="post-card"
                href={p.post_url}
                target="_blank"
                rel="noopener noreferrer"
                data-platform={key}
              >
                <div className="post-media">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title || name} loading="lazy" draggable={false} />
                  ) : (
                    <div className="post-fallback">{name}</div>
                  )}
                  <span className="post-badge">{name}</span>
                </div>
                <div className="post-body">
                  {p.title && <h3>{p.title}</h3>}
                  {p.caption && <p>{p.caption}</p>}
                  <span className="post-link">View on {name} →</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}