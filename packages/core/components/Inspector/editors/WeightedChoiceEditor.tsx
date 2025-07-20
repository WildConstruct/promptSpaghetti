import React, { useState } from 'react';
import { BaseNodeEditor, BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { VariationList } from '../VariationList';
import { CollapsibleSection } from '../CollapsibleSection';

export interface WeightedChoiceEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // WeightedChoice specific props can be added here
}

export const WeightedChoiceEditor: React.FC<WeightedChoiceEditorProps> = (props) => {
  const { nodeData, onChange, nodeId } = props;
  
  // WeightedChoice specific fields
  const choices = (nodeData.choices as string[]) || [];
  const weights = (nodeData.weights as number[]) || [];
  const name = (nodeData.name as string) || (nodeData.label as string) || 'WeightedChoice';

  // State for collapsible sections
  const [commonPropsCollapsed, setCommonPropsCollapsed] = useState(false);
  const [choicesCollapsed, setChoicesCollapsed] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  const handleChoicesChange = (newChoices: string[]) => {
    onChange({
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

  return (
    <div className="weighted-choice-editor">
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
          zodType={null as any}
          onChange={handleNameChange}
          placeholder="Enter node name..."
        />
      </CollapsibleSection>

      {/* Weighted Choices */}
      <CollapsibleSection 
        title="Weighted Choices" 
        collapsed={choicesCollapsed}
        onToggle={() => setChoicesCollapsed(!choicesCollapsed)}
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Choice Options
          </label>
          <VariationList
            nodeId={nodeData.id as string}
            variations={choices}
            onAdd={(choice) => handleChoicesChange([...choices, choice])}
            onRemove={(index) => {
              const newChoices = choices.filter((_, i) => i !== index);
              handleChoicesChange(newChoices);
            }}
            onUpdate={(index, newValue) => {
              const newChoices = [...choices];
              newChoices[index] = newValue;
              handleChoicesChange(newChoices);
            }}
            onReorder={(fromIndex, toIndex) => {
              const newChoices = [...choices];
              const [movedItem] = newChoices.splice(fromIndex, 1);
              newChoices.splice(toIndex, 0, movedItem);
              handleChoicesChange(newChoices);
            }}
            placeholder="Enter choice option..."
            maxVariations={20}
            allowQuickEntry={true}
          />
        </div>

        {/* Weight Controls */}
        {choices.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 500, 
              marginBottom: 8,
              color: '#e2e8f0',
              fontSize: 12
            }}>
              Weights
            </label>
            
            <div style={{ 
              background: '#2d3748', 
              border: '1px solid #4a5568', 
              borderRadius: 4,
              padding: 8
            }}>
              {choices.map((choice, index) => {
                const weight = weights[index] || 1;
                const percentage = weights.length > 0 
                  ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                  : Math.round(100 / choices.length);

                return (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: index < choices.length - 1 ? 8 : 0,
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
                      {choice || `Choice ${index + 1}`}
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
          </div>
        )}

        {/* Quick Actions */}
        {choices.length > 1 && (
          <div style={{ 
            marginTop: 12, 
            display: 'flex', 
            gap: 8,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                const equalWeight = 1;
                const newWeights = choices.map(() => equalWeight);
                onChange({ weights: newWeights });
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
                const randomWeights = choices.map(() => Math.random() * 10 + 1);
                onChange({ weights: randomWeights });
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
        )}
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
          {choices.length === 0 ? (
            <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
              Add choices to see preview
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                This node will randomly select one of:
              </div>
              {choices.map((choice, index) => {
                const weight = weights[index] || 1;
                const percentage = weights.length > 0 
                  ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                  : Math.round(100 / choices.length);
                
                return (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    padding: '2px 4px',
                    background: 'rgba(66, 153, 225, 0.1)',
                    borderRadius: 2
                  }}>
                    <span>"{choice}"</span>
                    <span style={{ color: '#a0aec0' }}>{percentage}% chance</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};