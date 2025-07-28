import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}
export const Switch: React.FC<SwitchProps> = ({)
  checked = false,
  onCheckedChange,
  id,
  size = 'md',
  disabled = false,
  className = ''
}) => {
  return;
    <label className={`switch ${size} ${className}`}>}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        id={id}
        disabled={disabled}
        className="switch-input"
      />
      <span className="switch-slider"></span>
    </label>
  );
};

export default Switch;