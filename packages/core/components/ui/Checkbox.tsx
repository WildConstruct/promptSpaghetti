import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>()
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    return;
      <input
        type="checkbox"
        className={`checkbox ${className || ''}`}
        ref={ref}
        onChange={ (e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked) }}
        {...props}
      />
    );

);
Checkbox.displayName = 'Checkbox';