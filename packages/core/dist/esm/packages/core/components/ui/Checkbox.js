import { jsx as _jsx } from 'react/jsx-runtime';
import React from 'react';
export const Checkbox = React.forwardRef()({ className, onCheckedChange, onChange, ...props }, ref);
{
  return;
  _jsx('input', {
    type: 'checkbox',
    className: `checkbox ${className || ''}`,
    ref: ref,
    onChange: e => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    },
    ...props,
  });
  Checkbox.displayName = 'Checkbox';
}
