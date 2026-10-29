import { useEffect, useState } from 'react'

// the sections on the page (in page order) and the one in the middle of the screen
export default function useActiveSection() {
  const [ids, setIds] = useState([])
  const [active, setActive] = useState('')

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    let io

    const scan = () => {
      const els = Array.from(main.children).filter((el) => el.tagName === 'SECTION' && el.id)
      const next = els.map((el) => el.id)
      setIds((prev) => (prev.join('|') === next.join('|') ? prev : next))

      io?.disconnect()
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(e.target.id)
          })
        },
        { rootMargin: '-45% 0px -50% 0px' }
      )
      els.forEach((el) => io.observe(el))
    }

    scan()
    // sections appear or disappear (data loading, hidden in section_order)
    const mo = new MutationObserver(scan)
    mo.observe(main, { childList: true })
    return () => {
      mo.disconnect()
      io?.disconnect()
    }
  }, [])

  return { ids, active }
}