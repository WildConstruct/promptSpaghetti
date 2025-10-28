import React from 'react';

import { SketchPicker } from 'react-color';

interface ColorPickerSectionProps {
  colors: Record<string, string>;

  onChange: (colors: Record<string, string>) => void;
}

type ColorType = { hex: string };

const ColorPickerSection: React.FC<ColorPickerSectionProps> = ({
  colors,
  onChange
}) => {
  const handleChange = (color: ColorType, key: string) => {
    onChange({ ...colors, [key]: color.hex });
  };

  return (
    <div className="color-picker-section">
      <h2>Colors</h2>

      {Object.entries(colors).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '20px' }}>
          <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>

          <SketchPicker
            color={value}
            onChangeComplete={color => handleChange(color as ColorType, key)}
          />
        </div>
      ))}
    </div>
  );
};

export default ColorPickerSection;
