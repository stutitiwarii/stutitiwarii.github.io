import { useSyncExternalStore } from 'react'

const standalone = () =>
  typeof window !== 'undefined' &&
  (!!window.matchMedia?.('(display-mode: standalone)').matches ||
    !!window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    window.navigator.standalone === true)

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const ios =
  /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)

let deferred = null
let snap = { canPrompt: false, installed: false, standalone: standalone(), ios }
const listeners = new Set()

function set(patch) {
  snap = { ...snap, ...patch }
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    set({ canPrompt: true })
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    set({ canPrompt: false, installed: true })
  })
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const getSnapshot = () => snap

export const usePwa = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

// shows the browser's own install prompt; returns 'accepted', 'dismissed' or 'unavailable'
export async function promptInstall() {
  if (!deferred) return 'unavailable'
  deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  set({ canPrompt: false, installed: outcome === 'accepted' })
  return outcome
}