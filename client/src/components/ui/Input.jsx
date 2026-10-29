import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`${containerClassName}`}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          ref={ref}
          className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input

export const Select = forwardRef(({ label, error, className = '', children, ...props }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <select
      ref={ref}
      className={`input-field ${error ? 'input-error' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
Select.displayName = 'Select'

export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <textarea
      ref={ref}
      rows={4}
      className={`input-field resize-none ${error ? 'input-error' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'
