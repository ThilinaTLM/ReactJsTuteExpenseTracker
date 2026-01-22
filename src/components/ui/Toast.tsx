import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Toast as ToastType, ToastType as ToastVariant } from '@/types'

// Re-export the hook from its own file for backwards compatibility
export { useToasts } from '@/hooks/useToasts'

interface ToastProps extends ToastType {
  onDismiss: (id: string) => void
}

const iconMap: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styleMap: Record<ToastVariant, string> = {
  success: 'bg-success-50 text-success-800 border-success-200 dark:bg-success-900/20 dark:text-success-200 dark:border-success-800',
  error: 'bg-danger-50 text-danger-800 border-danger-200 dark:bg-danger-900/20 dark:text-danger-200 dark:border-danger-800',
  warning: 'bg-warning-50 text-warning-800 border-warning-200 dark:bg-warning-900/20 dark:text-warning-200 dark:border-warning-800',
  info: 'bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-900/20 dark:text-primary-200 dark:border-primary-800',
}

const iconStyleMap: Record<ToastVariant, string> = {
  success: 'text-success-500',
  error: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-primary-500',
}

function Toast({ id, type, message, duration = 5000, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = iconMap[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onDismiss(id), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, id, onDismiss])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(id), 300)
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
        styleMap[type],
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', iconStyleMap[type])} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const positionClasses: Record<string, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

export function ToastContainer({ toasts, onDismiss, position = 'top-right' }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex flex-col gap-2',
        positionClasses[position]
      )}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}

