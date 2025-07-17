import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}) => (
  <div className={`alert alert-${variant} ${className || ''}`} {...props}>
    {children}
  </div>
);

export const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ 
  children, 
  className, 
  ...props 
}) => (
  <h5 className={`alert-title ${className || ''}`} {...props}>
    {children}
  </h5>
);

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ 
  children, 
  className, 
  ...props 
}) => (
  <p className={`alert-description ${className || ''}`} {...props}>
    {children}
  </p>
);