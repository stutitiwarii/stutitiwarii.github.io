import { useEffect, useState } from 'react'
import { useDataStatus } from '../hooks/useSupabase'
import { useLang } from '../i18n/context'

export default function DataNotice({ empty }) {
  const { failed, booting } = useDataStatus()
  const { lang } = useLang()
  const [closed, setClosed] = useState(false)
  const hi = lang === 'hi'
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false

  // when the internet comes back, load everything again
  useEffect(() => {
    if (!failed) return
    const back = () => window.location.reload()
    window.addEventListener('online', back)
    return () => window.removeEventListener('online', back)
  }, [failed])

  if (!failed || booting) return null
  const retry = () => window.location.reload()

  // nothing could be loaded and there is no saved copy
  if (empty) {
    return (
      <div className="err-screen" role="alert">
        <div className="err-emoji">📡</div>
        <h2>{hi ? 'यह पेज लोड नहीं हो सका' : "We couldn't load this page"}</h2>
        <p>
          {hi
            ? 'कृपया अपना इंटरनेट कनेक्शन जाँचें और दोबारा कोशिश करें।'
            : 'Please check your internet connection and try again.'}
        </p>
        <button type="button" className="btn" onClick={retry}>
          {hi ? 'दोबारा कोशिश करें' : 'Try again'}
        </button>
      </div>
    )
  }

  if (closed) return null

  // some content is missing or out of date
  return (
    <div className="err-toast" role="status">
      <span>
        {offline
          ? hi
            ? 'आप ऑफ़लाइन हैं। पिछला सेव किया हुआ संस्करण दिखाया जा रहा है।'
            : "You're offline. Showing the last saved version."
          : hi
            ? 'कुछ सामग्री अभी लोड नहीं हो सकी।'
            : "Some content couldn't load right now."}
      </span>
      <button type="button" onClick={retry}>{hi ? 'दोबारा कोशिश' : 'Try again'}</button>
      <button type="button" className="x" onClick={() => setClosed(true)} aria-label="Close">✕</button>
    </div>
  )
}