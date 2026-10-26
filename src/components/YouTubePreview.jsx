import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function getYouTubeId(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)
  return m ? m[1] : null
}

const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

export default function YouTubePreview({ url, start = 0, seconds = 6, poster, title, onOpen }) {
  const id = getYouTubeId(url)
  const ref = useRef(null)
  const timer = useRef(null)
  const inView = useInView(ref, { amount: 0.75 })
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const stop = () => {
    clearTimeout(timer.current)
    setPlaying(false)
    setLoaded(false)
  }
  const play = () => {
    if (!id || playing) return
    setPlaying(true)
  }

  // phones: auto preview when the card is mostly on screen
  useEffect(() => {
    if (!isTouch()) return
    if (inView) play()
    else stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  useEffect(() => () => clearTimeout(timer.current), [])

  // start the countdown only once the video has actually loaded
  const onLoad = () => {
    setLoaded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(stop, seconds * 1000 + 600)
  }

  if (!id) return <img src={poster} alt={title} loading="lazy" onClick={() => onOpen?.({ type: 'img', src: poster })} />

  const src =
    `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1` +
    `&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&start=${start}&end=${start + seconds}`

  return (
    <div
      ref={ref}
      className={`yt-wrap ${playing ? 'playing' : ''}`}
      onMouseEnter={() => !isTouch() && play()}
      onMouseLeave={() => !isTouch() && stop()}
      onClick={() => { stop(); onOpen?.({ type: 'yt', id }) }}
    >
      <img src={poster || `https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt={title} loading="lazy" />
      {playing && (
        <iframe
          className={loaded ? 'show' : ''}
          src={src}
          title={title}
          allow="autoplay; encrypted-media"
          onLoad={onLoad}
        />
      )}
      <span className="play-badge">▶</span>
      {playing && loaded && <span className="preview-tag">Preview</span>}
    </div>
  )
}