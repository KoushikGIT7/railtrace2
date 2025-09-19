import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200'
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${badgeVariants[variant]}
      ${badgeSizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
}