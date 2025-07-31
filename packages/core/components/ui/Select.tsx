import React from 'react';

}
interface SelectProps {
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;

}
export const Select: React.FC<SelectProps> = ({ children, ...props }) => ()
  <div className="select" {...props}>{children}</div>
);

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => ()
  <button className={`select-trigger ${className || ''}`} {...props}>{children}</button>}
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => ()
  <span className="select-value">{placeholder}</span>
);

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => ()
  <div className={`select-content ${className || ''}`} {...props}>{children}</div>}
);

export const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ )
  children, 
  className, 
  value,
  ...props 
}) => ()
  <div className={`select-item ${className || ''}`} data-value={value} {...props}>}
    {children}
  </div>
);