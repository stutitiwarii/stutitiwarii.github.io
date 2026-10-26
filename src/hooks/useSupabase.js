import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLang } from '../i18n/context'
import { localize } from '../i18n/strings'

// Loads a whole table and refreshes automatically when you edit it in Supabase
export function useTable(table, orderBy = 'sort_order') {
  const { lang } = useLang()
  const [rows, setRows] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from(table).select('*').order(orderBy, { ascending: true })
      if (data) setRows(data)
    }
    load()
    const channel = supabase
      .channel(`rt-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, orderBy])

  return useMemo(() => rows.map((r) => localize(r, lang)), [rows, lang])
}

// Loads site_settings as one object: { hero_title: '...', accent_color: '...' }
export function useSettings() {
  const { lang } = useLang()
  const [settings, setSettings] = useState({})

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('site_settings').select('*')
      if (data) setSettings(Object.fromEntries(data.map((r) => [r.key, r.value])))
    }
    load()
    const channel = supabase
      .channel('rt-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return useMemo(() => localize(settings, lang), [settings, lang])
}