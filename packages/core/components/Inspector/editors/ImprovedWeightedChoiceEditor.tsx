/**
 * Improved Weighted Choice Editor for Inspector Panel
 * Features raw weight system with presets and better UX
 */

import React, { useCallback, useMemo } from 'react';
import { RawWeightControl } from '../../WeightControls/RawWeightControl';

interface WeightedChoiceEditorProps {
  nodeId: string;
  nodeData: Record<string, unknown>;
  schema?: unknown;
  onChange: (partial: Record<string, unknown>) => void;
  onGlobalPreviewRequest?: () => void;
}

export const ImprovedWeightedChoiceEditor: React.FC<WeightedChoiceEditorProps> = ({
  nodeId,
  nodeData,
  onChange,
  onGlobalPreviewRequest
}) => {
  // Extract current data
  const choices = (nodeData.choices as string[]) || [];
  const weights = (nodeData.weights as number[]) || [];
  const name = (nodeData.name as string) || (nodeData.label as string) || 'Weighted Choice';

  // Convert to weight options format
  const weightOptions = useMemo(() => {
    return choices.map((choice, index) => ({
      id: `${nodeId}_choice_${index}`,
      text: choice,
      weight: weights[index] || 50
    }));
  }, [nodeId, choices, weights]);

  // Handle weight options change
  const handleOptionsChange = useCallback((newOptions: any[]) => {
    const newChoices = newOptions.map(opt => opt.text);
    const newWeights = newOptions.map(opt => opt.weight);
    
    onChange({
      choices: newChoices,
      weights: newWeights
    });

    // Trigger preview after a short delay
    if (onGlobalPreviewRequest) {
      setTimeout(onGlobalPreviewRequest, 100);
    }
  }, [onChange, onGlobalPreviewRequest]);

  // Handle name change
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      name: e.target.value,
      label: e.target.value
    });
  }, [onChange]);

  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '100%',
      minHeight: '400px'
    }}>
      {/* Node Name Field */}
      <div style={{
        padding: '12px',
        background: '#2d3748',
        borderRadius: '8px',
        border: '1px solid #4a5568'
      }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          color: '#a0aec0',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Node Name
        </label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter a descriptive name..."
          style={{
            width: '100%',
            padding: '8px 10px',
            background: '#1a202c',
            border: '1px solid #4a5568',
            borderRadius: '4px',
            color: '#e2e8f0',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4299e1';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#4a5568';
          }}
        />
        <div style={{
          marginTop: '4px',
          fontSize: '10px',
          color: '#718096'
        }}>
          Give your weighted choice a descriptive name to identify it in the graph
        </div>
      </div>

      {/* Weight Controls Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: 600,
          color: '#e2e8f0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>⚖️</span> Weight Distribution
        </h4>

        {/* Raw Weight Control with Presets */}
        <RawWeightControl
          options={weightOptions}
          onOptionsChange={handleOptionsChange}
          showPresets={true}
          compactPresets={false}
          minWeight={0}
          maxWeight={100}
        />
      </div>

      {/* Info Section */}
      <div style={{
        padding: '12px',
        background: '#1a202c',
        borderRadius: '6px',
        border: '1px solid #2d3748',
        borderLeft: '3px solid #4299e1'
      }}>
        <h5 style={{
          margin: '0 0 6px 0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#60a5fa'
        }}>
          How it works
        </h5>
        <p style={{
          margin: 0,
          fontSize: '10px',
          color: '#9ca3af',
          lineHeight: 1.5
        }}>
          Each option's weight determines its probability of being selected. 
          Higher weights mean higher chance. The percentages show the actual 
          probability based on all weights combined.
        </p>
      </div>

      {/* Quick Stats */}
      {weightOptions.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          padding: '8px',
          background: '#2d3748',
          borderRadius: '6px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '6px'
          }}>
            <div style={{
              fontSize: '9px',
              color: '#718096',
              marginBottom: '2px'
            }}>
              Options
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#e2e8f0'
            }}>
              {weightOptions.length}
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '6px',
            borderLeft: '1px solid #4a5568',
            borderRight: '1px solid #4a5568'
          }}>
            <div style={{
              fontSize: '9px',
              color: '#718096',
              marginBottom: '2px'
            }}>
              Total Weight
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#e2e8f0'
            }}>
              {weightOptions.reduce((sum, opt) => sum + opt.weight, 0)}
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '6px'
          }}>
            <div style={{
              fontSize: '9px',
              color: '#718096',
              marginBottom: '2px'
            }}>
              Highest %
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#68d391'
            }}>
              {(() => {
                const total = weightOptions.reduce((sum, opt) => sum + opt.weight, 0);
                const max = Math.max(...weightOptions.map(opt => opt.weight));
                return total > 0 ? `${((max / total) * 100).toFixed(0)}%` : '0%';
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedWeightedChoiceEditor;