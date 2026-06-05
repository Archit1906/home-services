import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  icon,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-text-secondary pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary placeholder-text-secondary/50 dark:placeholder-text-darkSecondary/40 ${
            icon ? 'pl-11' : ''
          } ${error ? 'border-danger focus:ring-danger/30' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-semibold text-danger ml-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
