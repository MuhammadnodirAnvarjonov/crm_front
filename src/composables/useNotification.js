import { notify } from '@/utils/notificationService'

export function useNotification() {
  const success = (message, meta = '', duration = 2000) => {
    notify({
      type: 'success',
      message,
      meta,
      duration,
    })
  }

  const error = (message, meta = '', duration = 2000) => {
    notify({
      type: 'error',
      message,
      meta,
      duration,
    })
  }

  const warning = (message, meta = '', duration = 2000) => {
    notify({
      type: 'warning',
      message,
      meta,
      duration,
    })
  }

  const info = (message, meta = '', duration = 2000) => {
    notify({
      type: 'info',
      message,
      meta,
      duration,
    })
  }

  return {
    success,
    error,
    warning,
    info,
  }
}
