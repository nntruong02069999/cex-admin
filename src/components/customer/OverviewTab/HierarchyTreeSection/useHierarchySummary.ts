import { useEffect, useState, useCallback } from 'react'
import { getHierarchySummary } from '@src/services/customer'
import type { HierarchySummary } from './hierarchy.types'

export const useHierarchySummary = (customerId: number) => {
  const [summary, setSummary] = useState<HierarchySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    const res = await getHierarchySummary(customerId)
    if ('errorCode' in res) {
      setError(res.message)
      setSummary(null)
    } else {
      setSummary(res.data)
    }
    setLoading(false)
  }, [customerId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!cancelled) await fetchSummary()
    })()
    return () => { cancelled = true }
  }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}
