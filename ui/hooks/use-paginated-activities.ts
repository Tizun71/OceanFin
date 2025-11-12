import { useEffect, useState } from "react"
import { getActivitiesWithPagination } from "@/services/activity-service"

export function usePaginatedActivities({
  page = 1,
  limit = 10,
  userAddress,
}: {
  page?: number
  limit?: number
  userAddress?: string
}) {
  const [activities, setActivities] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    if (!userAddress) return
    setLoading(true)
    setError(null)

    try {
      const res = await getActivitiesWithPagination({
        page,
        limit,
        userAddress,
      })

      setActivities(Array.isArray(res.data) ? res.data : [])
      setTotal(Number(res.meta?.total) || 0)
    } catch (err: any) {
      setError(err.message)
      setActivities([]) 
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
    return () => setActivities([])
  }, [page, userAddress])

  return { activities, total, loading, error, fetchActivities }
}
