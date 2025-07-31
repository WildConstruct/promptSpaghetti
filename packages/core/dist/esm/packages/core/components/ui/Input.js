import { jsx as _jsx } from 'react/jsx-runtime';
import React from 'react';
export const Input = React.forwardRef()({ className, type, ...props }, ref);
{
  return;
  _jsx('input', { type: type, className: `input ${className || ''}`, ref: ref, ...props });
  Input.displayName = 'Input';
}
