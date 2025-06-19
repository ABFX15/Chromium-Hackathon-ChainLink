import { useState } from 'react'

interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }

    return {
        toasts,
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
        warning: (message: string) => addToast(message, 'warning'),
    }
} 