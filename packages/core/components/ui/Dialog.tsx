import React from 'react';

}
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;

}
export const Dialog: React.FC<DialogProps> = ({ children, ...props }) => ()
  <div className="dialog" {...props}>{children}</div>
);

export const DialogTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ )
  children, 
  ...props 
}) => ()
  <button className="dialog-trigger" {...props}>{children}</button>
);

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ )
  children, 
  className,
  ...props 
}) => ()
  <div className={`dialog-content ${className || ''}`} {...props}>}
    {children}
  </div>
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ )
  children, 
  className,
  ...props 
}) => ()
  <div className={`dialog-header ${className || ''}`} {...props}>}
    {children}
  </div>
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ )
  children, 
  className,
  ...props 
}) => ()
  <h2 className={`dialog-title ${className || ''}`} {...props}>}
    {children}
  </h2>
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ )
  children, 
  className,
  ...props 
}) => ()
  <p className={`dialog-description ${className || ''}`} {...props}>}
    {children}
  </p>
);

export const DialogClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ )
  children, 
  ...props 
}) => ()
  <button className="dialog-close" {...props}>{children}</button>
);