import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  animate = true,
  onClick,
  ...props
}) {
  const CardComponent = onClick ? motion.div : 'div';

  const propsWithAnimation = onClick && animate
    ? {
        whileHover: { y: -4, scale: 1.01 },
        whileTap: { scale: 0.99 },
        ...props
      }
    : props;

  return (
    <CardComponent
      onClick={onClick}
      className={`glass border border-border/40 dark:border-border-dark/30 rounded-card p-6 shadow-default bg-white/70 dark:bg-slate-900/70 transition-shadow duration-300 hover:shadow-elevated ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...propsWithAnimation}
    >
      {children}
    </CardComponent>
  );
}
export { Card };
