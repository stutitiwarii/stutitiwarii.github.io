import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useLang } from '../i18n/context'
import { DEFAULT_GARLAND, garlandUri, okHex, parseList } from '../festivals'

const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const TAU = Math.PI * 2

function rgba(hex, a) {
  let h = String(hex || '').replace('#', '')
  if (h.length === 3) h = h.split('').map((x) => x + x).join('')
  const n = parseInt(h, 16)
  if (h.length !== 6 || !Number.isFinite(n)) return `rgba(255,255,255,${a})`
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

// default colours when a festival row has none
const DEFAULTS = {
  petals: ['#ffb703', '#fb8500', '#ff6b35', '#ffd166'],
  confetti: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
  tricolor: ['#ff9933', '#ffffff', '#138808'],
  colors: ['#ff3d9a', '#ffd23f', '#3bceac', '#4cc9f0', '#9b5de5'],
  kites: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
  fireworks: ['#ffd166', '#ff6b6b', '#4ecdc4', '#ffffff', '#c77dff'],
  sparks: ['#ff7a18', '#ffb347', '#ffd27a'],
  lamps: ['#ffb22e'],
  stars: ['#ffffff'],
  snow: ['#ffffff'],
  moon: ['#ffffff'],
}

/* every effect: a function that returns { update(seconds), draw(canvasContext) } */

function snow(W, H, cols, k, ink) {
  const f = Array.from({ length: Math.round(90 * k) + 20 }, () => ({
    x: rand(0, W), y: rand(-H, H), r: rand(1, 3.6), v: rand(25, 70), a: rand(0, TAU), s: rand(0.5, 1.6),
  }))
  return {
    update(dt) {
      for (const p of f) {
        p.y += p.v * dt
        p.a += p.s * dt
        p.x += Math.sin(p.a) * 18 * dt
        if (p.y > H + 5) { p.y = -5; p.x = rand(0, W) }
      }
    },
    draw(c) {
      c.fillStyle = ink
      c.globalAlpha = 0.85
      for (const p of f) { c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill() }
      c.globalAlpha = 1
    },
  }
}

function stars(W, H, cols, k, ink) {
  const S = Array.from({ length: Math.round(80 * k) + 20 }, () => ({
    x: rand(0, W), y: rand(0, H), r: rand(0.6, 1.8), ph: rand(0, TAU), sp: rand(0.8, 2.4),
  }))
  let t = 0
  return {
    update(dt) { t += dt },
    draw(c) {
      c.fillStyle = ink
      for (const s of S) {
        c.globalAlpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))
        c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill()
      }
      c.globalAlpha = 1
    },
  }
}

function moon(W, H) {
  let t = 0
  return {
    update(dt) { t += dt },
    draw(c) {
      const size = W < 700 ? 58 : 84
      const x = W * (W < 700 ? 0.82 : 0.86)
      const y = H * 0.2 + Math.sin(t * 0.6) * 6
      const g = c.createRadialGradient(x, y, 0, x, y, size * 1.6)
      g.addColorStop(0, 'rgba(255,240,190,.28)')
      g.addColorStop(1, 'rgba(255,240,190,0)')
      c.fillStyle = g
      c.beginPath(); c.arc(x, y, size * 1.6, 0, TAU); c.fill()
      c.font = `${size}px serif`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText('🌙', x, y)
    },
  }
}

function petals(W, H, cols, k) {
  const make = (y) => ({
    x: rand(0, W), y, w: rand(7, 13), h: rand(4, 8), rot: rand(0, TAU), vr: rand(-2, 2),
    v: rand(30, 70), a: rand(0, TAU), s: rand(0.6, 1.4), col: pick(cols),
  })
  const P = Array.from({ length: Math.round(34 * k) + 8 }, () => make(rand(-H, H)))
  return {
    update(dt) {
      P.forEach((q, i) => {
        q.y += q.v * dt; q.a += q.s * dt; q.x += Math.sin(q.a) * 28 * dt; q.rot += q.vr * dt
        if (q.y > H + 20) P[i] = make(-20)
      })
    },
    draw(c) {
      c.globalAlpha = 0.88
      for (const q of P) {
        c.save(); c.translate(q.x, q.y); c.rotate(q.rot)
        c.fillStyle = q.col
        c.beginPath(); c.ellipse(0, 0, q.w, q.h * Math.abs(Math.cos(q.a) * 0.5 + 0.5) + 1.5, 0, 0, TAU); c.fill()
        c.restore()
      }
      c.globalAlpha = 1
    },
  }
}

