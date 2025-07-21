import React, { useState } from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor } from '../SelectEditor';
import { VariationList } from '../VariationList';
import { CollapsibleSection } from '../CollapsibleSection';
import { SequencePatternConfig } from '../../../runtime/nodes/Sequential';

export interface SequentialEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Sequential specific props can be added here
}

export const SequentialEditor: React.FC<SequentialEditorProps> = (props) => {
  const { nodeData, onChange } = props;
  
  // Sequential specific fields
  const sequence = (nodeData.sequence as string[]) || [];
  const patternType = (nodeData.patternType as string) || 'linear';
  const patternConfig = (nodeData.patternConfig as SequencePatternConfig) || {};
  const name = (nodeData.name as string) || (nodeData.label as string) || 'Sequential';

  // Pattern-specific configuration
  const weights = patternConfig.weights || [];
  const allowRepeats = patternConfig.allowRepeats ?? true;

  // State for collapsible sections
  const [commonPropsCollapsed, setCommonPropsCollapsed] = useState(false);
  const [sequenceCollapsed, setSequenceCollapsed] = useState(false);
  const [patternCollapsed, setPatternCollapsed] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  const handleSequenceChange = (newSequence: string[]) => {
    onChange({
      sequence: newSequence,
      // Ensure weights array matches sequence length for weighted pattern
      patternConfig: {
        ...patternConfig,
        weights: patternType === 'weighted' 
          ? newSequence.map((_, index) => weights[index] || 1)
          : weights
      }
    });
  };

  const handlePatternTypeChange = (value: unknown) => {
    const newPatternType = value as string;
    const newConfig = { ...patternConfig };
    
    // Initialize pattern-specific configuration
    if (newPatternType === 'weighted') {
      newConfig.weights = sequence.map((_, index) => weights[index] || 1);
    } else if (newPatternType === 'random') {
      newConfig.allowRepeats = allowRepeats;
    }
    
    onChange({ 
      patternType: newPatternType,
      patternConfig: newConfig
    });
  };

  const handleWeightChange = (index: number, weight: number) => {
    const newWeights = [...weights];
    newWeights[index] = Math.max(0, weight);
    onChange({
      patternConfig: {
        ...patternConfig,
        weights: newWeights
      }
    });
  };

  const handleAllowRepeatsChange = (value: unknown) => {
    onChange({
      patternConfig: {
        ...patternConfig,
        allowRepeats: Boolean(value)
      }
    });
  };

  const handleNameChange = (value: unknown) => {
    onChange({ name: value as string, label: value as string });
  };

  const patternOptions = [
    { value: 'linear', label: 'Linear - Sequential order, stops at end' },
    { value: 'cyclical', label: 'Cyclical - Cycles through infinitely' },
    { value: 'random', label: 'Random - Random selection' },
    { value: 'weighted', label: 'Weighted - Probability-based selection' }
  ];

  return (
    <div className="sequential-editor">
      {/* Basic Properties */}
      <CollapsibleSection 
        title="Basic Properties" 
        collapsed={commonPropsCollapsed}
        onToggle={() => setCommonPropsCollapsed(!commonPropsCollapsed)}
      >
        <TextFieldEditor
          label="Name"
          value={name}
          fieldKey="name"
          zodType={null}
          onChange={handleNameChange}
          placeholder="Enter node name..."
        />
      </CollapsibleSection>

      {/* Sequence Items */}
      <CollapsibleSection 
        title="Sequence Items" 
        collapsed={sequenceCollapsed}
        onToggle={() => setSequenceCollapsed(!sequenceCollapsed)}
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Items to Sequence Through
          </label>
          <VariationList
            nodeId={nodeData.id as string}
            variations={sequence}
            onAdd={(item) => handleSequenceChange([...sequence, item])}
            onRemove={(index) => {
              const newSequence = sequence.filter((_, i) => i !== index);
              handleSequenceChange(newSequence);
            }}
            onUpdate={(index, newValue) => {
              const newSequence = [...sequence];
              newSequence[index] = newValue;
              handleSequenceChange(newSequence);
            }}
            onReorder={(fromIndex, toIndex) => {
              const newSequence = [...sequence];
              const [movedItem] = newSequence.splice(fromIndex, 1);
              newSequence.splice(toIndex, 0, movedItem);
              handleSequenceChange(newSequence);
            }}
            placeholder="Enter sequence item..."
            maxVariations={100}
            allowQuickEntry={true}
          />
        </div>
      </CollapsibleSection>

      {/* Pattern Configuration */}
      <CollapsibleSection 
        title="Pattern Configuration" 
        collapsed={patternCollapsed}
        onToggle={() => setPatternCollapsed(!patternCollapsed)}
      >
        <div style={{ marginBottom: 16 }}>
          <SelectEditor
            label="Sequence Pattern"
            value={patternType}
            fieldKey="patternType"
            zodType={null}
            onChange={handlePatternTypeChange}
            options={patternOptions}
          />
        </div>

        {/* Pattern-specific configuration */}
        {patternType === 'weighted' && sequence.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 500, 
              marginBottom: 8,
              color: '#e2e8f0',
              fontSize: 12
            }}>
              Item Weights
            </label>
            
            <div style={{ 
              background: '#2d3748', 
              border: '1px solid #4a5568', 
              borderRadius: 4,
              padding: 8
            }}>
              {sequence.map((item, index) => {
                const weight = weights[index] || 1;
                const percentage = weights.length > 0 
                  ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                  : Math.round(100 / sequence.length);

                return (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: index < sequence.length - 1 ? 8 : 0,
                      gap: 8
                    }}
                  >
                    <div style={{ 
                      flex: 1, 
                      fontSize: 12, 
                      color: '#e2e8f0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item || `Item ${index + 1}`}
                    </div>
                    
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={weight}
                      onChange={(e) => handleWeightChange(index, parseFloat(e.target.value) || 0)}
                      style={{
                        width: 60,
                        padding: 4,
                        border: '1px solid #4a5568',
                        borderRadius: 2,
                        background: '#1a202c',
                        color: '#e2e8f0',
                        fontSize: 11,
                        textAlign: 'center'
                      }}
                    />
                    
                    <div style={{ 
                      width: 40, 
                      fontSize: 10, 
                      color: '#a0aec0',
                      textAlign: 'right'
                    }}>
                      {percentage}%
                    </div>
                  </div>
                );
              })}
              
              {/* Total Weight Display */}
              <div style={{ 
                marginTop: 8, 
                paddingTop: 8, 
                borderTop: '1px solid #4a5568',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#a0aec0'
              }}>
                <span>Total Weight:</span>
                <span>{weights.reduce((sum, w) => sum + w, 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Weight Controls */}
            <div style={{ 
              marginTop: 8, 
              display: 'flex', 
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {
                  const equalWeight = 1;
                  const newWeights = sequence.map(() => equalWeight);
                  onChange({
                    patternConfig: { ...patternConfig, weights: newWeights }
                  });
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: 10,
                  background: '#4a5568',
                  border: 'none',
                  borderRadius: 2,
                  color: '#e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Equal Weights
              </button>
              
              <button
                onClick={() => {
                  const randomWeights = sequence.map(() => Math.random() * 10 + 1);
                  onChange({
                    patternConfig: { ...patternConfig, weights: randomWeights }
                  });
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: 10,
                  background: '#4a5568',
                  border: 'none',
                  borderRadius: 2,
                  color: '#e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Random Weights
              </button>
            </div>
          </div>
        )}

        {patternType === 'random' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 12,
              color: '#e2e8f0',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={allowRepeats}
                onChange={(e) => handleAllowRepeatsChange(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Allow Repeats
            </label>
            <div style={{
              fontSize: 10,
              color: '#a0aec0',
              marginTop: 2,
              marginLeft: 20
            }}>
              When unchecked, items won't repeat until all have been selected
            </div>
          </div>
        )}

        {/* Pattern Description */}
        <div style={{
          background: '#1a202c',
          border: '1px solid #4a5568',
          borderRadius: 4,
          padding: 8
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#e2e8f0',
            marginBottom: 4
          }}>
            Pattern Behavior:
          </div>
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            lineHeight: 1.4
          }}>
            {patternType === 'linear' && 
              'Goes through items in order from first to last, then continues returning the last item.'
            }
            {patternType === 'cyclical' && 
              'Cycles through items infinitely: item1 → item2 → ... → itemN → item1 → ...'
            }
            {patternType === 'random' && (allowRepeats
              ? 'Selects items randomly with the possibility of repeating the same item.'
              : 'Selects items randomly without repeats until all items have been chosen.'
            )}
            {patternType === 'weighted' && 
              'Selects items based on their assigned weights - higher weights have higher probability.'
            }
          </div>
        </div>
      </CollapsibleSection>

      {/* Preview */}
      <CollapsibleSection 
        title="Preview" 
        collapsed={previewCollapsed}
        onToggle={() => setPreviewCollapsed(!previewCollapsed)}
      >
        <div style={{
          background: '#1a202c',
          border: '1px solid #4a5568',
          borderRadius: 4,
          padding: 12,
          fontSize: 12,
          color: '#e2e8f0'
        }}>
          {sequence.length === 0 ? (
            <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
              Add sequence items to see preview
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Sequence Preview ({patternType}):
              </div>
              {patternType === 'linear' && (
                <div>
                  <div style={{ marginBottom: 6, color: '#90cdf4', fontSize: 11 }}>
                    Linear execution order:
                  </div>
                  {sequence.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: 2,
                      padding: '2px 4px',
                      background: index === 0 ? 'rgba(66, 153, 225, 0.2)' : 'rgba(66, 153, 225, 0.1)',
                      borderRadius: 2
                    }}>
                      <span style={{ minWidth: 20, color: '#a0aec0' }}>{index + 1}.</span>
                      <span>"{item}"</span>
                      {index === sequence.length - 1 && (
                        <span style={{ marginLeft: 8, fontSize: 9, color: '#fbb6ce' }}>
                          (repeats)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {patternType === 'cyclical' && (
                <div>
                  <div style={{ marginBottom: 6, color: '#90cdf4', fontSize: 11 }}>
                    Cyclical pattern:
                  </div>
                  {sequence.slice(0, Math.min(5, sequence.length)).map((item, index) => (
                    <div key={index} style={{ 
                      display: 'inline-block',
                      margin: '2px 4px',
                      padding: '2px 6px',
                      background: 'rgba(66, 153, 225, 0.1)',
                      borderRadius: 2
                    }}>
&quot;{item}&quot;
                    </div>
                  ))}
                  {sequence.length > 5 && (
                    <span style={{ color: '#a0aec0', fontSize: 10 }}>
                      ... +{sequence.length - 5} more
                    </span>
                  )}
                  <div style={{ marginTop: 4, fontSize: 9, color: '#fbb6ce' }}>
                    ↻ Cycles infinitely
                  </div>
                </div>
              )}
              
              {patternType === 'weighted' && weights.length > 0 && (
                <div>
                  <div style={{ marginBottom: 6, color: '#90cdf4', fontSize: 11 }}>
                    Selection probabilities:
                  </div>
                  {sequence.map((item, index) => {
                    const weight = weights[index] || 1;
                    const percentage = Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100);
                    return (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: 2,
                        padding: '2px 4px',
                        background: 'rgba(66, 153, 225, 0.1)',
                        borderRadius: 2
                      }}>
                        <span>"{item}"</span>
                        <span style={{ color: '#a0aec0' }}>{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {patternType === 'random' && (
                <div>
                  <div style={{ marginBottom: 6, color: '#90cdf4', fontSize: 11 }}>
                    Random selection from:
                  </div>
                  {sequence.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'inline-block',
                      margin: '2px 4px',
                      padding: '2px 6px',
                      background: 'rgba(66, 153, 225, 0.1)',
                      borderRadius: 2
                    }}>
&quot;{item}&quot;
                    </div>
                  ))}
                  <div style={{ marginTop: 6, fontSize: 9, color: '#fbb6ce' }}>
                    {allowRepeats ? '🔄 With repeats' : '🔒 No repeats until exhausted'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};