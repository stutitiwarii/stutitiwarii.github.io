import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTable } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'
import Reveal from './Reveal'
import RevealText from './RevealText'

// spreads n points evenly over a sphere
function spherePoints(n) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - ((i + 0.5) / n) * 2
    const r = Math.sqrt(1 - y * y)
    const a = i * golden
    return [Math.cos(a) * r, y, Math.sin(a) * r]
  })
}

// turn a point around the Y axis (ay), then the X axis (ax)
function rotate([x, y, z], ay, ax) {
  const cy = Math.cos(ay), sy = Math.sin(ay)
  const cx = Math.cos(ax), sx = Math.sin(ax)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  return [x1, y * cx - z1 * sx, y * sx + z1 * cx]
}

const persp = (z) => 1 / (1 - z * 0.18)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export default function BrandGlobe({ s }) {
  const { lang } = useLang()
  const calm = useReducedMotion()
  const brands = useTable('brands').filter((b) => b.is_visible !== false)
  const [open, setOpen] = useState(null)

  const stage = useRef(null)
  const canvas = useRef(null)
  const itemEls = useRef([])
  const state = useRef({
    ay: 0, ax: -0.25, vx: 0, vy: 0, auto: 0,
    hover: false, down: false, dragging: false, blocked: false,
    visible: true, size: 560, moved: 0, lastX: 0, lastY: 0,
    resume: null, color: '#c9a24b',
  })

  const pts = useMemo(() => spherePoints(brands.length), [brands.length])
  const speedNum = Number(s.brands_speed)
  const speed = s.brands_speed === undefined || s.brands_speed === '' || !Number.isFinite(speedNum) ? 1 : speedNum

  // animation loop
  useEffect(() => {
    const S = state.current
    const el = stage.current
    const cv = canvas.current
    if (!el || !cv || brands.length === 0) return

    const ctx = cv.getContext('2d')
    const base = calm ? 0 : 0.0045 * speed
    let raf
    let last = performance.now()
    let frame = 0

    const resize = () => {
      const w = el.clientWidth
      S.size = w
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = w * dpr
      cv.height = w * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      el.style.setProperty('--gi', `${clamp(w * 0.105, 38, 66)}px`)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // do nothing while the globe is off screen
    const io = new IntersectionObserver(([e]) => { S.visible = e.isIntersecting })
    io.observe(el)

    const drawGrid = (R, c) => {
      const front = new Path2D()
      const back = new Path2D()
      const add = (a, b) => {
        const path = a[2] + b[2] > 0 ? front : back
        const pa = persp(a[2]), pb = persp(b[2])
        path.moveTo(c + a[0] * R * pa, c + a[1] * R * pa)
        path.lineTo(c + b[0] * R * pb, c + b[1] * R * pb)
      }

      // latitude rings
      for (const lat of [-60, -30, 0, 30, 60]) {
        const y = Math.sin((lat * Math.PI) / 180)
        const r = Math.cos((lat * Math.PI) / 180)
        let prev = null
        for (let i = 0; i <= 48; i++) {
          const t = (i / 48) * Math.PI * 2
          const p = rotate([r * Math.cos(t), y, r * Math.sin(t)], S.ay, S.ax)
          if (prev) add(prev, p)
          prev = p
        }
      }
      // longitude lines
      for (let k = 0; k < 12; k++) {
        const lon = (k * Math.PI) / 6
        let prev = null
        for (let i = 0; i <= 24; i++) {
          const lat = -Math.PI / 2 + (i / 24) * Math.PI
          const p = rotate([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)], S.ay, S.ax)
          if (prev) add(prev, p)
          prev = p
        }
      }

      ctx.lineWidth = 1
      ctx.strokeStyle = S.color
      ctx.globalAlpha = 0.07
      ctx.stroke(back)
      ctx.globalAlpha = 0.2
      ctx.stroke(front)
      ctx.globalAlpha = 1
    }

    const render = () => {
      const R = S.size * 0.38
      const c = S.size / 2
      ctx.clearRect(0, 0, S.size, S.size)
      drawGrid(R, c)

      pts.forEach((p, i) => {
        const node = itemEls.current[i]
        if (!node) return
        const [x, y, z] = rotate(p, S.ay, S.ax)
        const pp = persp(z)
        const d = (z + 1) / 2
        node.style.transform =
          `translate(-50%,-50%) translate(${(x * R * pp).toFixed(1)}px,${(y * R * pp).toFixed(1)}px) scale(${(0.6 + 0.55 * d).toFixed(3)})`
        node.style.opacity = (0.22 + 0.78 * d).toFixed(2)
        node.style.zIndex = String(10 + Math.round(d * 100))
        node.style.pointerEvents = z > -0.15 ? 'auto' : 'none'
      })
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (!S.visible) { last = now; return }
      const dt = Math.min(now - last, 50) / 16.67
      last = now

      if (!S.dragging) {
        const target = S.hover || S.blocked ? 0 : base
        S.auto += (target - S.auto) * Math.min(1, 0.07 * dt)
        S.ay += (S.auto + S.vy) * dt
        S.ax = clamp(S.ax + S.vx * dt, -1.3, 1.3)
        const f = Math.pow(0.94, dt)
        S.vx *= f
        S.vy *= f
      }

      if (frame++ % 40 === 0) {
        S.color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c9a24b'
      }
      render()
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [pts, speed, calm, brands.length])

  // popup: lock page scroll, close on Esc
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const onDown = (e) => {
    const S = state.current
    S.down = true
    S.moved = 0
    S.lastX = e.clientX
    S.lastY = e.clientY
    S.vx = 0
    S.vy = 0
    clearTimeout(S.resume)
    if (e.pointerType !== 'mouse') S.blocked = true
  }

  const onMove = (e) => {
    const S = state.current
    if (!S.down) return
    const dx = e.clientX - S.lastX
    const dy = e.clientY - S.lastY
    S.lastX = e.clientX
    S.lastY = e.clientY
    S.moved += Math.abs(dx) + Math.abs(dy)

    if (S.moved > 6 && !S.dragging) {
      S.dragging = true
      stage.current?.setPointerCapture?.(e.pointerId)
      stage.current?.classList.add('dragging')
    }
    if (S.dragging) {
      S.ay += dx * 0.007
      S.ax = clamp(S.ax + dy * 0.007, -1.3, 1.3)
      S.vy = dx * 0.007
      S.vx = dy * 0.007
    }
  }

  const onUp = (e) => {
    const S = state.current
    S.down = false
    if (S.dragging) {
      S.dragging = false
      stage.current?.releasePointerCapture?.(e.pointerId)
      stage.current?.classList.remove('dragging')
    }
    if (e.pointerType !== 'mouse') {
      clearTimeout(S.resume)
      S.resume = setTimeout(() => { S.blocked = false }, 2500)
    }
  }

  if (brands.length === 0) return null

  const hint =
    lang === 'hi'
      ? 'घुमाने के लिए खींचें · विवरण के लिए लोगो पर क्लिक करें'
      : 'Drag to rotate · Click a logo for details'

  return (
    <section id="brands" className="section brands-sec">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <small>{s.brands_tagline}</small>
            <RevealText as="h2" text={s.brands_title} />
            {s.brands_subtitle && <p className="brands-sub">{s.brands_subtitle}</p>}
          </div>
        </Reveal>

        <Reveal>
          <div
            className="globe-stage"
            ref={stage}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') state.current.hover = true }}
            onPointerLeave={() => { state.current.hover = false }}
          >
            <div className="globe-glass" />
            <canvas ref={canvas} className="globe-canvas" />

            {brands.map((b, i) => (
              <button
                key={b.id}
                type="button"
                className="globe-item"
                ref={(n) => { itemEls.current[i] = n }}
                aria-label={b.name}
                onClick={() => {
                  if (state.current.moved > 6) return // it was a drag, not a click
                  setOpen(b)
                }}
              >
                {b.logo_url ? (
                  <img src={b.logo_url} alt="" draggable={false} />
                ) : (
                  <span className="gi-fallback">{(b.name || '?').charAt(0)}</span>
                )}
                <span className="globe-tip">{b.name}</span>
              </button>
            ))}

            <div className="globe-shine" />
          </div>
        </Reveal>

        <p className="globe-hint">{hint}</p>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="svc-modal brand-modal"
              data-lenis-prevent
              initial={{ scale: 0.94, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
              <div className="brand-logo">
                {open.logo_url ? <img src={open.logo_url} alt={open.name} /> : <span>{(open.name || '?').charAt(0)}</span>}
              </div>
              {open.category && <small className="brand-cat">{open.category}</small>}
              <h3>{open.name}</h3>
              {open.description && (
                <div className="svc-body">
                  <p>{open.description}</p>
                </div>
              )}
              {open.website_url && (
                <a className="btn" href={open.website_url} target="_blank" rel="noopener noreferrer">
                  {lang === 'hi' ? 'वेबसाइट देखें' : 'Visit website'}
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}