function confetti(W, H, cols, k) {
  const make = (y) => ({
    x: rand(0, W), y, w: rand(6, 11), h: rand(3, 6), rot: rand(0, TAU), vr: rand(-4, 4),
    v: rand(50, 120), a: rand(0, TAU), s: rand(0.8, 2), col: pick(cols),
  })
  const P = Array.from({ length: Math.round(70 * k) + 15 }, () => make(rand(-H, H)))
  return {
    update(dt) {
      P.forEach((q, i) => {
        q.y += q.v * dt; q.a += q.s * dt; q.x += Math.sin(q.a) * 22 * dt; q.rot += q.vr * dt
        if (q.y > H + 20) P[i] = make(-20)
      })
    },
    draw(c) {
      for (const q of P) {
        c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.scale(1, Math.cos(q.a * 2))
        c.fillStyle = q.col
        c.fillRect(-q.w / 2, -q.h / 2, q.w, q.h)
        c.restore()
      }
    },
  }
}

// floating diyas that rise slowly and flicker
function lamps(W, H, cols, k) {
  const make = (y) => ({ x: rand(0, W), y, r: rand(9, 17), v: rand(14, 30), a: rand(0, TAU), s: rand(0.4, 1), ph: rand(0, TAU) })
  const L = Array.from({ length: Math.round(11 * k) + 4 }, () => make(rand(H * 0.1, H + 40)))
  return {
    update(dt) {
      L.forEach((l, i) => {
        l.y -= l.v * dt; l.a += l.s * dt; l.ph += dt * 9; l.x += Math.sin(l.a) * 16 * dt
        if (l.y < -40) L[i] = make(H + 40)
      })
    },
    draw(c) {
      for (const l of L) {
        const fade = Math.min(1, Math.max(0, (l.y + 10) / (H * 0.25)))
        const fl = 0.85 + Math.sin(l.ph) * 0.15
        c.save(); c.translate(l.x, l.y); c.globalAlpha = fade
        const g = c.createRadialGradient(0, -l.r * 0.8, 0, 0, -l.r * 0.8, l.r * 3.2)
        g.addColorStop(0, `rgba(255,190,70,${0.45 * fl})`)
        g.addColorStop(1, 'rgba(255,190,70,0)')
        c.fillStyle = g
        c.beginPath(); c.arc(0, -l.r * 0.8, l.r * 3.2, 0, TAU); c.fill()
        c.fillStyle = '#b4540b'
        c.beginPath(); c.ellipse(0, 0, l.r, l.r * 0.55, 0, 0, Math.PI); c.closePath(); c.fill()
        c.fillStyle = '#e07a1f'
        c.beginPath(); c.ellipse(0, 0, l.r, l.r * 0.22, 0, 0, TAU); c.fill()
        const fh = l.r * 1.15 * fl
        c.fillStyle = '#ffe08a'
        c.beginPath()
        c.moveTo(0, -l.r * 0.1)
        c.quadraticCurveTo(l.r * 0.45, -fh * 0.55, 0, -fh)
        c.quadraticCurveTo(-l.r * 0.45, -fh * 0.55, 0, -l.r * 0.1)
        c.fill()
        c.restore()
      }
    },
  }
}

