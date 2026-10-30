import { useMemo } from 'react'
import { useTable } from './useSupabase'
import { pickFestival, todayLocal } from '../festivals'

// today's festival (or the one in the link: ?festival=diwali, ?festival=off to switch it off)
export default function useFestival(s) {
  const rows = useTable('festivals', 'starts_on')

  const forced = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('festival')
    } catch {
      return null
    }
  }, [])

  return useMemo(() => {
    if (!forced && s.festivals_on === 'false') return null
    return pickFestival(rows, todayLocal(), forced)
  }, [rows, s.festivals_on, forced])
}