import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getActivities, createActivity, updateActivity } from "@/services/activity-service"
import type { ActivityFilter, CreateActivityPayload, UpdateActivityPayload } from "@/types/activity.interface"

export const ACTIVITIES_QUERY_KEY = ["activities"]

export function useActivities(filter?: ActivityFilter) {
  return useQuery({
    queryKey: [...ACTIVITIES_QUERY_KEY, filter],
    queryFn: () => getActivities(filter),
    enabled: !!filter?.userAddress,
  })
}

interface UsePaginatedActivitiesParams {
  page: number
  limit: number
  userAddress?: string
}

export function usePaginatedActivities({
  page = 1,
  limit = 10,
  userAddress,
}: UsePaginatedActivitiesParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: [...ACTIVITIES_QUERY_KEY, "paginated", userAddress, page, limit],
    queryFn: () => getActivities({ userAddress, page, limit }),
    enabled: !!userAddress,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })

  const activities = Array.isArray(data) ? data : data?.data || []
  const total = Array.isArray(data) ? data.length : data?.total || 0

  return {
    activities,
    total,
    loading: isLoading,
    error: error ? "Failed to load activities" : null,
  }
}

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateActivityPayload) => createActivity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY })
    },
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, payload }: { activityId: string; payload: UpdateActivityPayload }) =>
      updateActivity(activityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY })
    },
  })
}