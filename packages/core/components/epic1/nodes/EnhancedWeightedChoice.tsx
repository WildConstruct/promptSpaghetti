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
      case 'equal': {
        const equalWeight = Math.floor(100 / options.length);
        newOptions = options.map((opt, index) => ({
          ...opt,
          weight:
            index === options.length - 1
              ? 100 - equalWeight * (options.length - 1)
              : equalWeight
        }));
        break;
      }

      case 'random': {
        let remaining = 100;
        newOptions = options.map((opt, index) => {
          if (index === options.length - 1) {
            return { ...opt, weight: remaining };
          }
          const weight = Math.floor(Math.random() * remaining * 0.7);
          remaining -= weight;
          return { ...opt, weight };
        });
        break;
      }

      case 'golden': {
        const phi = 1.618;
        const weights = [1];
        for (let i = 1; i < options.length; i += 1) {
          weights.push(weights[i - 1] * phi);
        }
        const sum = weights.reduce((acc, weight) => acc + weight, 0);
        newOptions = options.map((opt, index) => ({
          ...opt,
          weight: Math.round((weights[index] / sum) * 100)
        }));
        break;
      }

      default:
        break;
    }

    onChange(newOptions);
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