function fireworks(W, H, cols, k) {
  const rockets = []
  const sparksList = []
  const cap = Math.round(380 * Math.max(k, 0.55))
  let timer = rand(0.2, 0.8)
  const burst = (x, y) => {
    const col = pick(cols)
    const n = Math.round(rand(30, 52))
    for (let i = 0; i < n && sparksList.length < cap; i++) {
      const a = (i / n) * TAU + rand(-0.1, 0.1)
      const sp = rand(60, 190)
      sparksList.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.9, 1.6), age: 0, col: Math.random() < 0.2 ? pick(cols) : col })
    }
  }
  return {
    update(dt) {
      timer -= dt
      if (timer <= 0) {
        timer = rand(0.9, 1.9)
        rockets.push({ x: rand(W * 0.12, W * 0.88), y: H + 10, ty: rand(H * 0.15, H * 0.5), vy: -rand(380, 520) })
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.y += r.vy * dt
        if (r.y <= r.ty) { burst(r.x, r.y); rockets.splice(i, 1) }
      }
      for (let i = sparksList.length - 1; i >= 0; i--) {
        const s = sparksList[i]
        s.age += dt; s.vy += 90 * dt; s.vx *= 0.985; s.vy *= 0.985; s.x += s.vx * dt; s.y += s.vy * dt
        if (s.age > s.life) sparksList.splice(i, 1)
      }
    },
    draw(c) {
      c.globalCompositeOperation = 'lighter'
      c.fillStyle = '#fff3c4'
      for (const r of rockets) c.fillRect(r.x - 1.2, r.y, 2.4, 10)
      c.lineWidth = 2
      for (const s of sparksList) {
        c.globalAlpha = 1 - s.age / s.life
        c.strokeStyle = s.col
        c.beginPath(); c.moveTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04); c.lineTo(s.x, s.y); c.stroke()
      }
      c.globalAlpha = 1
      c.globalCompositeOperation = 'source-over'
    },
  }
}

// Holi: soft clouds of colour powder that burst and fade
function colorBursts(W, H, cols) {
  const bursts = []
  let timer = 0.2
  return {
    update(dt) {
      timer -= dt
      if (timer <= 0 && bursts.length < 5) {
        timer = rand(0.5, 1.1)
        const n = Math.round(rand(16, 24))
        bursts.push({
          x: rand(W * 0.1, W * 0.9), y: rand(H * 0.15, H * 0.75), age: 0, life: rand(1.8, 2.6),
          parts: Array.from({ length: n }, (_, i) => ({ a: (i / n) * TAU + rand(-0.2, 0.2), sp: rand(50, 200), r: rand(10, 26), col: pick(cols) })),
        })
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].age += dt
        if (bursts[i].age > bursts[i].life) bursts.splice(i, 1)
      }
    },
    draw(c) {
      for (const b of bursts) {
        const p = b.age / b.life
        const ease = 1 - Math.pow(1 - p, 3)
        for (const q of b.parts) {
          const x = b.x + Math.cos(q.a) * q.sp * ease
          const y = b.y + Math.sin(q.a) * q.sp * ease + p * p * 40
          const r = q.r * (0.6 + ease)
          const g = c.createRadialGradient(x, y, 0, x, y, r)
          g.addColorStop(0, rgba(q.col, (1 - p) * 0.55))
          g.addColorStop(1, rgba(q.col, 0))
          c.fillStyle = g
          c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill()
        }
      }
    },
  }
}

function kites(W, H, cols, k) {
  const make = (fromLeft) => ({
    x: fromLeft ? -60 : rand(0, W), y: rand(H * 0.12, H * 0.7), s: rand(16, 30), v: rand(24, 50),
    a: rand(0, TAU), sp: rand(0.5, 1.1), col: pick(cols),
  })
  const K = Array.from({ length: Math.round(6 * k) + 2 }, () => make(false))
  return {
    update(dt) {
      K.forEach((q, i) => {
        q.x += q.v * dt; q.a += q.sp * dt
        if (q.x > W + 80) K[i] = make(true)
      })
    },
    draw(c) {
      for (const q of K) {
        c.save()
        c.translate(q.x, q.y + Math.sin(q.a) * 26)
        c.rotate(Math.sin(q.a * 0.9) * 0.35 - 0.5)
        c.strokeStyle = q.col; c.lineWidth = 1.6
        c.beginPath(); c.moveTo(0, q.s * 1.1)
        for (let i = 1; i <= 18; i++) c.lineTo(Math.sin(q.a * 2 + i * 0.7) * 7, q.s * 1.1 + i * 5)
        c.stroke()
        c.fillStyle = q.col
        c.beginPath(); c.moveTo(0, -q.s); c.lineTo(q.s * 0.65, 0); c.lineTo(0, q.s * 1.1); c.lineTo(-q.s * 0.65, 0); c.closePath(); c.fill()
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1
        c.beginPath(); c.moveTo(0, -q.s); c.lineTo(0, q.s * 1.1); c.moveTo(-q.s * 0.65, 0); c.lineTo(q.s * 0.65, 0); c.stroke()
        c.restore()
      }
    },
  }
}

