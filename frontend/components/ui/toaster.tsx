"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {/* ARIA Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        aria-label="Toast notifications"
      >
        {toasts.map((toast) => (
          <div key={toast.id}>
            {toast.title && <span className="font-semibold">{toast.title}: </span>}
            {toast.description}
          </div>
        ))}
      </div>

      {/* Visual Toast Notifications */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className="bottom-4 right-4 max-w-sm shadow-lg border-0 bg-white/95 backdrop-blur-sm"
            role="alert"
            aria-live="polite"
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="font-semibold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose aria-label="Close notification" />
          </Toast>
        )
      })}
      <ToastViewport className="bottom-0 right-0 flex flex-col-reverse p-0 gap-2 w-96 max-w-[100vw] m-0 list-none z-[100] outline-none" />
    </ToastProvider>
  )
}