import React from 'react'

type DialogProps = {
  open: boolean
  title?: string
  description?: string
  onClose: () => void
  footer?: React.ReactNode
  children?: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, title, description, onClose, footer, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-md shadow-lg border border-gray-200">
        {(title || description) && (
          <div className="px-4 py-3 border-b border-gray-100">
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
        )}
        <div className="px-4 py-3">
          {children}
        </div>
        {footer && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dialog


