import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}) => (
  <span className={`badge badge-${variant} ${className || ''}`} {...props}>
    {children}
  </span>
);