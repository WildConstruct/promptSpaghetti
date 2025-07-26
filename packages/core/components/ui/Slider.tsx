import React from 'react';

export interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value = [0],
  onValueChange,
  max = 100,
  min = 0,
  step = 1,
  className = '',
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onValueChange?.([newValue]);
  };

  return (
    <input
      type="range"
      value={value[0] || 0}
      onChange={handleChange}
      max={max}
      min={min}
      step={step}
      disabled={disabled}
      className={`slider ${className}`}
      style={{
        width: '100%',
        height: '4px',
        background: '#4a5568',
        outline: 'none',
        borderRadius: '2px',
        ...(!disabled && {
          cursor: 'pointer'
        })
      }}
    />
  );
};

export default Slider;