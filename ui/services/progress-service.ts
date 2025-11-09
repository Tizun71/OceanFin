import { api, API_ENDPOINTS } from "./api"

export async function getActivities() {
  try {
    const res = await api.get(API_ENDPOINTS.ACTIVITIES.LIST())
    return res.data || [] 
  } catch (err: any) {
    console.error("❌ Fetch activities failed:", err.response?.data || err.message)
    throw err
  }
}

export async function getActivityById(id: string) {
  try {
    const res = await api.get(API_ENDPOINTS.ACTIVITIES.GET(id))
    return res.data
  } catch (err: any) {
    console.error("❌ Fetch activity failed:", err.response?.data || err.message)
    throw err
  }
}

export async function updateProgress({
  activityId,
  step,
  status,
  message,
}: {
  activityId: string
  step: number
  status: string
  message: string
}) {
  try {
    const res = await api.post(API_ENDPOINTS.ACTIVITIES.UPDATE_PROGRESS(), {
      activityId,
      step,
      status,
      message,
    })
    console.log("✅ Progress updated:", res.data)
    return res.data
  } catch (err: any) {
    console.error("❌ Progress update failed:", err.response?.data || err.message)
    throw err
  }
}

export async function resumeProgress(id: string, payload: any) {
  try {
    const res = await api.put(API_ENDPOINTS.ACTIVITIES.RESUME(id), payload)
    console.log("✅ Resume success:", res.data)
    return res.data
  } catch (err: any) {
    console.error("❌ Resume progress failed:", err.response?.data || err.message)
    throw err
  }
}

export async function restartActivity(id: string, failedStep: number) {
  try {
    const payload = {
      activityId: id,
      step: failedStep,
      status: "PENDING",
      message: "Retry after failure",
    }
    const res = await resumeProgress(id, payload)
    console.log(" Restart success:", res)
    return res
  } catch (err: any) {
    console.error(" Restart activity failed:", err.response?.data || err.message)
    throw err
  }
}
