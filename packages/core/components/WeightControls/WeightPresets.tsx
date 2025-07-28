// packages/core/components/WeightControls/WeightPresets.tsx
// Preset Weight Patterns for Story 8.3 Task 5
// Implements preset patterns: Equal, Linear Decrease, Exponential, Custom
import React, { useState } from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';

export interface WeightPreset {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'creative' | 'advanced' | 'custom';
  pattern: (options: WeightControlOption[]) => number[];
  icon?: string;
  preview?: string;
}

export interface WeightPresetsProps {
  options: WeightControlOption[];
  onApplyPreset: (newWeights: number[]) => void;
  onSaveCustomPreset?: (preset: Omit<WeightPreset, 'id'>) => void;
  customPresets?: WeightPreset[];
  className?: string;
  showCategories?: boolean;
  compact?: boolean;
}

// Built-in preset patterns
export const BUILT_IN_PRESETS: WeightPreset[] = [
  // Basic Patterns
  {
    id: 'equal',
    name: 'Equal',
    description: 'All options have equal probability',
    category: 'basic',
    icon: '⚖️',
    preview: '25% 25% 25% 25%',
    pattern: (options) => {
      const equalWeight = Math.round(100 / options.length);
      return options.map(() => equalWeight);
    }
  },
  {
    id: 'first-heavy',
    name: 'First Heavy',
    description: 'First option dominates, others equal',
    category: 'basic',
    icon: '🎯',
    preview: '70% 10% 10% 10%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      const remainingWeight = 100 - 70;
      const otherWeight = Math.round(remainingWeight / (options.length - 1));
      return options.map((_, index) => index === 0 ? 70 : otherWeight);
    }
  },
  {
    id: 'last-heavy',
    name: 'Last Heavy',
    description: 'Last option dominates, others equal',
    category: 'basic',
    icon: '🏁',
    preview: '10% 10% 10% 70%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      const remainingWeight = 100 - 70;
      const otherWeight = Math.round(remainingWeight / (options.length - 1));
      return options.map((_, index) => index === options.length - 1 ? 70 : otherWeight);
    }
  },
  // Creative Patterns
  {
    id: 'linear-decrease',
    name: 'Linear Decrease',
    description: 'Weights decrease linearly from first to last',
    category: 'creative',
    icon: '📉',
    preview: '40% 30% 20% 10%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      const weights: number[] = [];
      const totalSteps = options.length;
      for (let i = 0; i < totalSteps; i++) {
        // Linear decrease from high to low
        const weight = Math.round(((totalSteps - i) / totalSteps) * 60 + 10);
        weights.push(weight);
      }
      // Normalize to 100%
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => Math.round((w / sum) * 100));
    }
  },
  {
    id: 'linear-increase',
    name: 'Linear Increase',
    description: 'Weights increase linearly from first to last',
    category: 'creative',
    icon: '📈',
    preview: '10% 20% 30% 40%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      const weights: number[] = [];
      const totalSteps = options.length;
      for (let i = 0; i < totalSteps; i++) {
        // Linear increase from low to high
        const weight = Math.round(((i + 1) / totalSteps) * 60 + 10);
        weights.push(weight);
      }
      // Normalize to 100%
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => Math.round((w / sum) * 100));
    }
  },
  {
    id: 'bell-curve',
    name: 'Bell Curve',
    description: 'Middle options weighted higher',
    category: 'creative',
    icon: '🔔',
    preview: '15% 35% 35% 15%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      if (options.length === 2) return [50, 50];
      const weights: number[] = [];
      const center = (options.length - 1) / 2;
      for (let i = 0; i < options.length; i++) {
        // Gaussian-like distribution
        const distance = Math.abs(i - center);
        const maxDistance = Math.max(center, options.length - 1 - center);
        const normalized = 1 - (distance / maxDistance);
        const weight = Math.round(normalized * 40 + 10); // 10-50 range;
        weights.push(weight);
      }
      // Normalize to 100%
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => Math.round((w / sum) * 100));
    }
  },
  // Advanced Patterns
  {
    id: 'exponential-decrease',
    name: 'Exponential Decrease',
    description: 'Weights decrease exponentially',
    category: 'advanced',
    icon: '📉📉',
    preview: '50% 25% 13% 12%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      const weights: number[] = [];
      const base = 0.6; // Exponential decay factor;
      for (let i = 0; i < options.length; i++) {
        const weight = Math.round(Math.pow(base, i) * 50 + 5);
        weights.push(weight);
      }
      // Normalize to 100%
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => Math.round((w / sum) * 100));
    }
  },
  {
    id: 'fibonacci-weights',
    name: 'Fibonacci Weights',
    description: 'Weights follow Fibonacci sequence',
    category: 'advanced',
    icon: '🌀',
    preview: '8% 13% 21% 58%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      // Generate Fibonacci numbers
      const fib = [1, 1];
      for (let i = 2; i < options.length; i++) {
        fib[i] = fib[i-1] + fib[i-2];
      }
      // Normalize to 100%
      const sum = fib.slice(0, options.length).reduce((a, b) => a + b, 0);
      return fib.slice(0, options.length).map(f => Math.round((f / sum) * 100));
    }
  },
  {
    id: 'golden-ratio',
    name: 'Golden Ratio',
    description: 'Weights based on golden ratio proportions',
    category: 'advanced',
    icon: '🏛️',
    preview: '62% 23% 9% 6%',
    pattern: (options) => {
      if (options.length === 0) return [];
      if (options.length === 1) return [100];
      const phi = 1.618033988749; // Golden ratio;
      const weights: number[] = [];
      for (let i = 0; i < options.length; i++) {
        const weight = Math.round(Math.pow(1/phi, i) * 60 + 5);
        weights.push(weight);
      }
      // Normalize to 100%
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => Math.round((w / sum) * 100));
    }
  }
];

