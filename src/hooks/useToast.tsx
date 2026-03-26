import { createContext, useContext, useState, useCallback, useRef } from 'react'

// ── 타입 ──────────────────────────────────────────────────────
type ToastType = 'info' | 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
  visible: boolean
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void
}

// ── Context ───────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ show: () => {} })

// ── Provider ──────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '', type: 'info', visible: false,
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback((message: string, type: ToastType = 'info') => {
    clearTimeout(timerRef.current)
    setToast({ message, type, visible: true })
    timerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 2200)
  }, [])

  const bgMap: Record<ToastType, string> = {
    info:    '#1A1A18',
    success: '#1A5E38',
    error:   '#B91C1C',
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: `translateX(-50%) translateY(${toast.visible ? 0 : 10}px)`,
          background: bgMap[toast.type],
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 18px',
          borderRadius: 20,
          opacity: toast.visible ? 1 : 0,
          transition: 'opacity 0.22s, transform 0.22s',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {toast.message}
      </div>
    </ToastContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────
export function useToast() {
  return useContext(ToastContext)
}