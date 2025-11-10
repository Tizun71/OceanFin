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