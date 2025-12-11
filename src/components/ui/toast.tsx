import React, { useEffect, useState } from 'react'

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' }

const TOAST_EVENT = 'mhxy:toast'

export function showToast(message: string, type: Toast['type'] = 'info') {
  const ev = new CustomEvent(TOAST_EVENT, { detail: { message, type } })
  window.dispatchEvent(ev)
}

export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string; type?: Toast['type'] }
      const id = Date.now() + Math.random()
      const toast: Toast = { id, message: detail.message, type: detail.type || 'info' }
      setToasts(prev => [...prev, toast])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500)
    }
    window.addEventListener(TOAST_EVENT, handler as any)
    return () => window.removeEventListener(TOAST_EVENT, handler as any)
  }, [])

  return (
    <div className="fixed z-[60] top-4 right-4 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-3 py-2 rounded text-sm shadow border ${t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : t.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-800'}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default ToastHost


