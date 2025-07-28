import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  export const Button: React.FC<ButtonProps> = ({ ),
  children,
  className,
  variant = 'default',
  size = 'default',
  ...props
}) => ()
  <button 
    className={`button button-${variant} button-${size} ${className || ''}`} }
    {...props}
  >
    {children}
  </button>
);