// rising embers (bonfire, Dussehra)
function sparks(W, H, cols, k) {
  const make = (y) => ({ x: rand(0, W), y, r: rand(1, 2.6), v: rand(40, 130), a: rand(0, TAU), s: rand(1, 3), col: pick(cols) })
  const P = Array.from({ length: Math.round(70 * k) + 15 }, () => make(rand(0, H)))
  return {
    update(dt) {
      P.forEach((q, i) => {
        q.y -= q.v * dt; q.a += q.s * dt; q.x += Math.sin(q.a) * 14 * dt
        if (q.y < -10) P[i] = make(H + 10)
      })
    },
    draw(c) {
      c.globalCompositeOperation = 'lighter'
      for (const q of P) {
        c.globalAlpha = Math.max(0, Math.min(1, q.y / (H * 0.8))) * 0.9
        c.fillStyle = q.col
        c.beginPath(); c.arc(q.x, q.y, q.r, 0, TAU); c.fill()
      }
      c.globalAlpha = 1
      c.globalCompositeOperation = 'source-over'
    },
  }
}

const FACT = { snow, stars, moon, petals, confetti, tricolor: confetti, lamps, fireworks, colors: colorBursts, kites, sparks }

/* the canvas that runs the effects */
function FxCanvas({ effects, colors, light }) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const ink = light ? '#7c90b8' : '#ffffff'
    let W = 0
    let H = 0
    let raf = 0
    let last = performance.now()
    let systems = []

    const build = () => {
      const k = Math.max(0.35, Math.min(1, W / 1100) * (W < 700 ? 0.75 : 1))
      systems = effects.map((name) => {
        const cols = name === 'tricolor' ? DEFAULTS.tricolor : colors.length ? colors : DEFAULTS[name]
        return FACT[name](W, H, cols, k, ink)
      })
    }

    const size = (force) => {
      const w = window.innerWidth
      const h = window.innerHeight
      // phones change height when the address bar hides: ignore small changes
      if (!force && Math.abs(w - W) < 2 && Math.abs(h - H) < 140) return
      W = w
      H = h
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }
    size(true)
    const onResize = () => size(false)
    window.addEventListener('resize', onResize)

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) { last = now; return }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, W, H)
      for (const s of systems) { s.update(dt); s.draw(ctx) }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [effects, colors, light])

  return <canvas ref={ref} className="festive-canvas" aria-hidden="true" />
}

const KEY = 'festive-fx'
const readFx = () => {
  try {
    return localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
}

export default function Festive({ festival, theme }) {
  const { lang } = useLang()
  const calm = useReducedMotion()
  const [on, setOn] = useState(readFx)
  const hi = lang === 'hi'

  if (!festival) return null

  const effects = parseList(festival.effects).filter((n) => FACT[n])
  const colors = parseList(festival.colors).filter(okHex)
  const garland = festival.garland === 'lights' || festival.garland === 'toran' ? festival.garland : ''
  const uri = garland ? garlandUri(garland, colors.length ? colors : DEFAULT_GARLAND) : ''

  const toggle = () => {
    const next = !on
    setOn(next)
    try {
      localStorage.setItem(KEY, next ? '1' : '0')
    } catch {
      /* storage blocked, the choice just won't be remembered */
    }
  }

  return (
    <>
      {garland && <div className={`festive-garland ${garland}`} style={{ backgroundImage: `url("${uri}")` }} aria-hidden="true" />}

      {on && !calm && effects.length > 0 && (
        <FxCanvas key={`${festival.id}-${theme}-${effects.join()}`} effects={effects} colors={colors} light={theme === 'light'} />
      )}

      {!calm && effects.length > 0 && (
        <button
          type="button"
          className={`festive-toggle ${on ? '' : 'off'}`}
          onClick={toggle}
          aria-pressed={on}
          aria-label={hi ? 'त्योहार के एनिमेशन चालू या बंद करें' : 'Turn festival animations on or off'}
        >
          <span aria-hidden="true">✨</span>
          <em className="ft-tip">{on ? (hi ? 'एनिमेशन बंद करें' : 'Animations off') : hi ? 'एनिमेशन चालू करें' : 'Animations on'}</em>
        </button>
      )}
    </>
  )
}