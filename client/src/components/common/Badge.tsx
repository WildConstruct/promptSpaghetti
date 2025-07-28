// Common Badge Component
import React from 'react';
import './Badge.css';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'featured' | 'free' | 'premium' | 'ai' | 'verified' | 'new' | 'popular' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({)
  children,
  variant = 'default',
  size = 'medium',
  icon,
  className = ''
}) => {
  return ()
    <span className={`badge ${variant} ${size} ${className}`}>}
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{children}</span>
    </span>
  );
};