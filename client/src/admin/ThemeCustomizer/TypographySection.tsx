import React from 'react';

interface TypographySectionProps {
  typography: Record<string, string | number>;
  onChange: (typography: Record<string, string | number>) => void;
}

const TypographySection: React.FC<TypographySectionProps> = ({
  typography,
  onChange
}) => {
  const handleChange = (key: string, value: string) => {
    onChange({ ...typography, [key]: value });
  };

  return (
    <div className="typography-section">
      <h2>Typography</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Font Family:
          <input
            type="text"
            value={typography.fontFamily || ''}
            onChange={e => handleChange('fontFamily', e.target.value)}
            placeholder="e.g., Arial, sans-serif"
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Font Size:
          <input
            type="text"
            value={typography.fontSize || ''}
            onChange={e => handleChange('fontSize', e.target.value)}
            placeholder="e.g., 16px"
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Font Weight:
          <select
            value={typography.fontWeight || ''}
            onChange={e => handleChange('fontWeight', e.target.value)}
          >
            <option value="">Select weight</option>
            <option value="100">Thin (100)</option>
            <option value="200">Extra Light (200)</option>
            <option value="300">Light (300)</option>
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Line Height:
          <input
            type="text"
            value={typography.lineHeight || ''}
            onChange={e => handleChange('lineHeight', e.target.value)}
            placeholder="e.g., 1.5"
          />
        </label>
      </div>
    </div>
  );
};

export default TypographySection;
