import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export default function Cursor() {
  const [enabled] = useState(canHover)
  const [hover, setHover] = useState(false)
  const [hidden, setHidden] = useState(true)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.4 })
  const ringY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.4 })

  useEffect(() => {
    if (!enabled) return
    document.body.classList.add('has-cursor')

    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHidden(false)
    }
    const over = (e) =>
      setHover(!!e.target.closest?.('a, button, [role="button"], .work-card, .yt-wrap, .slide'))
    const leave = () => setHidden(true)

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    document.addEventListener('mouseleave', leave)
    return () => {
      document.body.classList.remove('has-cursor')
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.removeEventListener('mouseleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hover ? 1.8 : 1, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        className="cursor-dot"
        style={{ x, y }}
        animate={{ scale: hover ? 0.4 : 1, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}