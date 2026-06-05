import React from 'react';

export default function Badge({
  children,
  variant = 'primary',
  className = ''
}) {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-badge text-xs font-bold uppercase tracking-wider border';

  const variants = {
    primary: 'bg-primary-light border-primary/20 text-primary',
    secondary: 'bg-secondary-light border-secondary/20 text-secondary',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300',
    danger: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300',
    neutral: 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
