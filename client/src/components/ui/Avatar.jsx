import React from 'react';

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = ''
}) {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl'
  };

  const randomGradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-400 to-teal-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-600',
    'from-purple-500 to-indigo-700'
  ];

  // Derive stable index from name string
  const gradientIndex = name
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % randomGradients.length
    : 0;

  const bgGradient = randomGradients[gradientIndex];

  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 select-none shadow-sm ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${bgGradient} text-white font-bold tracking-wider`}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
export { Avatar };
