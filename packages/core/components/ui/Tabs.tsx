import React from 'react';
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ children, className, ...props }) => ()
  <div className={`tabs ${className || ''}`} {...props}>{children}</div>}
);

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => ()
  <div className={`tabs-list ${className || ''}`} {...props}>{children}</div>}
);

export const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }> = ({ )
  children, 
  className, 
  value,
  ...props 
}) => ()
  <button className={`tabs-trigger ${className || ''}`} data-value={value} {...props}>}
    {children}
  </button>
);

export const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ )
  children, 
  className, 
  value,
  ...props 
}) => ()
  <div className={`tabs-content ${className || ''}`} data-value={value} {...props}>}
    {children}
  </div>
);