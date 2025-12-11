import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
}

export const Button: React.FC<Props> = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded transition-colors disabled:opacity-60 disabled:pointer-events-none'
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  }[variant]
  return <button className={`${base} ${sizes} ${variants} ${className}`} {...props} />
}

export default Button


