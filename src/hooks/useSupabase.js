import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// Loads a whole table and refreshes automatically when you edit it in Supabase
export function useTable(table, orderBy = 'sort_order') {
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

  return rows
}

// Loads site_settings as one object: { hero_title: '...', accent_color: '...' }
export function useSettings() {
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

  return settings
}