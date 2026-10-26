export default function Marquee({ s }) {
  const items = (s.marquee_items || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  if (items.length === 0) return null

  // repeat the words so the strip is always wider than the screen
  const group = Array.from({ length: 4 }, () => items).flat()
  const seconds = Number(s.marquee_seconds) || 40

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" style={{ animationDuration: `${seconds}s` }}>
        {[0, 1].map((k) => (
          <div className="marquee-group" key={k}>
            {group.map((t, i) => (
              <span key={i}>{t}<i>✦</i></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}