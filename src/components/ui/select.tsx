import React from 'react'

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, Props>(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
})

export default Select


