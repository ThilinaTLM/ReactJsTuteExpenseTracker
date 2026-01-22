import { useState } from 'react'
import type { Toast as ToastType } from '@/types'

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const addToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const success = (message: string, duration?: number) => addToast({ type: 'success', message, duration })
  const error = (message: string, duration?: number) => addToast({ type: 'error', message, duration })
  const warning = (message: string, duration?: number) => addToast({ type: 'warning', message, duration })
  const info = (message: string, duration?: number) => addToast({ type: 'info', message, duration })

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  }
}