export const WeightPresets: React.FC<WeightPresetsProps> = ({)
  options,
  onApplyPreset,
  onSaveCustomPreset,
  customPresets = [],
  className = '',
  showCategories = true,
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customPresetName, setCustomPresetName] = useState('');
  const [customPresetDescription, setCustomPresetDescription] = useState('');
  const allPresets = [...BUILT_IN_PRESETS, ...customPresets];
  const filteredPresets = selectedCategory === 'all' ;
    ? allPresets 
    : allPresets.filter(preset => preset.category === selectedCategory);
  const categories = [;
    { id: 'all', name: 'All', icon: '📋' },
    { id: 'basic', name: 'Basic', icon: '🎯' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'advanced', name: 'Advanced', icon: '⚙️' },
    { id: 'custom', name: 'Custom', icon: '💾' }
  ];
  const handleApplyPreset = (preset: WeightPreset) => {
    const newWeights = preset.pattern(options);
    onApplyPreset(newWeights);
  };
  const handleSaveCurrentWeights = () => {
    if (!customPresetName.trim()) return;
    const currentWeights = options.map(opt => opt.weight);
    const newPreset: Omit<WeightPreset, 'id'> = {
      name: customPresetName.trim(),
      description: customPresetDescription.trim() || 'Custom weight pattern',
      category: 'custom',
      pattern: () => [...currentWeights],
      preview: currentWeights.map(w => `${w}%`).join(' ')}
    };
    onSaveCustomPreset?.(newPreset);
    setShowSaveDialog(false);
    setCustomPresetName('');
    setCustomPresetDescription('');
  };
  const resetToEqual = () => {
    const equalPreset = BUILT_IN_PRESETS.find(p => p.id === 'equal');
    if (equalPreset) {
      handleApplyPreset(equalPreset);
    }
  };
  if (compact) {
    return ()
      <div className={`weight-presets compact ${className}`} style={{}
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
      }}>
        {BUILT_IN_PRESETS.slice(0, 4).map(preset => ()
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset)}
            title={preset.description}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: '#4a5568',
              border: 'none',
              borderRadius: 3,
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {preset.icon} {preset.name}
          </button>
        ))}
        <button
          onClick={resetToEqual}
          title="Reset to equal weights"
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#e53e3e',
            border: 'none',
            borderRadius: 3,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    );
  }
  return ()
    <div className={`weight-presets ${className}`} style={{}
      background: '#2d3748',
      borderRadius: 6,
      padding: 16,
      color: '#e2e8f0',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          Weight Presets
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: '#38b2ac',
              border: 'none',
              borderRadius: 3,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            💾 Save Current
          </button>
          <button
            onClick={resetToEqual}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: '#e53e3e',
              border: 'none',
              borderRadius: 3,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>
      {/* Category Filter */}
      {showCategories && ()
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: 12,
          flexWrap: 'wrap',
        }}>
          {categories.map(category => ()
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                background: selectedCategory === category.id ? '#4299e1' : '#4a5568',
                border: 'none',
                borderRadius: 3,
                color: '#e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      )}
      {/* Preset Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '8px',
      }}>
        {filteredPresets.map(preset => ()
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset)}
            style={{
              padding: '8px',
              background: '#4a5568',
              border: '1px solid #718096',
              borderRadius: 4,
              color: '#e2e8f0',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#718096';
              e.currentTarget.style.borderColor = '#4299e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4a5568';
              e.currentTarget.style.borderColor = '#718096';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: '12px' }}>{preset.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>
                {preset.name}
              </span>
            </div>
            <div style={{
              fontSize: '9px',
              color: '#a0aec0',
              marginBottom: 4,
              lineHeight: 1.3,
            }}>
              {preset.description}
            </div>
            {preset.preview && ()
              <div style={{
                fontSize: '8px',
                color: '#68d391',
                fontFamily: 'monospace',
              }}>
                {preset.preview}
              </div>
            )}
          </button>
        ))}
      </div>
      {/* Save Custom Preset Dialog */}
      {showSaveDialog && ()
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#2d3748',
            padding: 20,
            borderRadius: 6,
            border: '1px solid #4a5568',
            minWidth: 300,
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 14 }}>
              Save Custom Preset
            </h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 12, 
                marginBottom: 4,
                color: '#a0aec0',
              }}>
                Preset Name
              </label>
              <input
                type="text"
                value={customPresetName}
                onChange={(e) => setCustomPresetName(e.target.value)}
                placeholder="Enter preset name..."
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: '#4a5568',
                  border: '1px solid #718096',
                  borderRadius: 3,
                  color: '#e2e8f0',
                  fontSize: 12,
                }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 12, 
                marginBottom: 4,
                color: '#a0aec0',
              }}>
                Description (optional)
              </label>
              <input
                type="text"
                value={customPresetDescription}
                onChange={(e) => setCustomPresetDescription(e.target.value)}
                placeholder="Describe this weight pattern..."
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: '#4a5568',
                  border: '1px solid #718096',
                  borderRadius: 3,
                  color: '#e2e8f0',
                  fontSize: 12,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: '6px 12px',
                  background: '#4a5568',
                  border: 'none',
                  borderRadius: 3,
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentWeights}
                disabled={!customPresetName.trim()}
                style={{
                  padding: '6px 12px',
                  background: customPresetName.trim() ? '#38b2ac' : '#4a5568',
                  border: 'none',
                  borderRadius: 3,
                  color: customPresetName.trim() ? 'white' : '#a0aec0',
                  cursor: customPresetName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 12,
                }}
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightPresets;