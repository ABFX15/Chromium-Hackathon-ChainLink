import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ id = Math.random().toString(36).substr(2, 9), duration = 5000, ...props }: Omit<Toast, 'id'> & { id?: string }) => {
      setToasts((toasts) => [...toasts, { id, duration, ...props }])

      setTimeout(() => {
        setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
      }, duration)

      return id
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}
