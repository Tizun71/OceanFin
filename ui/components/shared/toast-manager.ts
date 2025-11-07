let showToast: ((status: string, message: string) => void) | null = null

export const registerToast = (fn: (status: string, message: string) => void) => {
  showToast = fn
}

export const displayToast = (status: string, message: string) => {
  if (showToast) {
    showToast(status, message)
  } else {
    console.warn("ToastManager has not been initialized yet!")
  }
}