import { createContext, useContext, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = createContext(null)

const config = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-200', iconColor: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: XCircle, ring: 'ring-red-200', iconColor: 'text-red-600', bar: 'bg-red-500' },
  warning: { icon: AlertTriangle, ring: 'ring-amber-200', iconColor: 'text-amber-600', bar: 'bg-amber-500' },
  info: { icon: Info, ring: 'ring-sky-200', iconColor: 'text-sky-600', bar: 'bg-sky-500' },
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback((variant, message, opts = {}) => {
    const id = ++idCounter
    const duration = opts.duration ?? 4000
    setToasts((prev) => [...prev.slice(-4), { id, variant, message, title: opts.title, duration }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [remove])

  const api = {
    success: (msg, opts) => add('success', msg, opts),
    error: (msg, opts) => add('error', msg, opts),
    warning: (msg, opts) => add('warning', msg, opts),
    info: (msg, opts) => add('info', msg, opts),
    remove,
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const c = config[toast.variant]
  const Icon = c.icon
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-inset dark:bg-slate-800',
        c.ring,
      )}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', c.iconColor)} />
        <div className="min-w-0 flex-1">
          {toast.title && <p className="text-sm font-semibold text-slate-900">{toast.title}</p>}
          <p className="text-sm text-slate-600">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {toast.duration > 0 && (
        <motion.div
          className={cn('h-1', c.bar)}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
