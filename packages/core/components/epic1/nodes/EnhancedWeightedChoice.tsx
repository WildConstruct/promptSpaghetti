import React from 'react';

interface EnhancedWeightedChoiceProps {
  options: Array<{ text: string; weight: number }>;
  onChange: (options: Array<{ text: string; weight: number }>) => void;
}

/**
 * @deprecated This component is deprecated. Use WeightedChoiceNode.tsx instead, 
 * which includes Epic 2 AI integrations (PopulateChoicesButton, OptimizeWeightsButton, InspirationMode).
 * 
 * Enhanced weighted choice component with additional features:
 * - Live total weight display
 * - Quick presets (Equal, Random, Golden Ratio)
 * - Keyboard shortcuts for weight adjustment
 */
export const EnhancedWeightedChoice: React.FC<EnhancedWeightedChoiceProps> = ({ 
  options, 
  onChange 
}) => {
  // Calculate total weight
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

  // Apply preset weight distributions
  const applyPreset = (preset: 'equal' | 'random' | 'golden') => {
    let newOptions = [...options];
    
    switch (preset) {
      case 'equal':
        const equalWeight = Math.floor(100 / options.length);
        newOptions = options.map((opt, i) => ({
          ...opt,
          weight: i === options.length - 1 
            ? 100 - (equalWeight * (options.length - 1)) 
            : equalWeight
        }));
        break;
        
      case 'random':
        let remaining = 100;
        newOptions = options.map((opt, i) => {
          if (i === options.length - 1) {
            return { ...opt, weight: remaining };
          }
          const weight = Math.floor(Math.random() * remaining * 0.7);
          remaining -= weight;
          return { ...opt, weight };
        });
        break;
        
      case 'golden':
        // Golden ratio distribution
        const phi = 1.618;
        let weights = [1];
        for (let i = 1; i < options.length; i++) {
          weights.push(weights[i - 1] * phi);
        }
        const sum = weights.reduce((a, b) => a + b, 0);
        newOptions = options.map((opt, i) => ({
          ...opt,
          weight: Math.round((weights[i] / sum) * 100)
        }));
        break;
    }
    
    onChange(newOptions);
  };

  // Handle keyboard shortcuts for weight adjustment
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const delta = e.shiftKey ? 10 : 1;
      const change = e.key === 'ArrowUp' ? delta : -delta;
      const newWeight = Math.max(0, Math.min(100, options[index].weight + change));
      
      const newOptions = [...options];
      newOptions[index] = { ...newOptions[index], weight: newWeight };
      onChange(newOptions);
    }
  };

  return (
    <div className="epic1-enhanced-weighted-choice">
      {/* Weight presets */}
      <div className="epic1-weight-presets">
        <button 
          className="epic1-preset-btn"
          onClick={() => applyPreset('equal')}
          title="Distribute weights equally"
        >
          =
        </button>
        <button 
          className="epic1-preset-btn"
          onClick={() => applyPreset('random')}
          title="Random distribution"
        >
          🎲
        </button>
        <button 
          className="epic1-preset-btn"
          onClick={() => applyPreset('golden')}
          title="Golden ratio distribution"
        >
          φ
        </button>
        <span className="epic1-total-weight">
          Total: {totalWeight}%
        </span>
      </div>
      
      {/* Weight adjustment hints */}
      <div className="epic1-weight-hints">
        <span>↑↓ adjust • Shift+↑↓ jump by 10</span>
      </div>
    </div>
  );
};