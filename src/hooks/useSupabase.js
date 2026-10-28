import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { supabase } from '../supabaseClient'
import { useLang } from '../i18n/context'
import { localize } from '../i18n/strings'

/* ---------- saved copy: the site still shows content if Supabase is slow or down ---------- */
const PREFIX = 'portfolio-cache-v1:'

const readCache = (key, fallback) => {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const writeCache = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or blocked, the site just won't keep a saved copy */
  }
}

/* ---------- loading and error status shared by the whole page ---------- */
const hadCache = typeof window !== 'undefined' && !!readCache('settings', null)
const store = { pending: 0, firstDone: false, settingsReady: hadCache, errors: new Set() }
const listeners = new Set()
let snapshot = { booting: !hadCache, ready: hadCache, failed: false }

function emit() {
  const next = {
    booting: !hadCache && !store.firstDone, // first visit, still loading
    ready: store.settingsReady, // the opening screen may leave
    failed: store.errors.size > 0, // something could not be loaded
  }
  if (next.booting !== snapshot.booting || next.ready !== snapshot.ready || next.failed !== snapshot.failed) {
    snapshot = next
    listeners.forEach((l) => l())
  }
}
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const getSnapshot = () => snapshot
export const useDataStatus = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

async function track(key, job) {
  store.pending++
  try {
    const ok = await job()
    if (ok) store.errors.delete(key)
    else store.errors.add(key)
  } catch {
    store.errors.add(key)
  } finally {
    store.pending--
    if (key === 'settings') store.settingsReady = true
    if (store.pending === 0) store.firstDone = true
    emit()
  }
}

let channelCount = 0

// Loads a whole table and refreshes automatically when you edit it in Supabase
export function useTable(table, orderBy = 'sort_order') {
  const { lang } = useLang()
  const [rows, setRows] = useState(() => readCache(`t:${table}`, []))

  useEffect(() => {
    const load = () =>
      track(`t:${table}`, async () => {
        const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true })
        if (error || !data) return false
        setRows(data)
        writeCache(`t:${table}`, data)
        return true
      })
    load()
    const channel = supabase
      .channel(`rt-${table}-${++channelCount}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, orderBy])

  return useMemo(() => rows.map((r) => localize(r, lang)), [rows, lang])
}

// Loads site_settings as one object: { hero_title: '...', accent_color: '...' }
export function useSettings() {
  const { lang } = useLang()
  const [settings, setSettings] = useState(() => readCache('settings', {}))

  useEffect(() => {
    const load = () =>
      track('settings', async () => {
        const { data, error } = await supabase.from('site_settings').select('*')
        if (error || !data) return false
        const obj = Object.fromEntries(data.map((r) => [r.key, r.value]))
        setSettings(obj)
        writeCache('settings', obj)
        return true
      })
    load()
    const channel = supabase
      .channel(`rt-settings-${++channelCount}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return useMemo(() => localize(settings, lang), [settings, lang])
}