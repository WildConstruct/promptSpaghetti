import React, { useState, useEffect } from 'react';

export interface WeightControlOption {
  id: string;
  text: string;
  weight: number;
  locked?: boolean;
}

export type WeightPreset = 'equal' | 'linear-decrease' | 'exponential' | 'bell-curve' | 'first-heavy' | 'last-heavy' | 'custom';

interface WeightControlSliderProps {
  options: WeightControlOption[];
  onOptionsChange: (options: WeightControlOption[]) => void;
  onPreviewRequest?: (options: WeightControlOption[]) => void;
  className?: string;
}

export const WeightControlSlider: React.FC<WeightControlSliderProps> = ({
  options,
  onOptionsChange,
  onPreviewRequest,
  className = ''
}) => {
  const [localOptions, setLocalOptions] = useState<WeightControlOption[]>(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleWeightChange = (optionId: string, newWeight: number) => {
    const updatedOptions = localOptions.map(option =>
      option.id === optionId ? { ...option, weight: Math.max(0, newWeight) } : option
    );
    setLocalOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  const handleTextChange = (optionId: string, newText: string) => {
    const updatedOptions = localOptions.map(option =>
      option.id === optionId ? { ...option, text: newText } : option
    );
    setLocalOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  if (localOptions.length === 0) {
    return (
      <div className={`weight-control-slider ${className}`} style={{
        padding: 16,
        background: '#2d3748',
        borderRadius: 6,
        color: 'white',
        textAlign: 'center'
      }}>
        <p>No options available</p>
      </div>
    );
  }

  return (
    <div className={`weight-control-slider ${className}`} style={{
      padding: 16,
      background: '#2d3748',
      borderRadius: 6,
      color: 'white'
    }}>
      <h3 style={{ marginBottom: 16, color: '#e2e8f0' }}>Weight Control</h3>
      
      {localOptions.map((option, index) => (
        <div key={option.id} style={{ marginBottom: 12 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 4
          }}>
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleTextChange(option.id, e.target.value)}
              style={{
                background: '#4a5568',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                color: 'white',
                flex: 1,
                marginRight: 8
              }}
            />
            <span style={{ 
              minWidth: 40, 
              textAlign: 'right',
              fontSize: 12,
              color: '#a0aec0'
            }}>
              {option.weight}%
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={option.weight}
            onChange={(e) => handleWeightChange(option.id, parseInt(e.target.value))}
            disabled={option.locked}
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: '#4a5568',
              outline: 'none',
              opacity: option.locked ? 0.5 : 1
            }}
          />
        </div>
      ))}
      
      {onPreviewRequest && (
        <button
          onClick={() => onPreviewRequest(localOptions)}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            background: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Preview
        </button>
      )}
    </div>
  );
};

// Helper function to get consistent colors for options
const _____getOptionColor = (index: number): string => {
  const colors = [
    '#4299e1', // Blue
    '#48bb78', // Green
    '#ed8936', // Orange
    '#9f7aea', // Purple
    '#38b2ac', // Teal
    '#ec4899' // Pink
  ];
  return colors[index % colors.length];
};

export default WeightControlSlider;