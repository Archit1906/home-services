import React from 'react';

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = ''
}) {
  const styles = {
    text: 'h-4 w-full rounded-md',
    avatar: 'rounded-full',
    rect: 'rounded-card'
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${styles[variant]} ${className}`}
      style={{
        width: width,
        height: height
      }}
    />
  );
}
export { Skeleton };
