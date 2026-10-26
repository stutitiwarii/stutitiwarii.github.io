import { useEffect } from 'react'

const SELECTOR = '.work-media, .post-media, .about-photo img, .slider'

export default function MediaReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('js-reveal')

    // hosts = the (never hidden) parent boxes we watch; hostMap = host -> images inside it
    const hostMap = new Map()

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          hostMap.get(e.target)?.forEach((el) => el.classList.add('in-view'))
          hostMap.delete(e.target)
          io.unobserve(e.target)
        })
      },
      { threshold: 0.15 }
    )

    const seen = new WeakSet()
    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        const host = el.parentElement || el
        if (!hostMap.has(host)) {
          hostMap.set(host, [])
          io.observe(host)
        }
        hostMap.get(host).push(el)
      })
    }
    scan()

    // picks up images that appear later (for example after Supabase data loads)
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
      document.documentElement.classList.remove('js-reveal')
    }
  }, [])

  return null
}