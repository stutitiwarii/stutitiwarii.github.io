import { useEffect } from 'react'

const SELECTOR = '.work-card, .service-card, .quote-card'
const TILT = '.service-card, .quote-card'

export default function CardEffects() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine) return

    const move = (e) => {
      const card = e.target.closest?.(SELECTOR)
      if (!card) return
      const r = card.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      card.style.setProperty('--mx', `${px}px`)
      card.style.setProperty('--my', `${py}px`)
      if (!calm && card.matches(TILT)) {
        card.style.setProperty('--rx', `${(0.5 - py / r.height) * 8}deg`)
        card.style.setProperty('--ry', `${(px / r.width - 0.5) * 8}deg`)
      }
    }

    const out = (e) => {
      const card = e.target.closest?.(SELECTOR)
      if (!card || card.contains(e.relatedTarget)) return
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseout', out)
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseout', out)
    }
  }, [])

  return null
}