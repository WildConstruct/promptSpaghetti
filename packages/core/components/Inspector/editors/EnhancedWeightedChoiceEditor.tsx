import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { VariationList } from '../VariationList';
import { WeightSlider } from '../WeightSlider';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';

export interface EnhancedWeightedChoiceEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Enhanced WeightedChoice editor with progressive disclosure
}
/**
 * Epic 8.4 - Enhanced WeightedChoice Editor with Progressive Disclosure
 * 
 * Demonstrates the three-tier disclosure system:
 * - Basic: Essential name and choices only
 * - Advanced: Weight controls and randomization settings
 * - Debug: Node IDs, technical configurations, execution statistics
 */
export const EnhancedWeightedChoiceEditor: React.FC<EnhancedWeightedChoiceEditorProps> = ({ nodeId, nodeData, onChange }) => {
  // WeightedChoice specific fields
  const choices = (nodeData.choices as string[]) || [];
  const weights = (nodeData.weights as number[]) || [];
  const name = (nodeData.name as string) || (nodeData.label as string) || 'WeightedChoice';
  const handleChoicesChange = (newChoices: string[]) => {
    onChange({)
      choices: newChoices,
      // Ensure weights array matches choices length
      weights: newChoices.map((_, index) => weights[index] || 1)
    });
  };
  const handleWeightChange = (index: number, weight: number) => {
    const newWeights = [...weights];
    newWeights[index] = Math.max(0, weight); // Ensure non-negative weights
    onChange({ weights: newWeights });
  };
  const handleNameChange = (value: unknown) => {
    onChange({ name: value as string, label: value as string });
  };
  return ()
    <div className="enhanced-weighted-choice-editor">
      {/* BASIC LEVEL: Essential fields only */}
      <ProgressiveDisclosureSection
        title="Essential Settings"
        level="basic"
        description="Core node configuration"
        defaultExpanded={true}
      >
        <div style={{ marginBottom: 12 }}>
          <TextFieldEditor
            label="Name"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g., Character Emotion, Scene Type"
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 500, 
            color: '#e2e8f0',
            marginBottom: 6 ,
          }}>
            Choices
          </label>
          <VariationList
            variations={choices}
            onChange={handleChoicesChange}
            placeholder="Add a choice option..."
            maxVariations={10}
          />
        </div>
      </ProgressiveDisclosureSection>
      {/* ADVANCED LEVEL: Power user controls */}
      <ProgressiveDisclosureSection
        title="Weight Controls"
        level="advanced"
        description="Fine-tune randomization probabilities"
        defaultExpanded={false}
      >
        {choices.length > 0 && ()
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              fontSize: 12, 
              color: '#a0aec0', 
              marginBottom: 12,
              fontStyle: 'italic' ,
            }}>
              Adjust the probability of each choice being selected. Higher weights = more likely.
            </div>
            {choices.map((choice, index) => ()
              <div key={index} style={{ marginBottom: 8 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  marginBottom: 4,
                }}>
                  <div style={{ 
                    fontSize: 11, 
                    color: '#e2e8f0', 
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {choice.length > 20 ? `${choice.substring(0, 20)}...` : choice}
                  </div>
                  <div style={{ 
                    fontSize: 10, 
                    color: '#a0aec0',
                    minWidth: 40,
                    textAlign: 'right',
                  }}>
                    {((weights[index] || 1) / (weights.reduce((sum, w) => sum + (w || 1), 0)) * 100).toFixed(0)}%
                  </div>
                </div>
                <WeightSlider
                  value={weights[index] || 1}
                  onChange={(weight) => handleWeightChange(index, weight)}
                  min={0}
                  max={10}
                  step={0.1}
                />
              </div>
            ))}
          </div>
        )}
        {/* Advanced randomization controls */}
        <div style={{ 
          padding: 8, 
          background: '#2a4365', 
          borderRadius: 4,
          border: '1px solid #4a5568' 
        }}>
          <div style={{ 
            fontSize: 11, 
            color: '#90cdf4', 
            fontWeight: 500,
            marginBottom: 6 ,
          }}>
            ⚙️ Advanced Options
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 8,
            fontSize: 10,
            color: '#a0aec0' ,
          }}>
            <div>Total Weights: {weights.reduce((sum, w) => sum + (w || 1), 0).toFixed(1)}</div>
            <div>Choices: {choices.length}</div>
            <div>Min Weight: {Math.min(...weights.filter(w => w > 0)).toFixed(1) || 'N/A'}</div>
            <div>Max Weight: {Math.max(...weights).toFixed(1) || 'N/A'}</div>
          </div>
        </div>
      </ProgressiveDisclosureSection>
      {/* DEBUG LEVEL: Technical details */}
      <ProgressiveDisclosureSection
        title="Debug Information"
        level="debug"
        description="Technical node details"
        defaultExpanded={false}
      >
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: 10, 
          color: '#c4b5fd',
          background: '#2d1b69',
          padding: 8,
          borderRadius: 4,
          border: '1px solid #553c9a'
        }}>
          <div style={{ marginBottom: 6 }}>
            <strong>Node ID:</strong> {nodeId}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Node Type:</strong> WeightedChoice
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Inputs:</strong> {(nodeData.inputs as string[])?.length || 0}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Data Keys:</strong> {Object.keys(nodeData).join(', ')}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Validation:</strong> {choices.length > 0 ? '✅ Valid' : '❌ No choices defined'}
          </div>
          {/* Raw node data (collapsed by default) */}
          <details style={{ marginTop: 8 }}>
            <summary style={{ 
              cursor: 'pointer', 
              color: '#a0aec0',
              fontSize: 9,
            }}>
              Raw Node Data
            </summary>
            <pre style={{ 
              marginTop: 4,
              padding: 4,
              background: '#1a1a2e',
              borderRadius: 2,
              fontSize: 8,
              overflow: 'auto',
              maxHeight: 100,
            }}>
              {JSON.stringify(nodeData, null, 2)}
            </pre>
          </details>
        </div>
      </ProgressiveDisclosureSection>
    </div>
  );
};

export default EnhancedWeightedChoiceEditor;