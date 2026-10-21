import React, { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type }])

      setTimeout(() => {
        removeToast(id)
      }, 3500)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between rounded-md border p-3 shadow-lg text-xs font-medium transition-all ${
              toast.type === "success"
                ? "bg-slate-900 border-slate-800 text-white"
                : toast.type === "error"
                ? "bg-red-600 border-red-700 text-white"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === "success" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="h-4 w-4 text-white shrink-0" />
              )}
              {toast.type === "info" && (
                <Info className="h-4 w-4 text-slate-500 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 rounded p-0.5 hover:opacity-80"
              aria-label="Dismiss toast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
