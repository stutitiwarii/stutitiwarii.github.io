export const okHex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || '').trim())
export const parseList = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean)

// the visitor's own date (not the server's)
export function todayLocal() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const day = (v) => String(v || '').slice(0, 10)

function isActive(f, today) {
  const start = day(f.starts_on)
  const end = day(f.ends_on || f.starts_on)
  if (f.repeat_yearly) {
    // same days every year: only month and day count, and ranges like Dec 30 to Jan 2 work too
    const a = start.slice(5)
    const b = end.slice(5)
    const t = today.slice(5)
    return a <= b ? t >= a && t <= b : t >= a || t <= b
  }
  return today >= start && today <= end
}

// the festival to show today (or the one asked for with ?festival=slug); the highest priority wins
export function pickFestival(rows, today, forced) {
  const list = rows.filter((r) => r.is_visible !== false && r.starts_on)

  if (forced) {
    const key = String(forced).toLowerCase()
    if (key === 'off' || key === 'none') return null
    const same = list.filter((r) => String(r.slug || '').toLowerCase() === key)
    if (same.length === 0) return null
    return same.find((r) => day(r.ends_on || r.starts_on) >= today) || same[same.length - 1]
  }

  const hits = list.filter((r) => isActive(r, today))
  if (hits.length === 0) return null
  hits.sort((a, b) => (Number(b.priority) || 1) - (Number(a.priority) || 1) || day(b.starts_on).localeCompare(day(a.starts_on)))
  return hits[0]
}

export const DEFAULT_GARLAND = ['#ffb22e', '#ff5d5d', '#4ecdc4', '#ffffff']

// a repeating strip drawn as a tiny SVG picture: string lights, or a marigold toran
export function garlandUri(kind, colors) {
  const c = (i) => colors[i % colors.length]
  let svg
  if (kind === 'lights') {
    const bulbs = [30, 90, 150, 210]
      .map(
        (x, i) =>
          `<rect x='${x - 2}' y='12' width='4' height='5' rx='1' fill='#3a3a3a'/>` +
          `<circle cx='${x}' cy='22' r='9' fill='${c(i)}' opacity='.22'/>` +
          `<circle cx='${x}' cy='21' r='5.5' fill='${c(i)}'/>` +
          `<circle cx='${x - 1.8}' cy='19' r='1.6' fill='#fff' opacity='.7'/>`
      )
      .join('')
    svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='40' viewBox='0 0 240 40'>` +
      `<path d='M0 4 Q30 22 60 4 Q90 22 120 4 Q150 22 180 4 Q210 22 240 4' fill='none' stroke='#3a3a3a' stroke-width='1.6'/>` +
      `${bulbs}</svg>`
  } else {
    const flowers = [[15, 12], [30, 15], [45, 12], [75, 12], [90, 15], [105, 12]]
      .map(
        ([x, y], i) =>
          `<circle cx='${x}' cy='${y + 3}' r='6.5' fill='${c(i)}'/>` +
          `<circle cx='${x}' cy='${y + 3}' r='3' fill='#ffe08a' opacity='.9'/>`
      )
      .join('')
    svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='46' viewBox='0 0 120 46'>` +
      `<path d='M0 4 Q30 26 60 4 Q90 26 120 4' fill='none' stroke='#2f7d32' stroke-width='2'/>` +
      `${flowers}` +
      `<line x1='60' y1='5' x2='60' y2='28' stroke='${c(0)}' stroke-width='1.6'/>` +
      `<circle cx='60' cy='31' r='4.5' fill='${c(1)}'/>` +
      `<circle cx='0' cy='4' r='3' fill='#2f7d32'/><circle cx='120' cy='4' r='3' fill='#2f7d32'/>` +
      `</svg>`
  }
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}