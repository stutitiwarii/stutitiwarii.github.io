import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useLang } from '../i18n/context'

const LAYERS = 7 // slices that give the standee its thickness
const DZ = 2 // pixels between slices
const HALF = (LAYERS * DZ) / 2

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const num = (v, d) => (v === undefined || v === '' || !Number.isFinite(Number(v)) ? d : Number(v))

export default function Turnable({ s, src, back, alt, wrapStyle, entry, calm }) {
  const { lang } = useLang()
  const hi = lang === 'hi'

  const angle = useMotionValue(0)
  const anim = useRef(null)
  const idle = useRef(null)
  const touched = useRef(false)
  const drag = useRef({ on: false, x: 0, a: 0, lastX: 0, lastT: 0, v: 0 })
  const [used, setUsed] = useState(false)
  const [ratio, setRatio] = useState(0.257)
  const [frame, setFrame] = useState({ i: 0, flip: false })

  // photo spin settings
  const url = String(s.hero_spin_url || '')
  const count = Math.max(0, Math.round(num(s.hero_spin_count, 19)))
  const span = num(s.hero_spin_degrees, 180) >= 360 ? 360 : 180
  const mirror = s.hero_spin_mirror === 'true'
  const spin = /\{nn?\}/.test(url) && count >= 3
  const full = spin && (span >= 360 || mirror) // can go all the way round
  const frames = useMemo(
    () =>
      spin
        ? Array.from({ length: count }, (_, i) =>
            url.replace('{nn}', String(i + 1).padStart(2, '0')).replace('{n}', String(i + 1))
          )
        : [],
    [spin, url, count]
  )

  const shadow = useTransform(angle, (a) => 0.3 + 0.7 * Math.abs(Math.cos((a * Math.PI) / 180)))

  // which photo to show at this angle
  const frameFor = (a) => {
    if (mirror) {
      const t = ((a % 360) + 360) % 360
      return t <= 180
        ? { i: Math.round((t / 180) * (count - 1)), flip: false }
        : { i: Math.round(((360 - t) / 180) * (count - 1)), flip: true }
    }
    if (span >= 360) {
      const t = ((a % 360) + 360) % 360
      return { i: Math.round((t / 360) * count) % count, flip: false }
    }
    return { i: Math.round((clamp(a, 0, span) / span) * (count - 1)), flip: false }
  }

  useEffect(() => {
    if (!spin) return
    const apply = (a) =>
      setFrame((f) => {
        const n = frameFor(a)
        return n.i === f.i && n.flip === f.flip ? f : n
      })
    apply(angle.get())
    return angle.on('change', apply)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin, count, span, mirror, angle])

  const goTo = (target, soft) => {
    anim.current?.stop?.()
    anim.current = animate(angle, target, { type: 'spring', stiffness: soft ? 55 : 85, damping: soft ? 12 : 15 })
  }

  // after a few quiet seconds she turns back to the front
  const armReturn = () => {
    clearTimeout(idle.current)
    if (s.hero_turn_return === 'false') return
    idle.current = setTimeout(() => {
      const a = angle.get()
      goTo(spin && !full ? 0 : Math.round(a / 360) * 360, true)
    }, 6000)
  }

  const mark = () => {
    touched.current = true
    setUsed(true)
    clearTimeout(idle.current)
  }

  const down = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    mark()
    anim.current?.stop?.()
    drag.current = { on: true, x: e.clientX, a: angle.get(), lastX: e.clientX, lastT: performance.now(), v: 0 }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const move = (e) => {
    const d = drag.current
    if (!d.on) return
    const per = spin ? span / 420 : 0.6 // degrees per pixel dragged
    const next = d.a - (e.clientX - d.x) * per // dragging left turns her round
    const now = performance.now()
    const dt = Math.max(1, now - d.lastT)
    d.v = ((-(e.clientX - d.lastX) * per) / dt) * 0.6 + d.v * 0.4
    d.lastX = e.clientX
    d.lastT = now
    angle.set(spin && !full ? clamp(next, 0, span) : next)
  }

  const up = (e) => {
    const d = drag.current
    if (!d.on) return
    d.on = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (performance.now() - d.lastT > 90) d.v = 0
    const a = angle.get()
    let target
    if (!spin) target = Math.round((a + d.v * 160) / 180) * 180 // settle on the front or the back
    else if (full) target = a + d.v * 220
    else target = clamp(a + d.v * 220, 0, span)
    goTo(target)
    armReturn()
  }

  // button: turn her to the other side
  const flip = () => {
    mark()
    const a = angle.get()
    let target
    if (!spin) target = (Math.round(a / 180) + 1) * 180
    else if (full) target = a + 180
    else target = a < span / 2 ? span : 0
    goTo(target)
    armReturn()
  }

  const key = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      flip()
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      mark()
      const a = angle.get() + (e.key === 'ArrowLeft' ? 30 : -30)
      goTo(spin && !full ? clamp(a, 0, span) : a)
      armReturn()
    }
  }

  // one small tease turn after the page opens, so people notice she can turn
  useEffect(() => {
    if (calm || s.hero_turn === 'false') return
    const t1 = setTimeout(() => {
      if (!touched.current) goTo(spin && !full ? Math.min(span, 30) : 24, true)
    }, 2400)
    const t2 = setTimeout(() => {
      if (!touched.current) goTo(0, true)
    }, 3500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(idle.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calm, spin])

  const measure = (e) => {
    const im = e.currentTarget
    if (im.naturalWidth && im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight)
  }

  // switched off in Supabase: just a still picture
  if (s.hero_turn === 'false') {
    return <motion.img src={src} alt={alt} draggable={false} style={wrapStyle} {...entry} />
  }

  const hint = hi ? 'घुमाकर देखें' : spin && !full ? '← Drag to turn' : 'Drag to turn'

  return (
    <motion.div
      className="tn"
      role="img"
      aria-label={alt}
      tabIndex={0}
      onKeyDown={key}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{ ...wrapStyle, pointerEvents: 'auto', aspectRatio: String(ratio) }}
      {...entry}
    >
      {!spin && (
        <>
          <div className="tn-floor" aria-hidden="true">
            <motion.i style={{ scaleX: shadow }} />
          </div>
          <motion.div className="tn-body" style={{ rotateY: angle }}>
            {Array.from({ length: LAYERS }, (_, i) => (
              <img
                key={i}
                className="tn-layer"
                src={src}
                alt=""
                draggable={false}
                style={{ transform: `translateZ(${(i - (LAYERS - 1) / 2) * DZ}px)` }}
              />
            ))}
            <img
              className="tn-face"
              src={src}
              alt=""
              draggable={false}
              onLoad={measure}
              style={{ transform: `translateZ(${HALF + 0.6}px)` }}
            />
            <img
              className={`tn-face ${back ? '' : 'blank'}`}
              src={back || src}
              alt=""
              draggable={false}
              style={{ transform: `rotateY(180deg) translateZ(${HALF + 0.6}px)${back ? '' : ' scaleX(-1)'}` }}
            />
          </motion.div>
        </>
      )}

      {spin &&
        frames.map((f, i) => (
          <img
            key={f}
            className="tn-frame"
            src={f}
            alt=""
            draggable={false}
            onLoad={i === 0 ? measure : undefined}
            style={{ opacity: i === frame.i ? 1 : 0, transform: frame.flip ? 'scaleX(-1)' : undefined }}
          />
        ))}

      <button
        type="button"
        className={`tn-pill ${used ? 'used' : ''}`}
        onClick={flip}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span aria-hidden="true">⟲</span> {hint}
      </button>
    </motion.div>
  )
}