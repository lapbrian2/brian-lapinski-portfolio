export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

export interface ToastOptions {
  type?: ToastType
  duration?: number
}

const MAX_TOASTS = 3

/**
 * Lightweight toast notification composable.
 * Uses useState for SSR-safe shared state (same pattern as useLikes / useCart).
 */
export function useToast() {
  const toasts = useState<Toast[]>('toast-notifications', () => [])

  // Timer IDs tracked outside state — client-only, no SSR concern
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  }

  function dismiss(id: string) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(message: string, options: ToastOptions = {}): string {
    const id = generateId()
    const type = options.type ?? 'info'
    const duration = options.duration ?? 3000

    const toast: Toast = { id, message, type, duration }

    // Enforce max visible toasts — remove oldest first
    if (toasts.value.length >= MAX_TOASTS) {
      const oldest = toasts.value[0]
      dismiss(oldest.id)
    }

    toasts.value = [...toasts.value, toast]

    // Auto-dismiss after duration (client-only)
    if (import.meta.client && duration > 0) {
      const timer = setTimeout(() => {
        dismiss(id)
      }, duration)
      timers.set(id, timer)
    }

    return id
  }

  return {
    toasts,
    show,
    dismiss,
  }
}
