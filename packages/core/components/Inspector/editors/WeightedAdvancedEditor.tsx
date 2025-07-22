import React, { useState } from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor } from '../SelectEditor';
import { CollapsibleSection } from '../CollapsibleSection';
import { WeightSlider } from '../WeightSlider';
import { WeightVisualizationPanel } from '../../WeightVisualization';
import { WeightControlOption } from '../WeightControlSlider';
import { WeightedChoice, WeightDistributionType } from '../../../runtime/nodes/WeightedAdvanced';

export interface WeightedAdvancedEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // WeightedAdvanced specific props can be added here
}

export   
  // WeightedAdvanced specific fields
  const choices = (nodeData.choices as WeightedChoice[]) || [];
  const distributionType = (nodeData.distributionType as WeightDistributionType) || 'linear';
  const normalize = (nodeData.normalize as boolean) ?? true;
  const minWeight = (nodeData.minWeight as number) || 0;
  const name = (nodeData.name as string) || (nodeData.label as string) || 'WeightedAdvanced';

  // Distribution parameters
  const exponentialFactor = (nodeData.exponentialFactor as number) || 2;
  const gaussianMean = (nodeData.gaussianMean as number) || 0.5;
  const gaussianStd = (nodeData.gaussianStd as number) || 0.2;

  // State for collapsible sections
  const [commonPropsCollapsed, setCommonPropsCollapsed] = useState(false);
  const [choicesCollapsed, setChoicesCollapsed] = useState(false);
  const [distributionCollapsed, setDistributionCollapsed] = useState(false);
  const [visualizationCollapsed, setVisualizationCollapsed] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  // Convert WeightedChoice to WeightControlOptions for visualization
  const weightOptions: WeightControlOption[] = choices.map((choice, index) => ({
    id: `advanced_choice_${index}`,
    text: choice.value,
    weight: choice.weight
  }));

  const handleChoicesChange = (newChoices: WeightedChoice[]) => {
    onChange({ choices: newChoices });
  };

  const handleAddChoice = () => {
    const newChoice: WeightedChoice = {
      value: `Choice ${choices.length + 1}`,
      weight: 1
    };
    handleChoicesChange([...choices, newChoice]);
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = choices.filter((_, i) => i !== index);
    handleChoicesChange(newChoices);
  };

  const handleUpdateChoice = (index: number, field: keyof WeightedChoice, value: string | number) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    handleChoicesChange(newChoices);
  };

  const handleNameChange = (value: unknown) => {
    onChange({ name: value as string, label: value as string });
  };

  const handleDistributionTypeChange = (value: unknown) => {
    onChange({ distributionType: value as WeightDistributionType });
  };

  const handleNormalizeChange = (value: unknown) => {
    onChange({ normalize: Boolean(value) });
  };

  const handleMinWeightChange = (value: unknown) => {
    onChange({ minWeight: Math.max(0, Number(value) || 0) });
  };

  const handleExponentialFactorChange = (value: unknown) => {
    onChange({ exponentialFactor: Math.max(0.1, Number(value) || 2) });
  };

  const handleGaussianMeanChange = (value: unknown) => {
    onChange({ gaussianMean: Math.max(0, Math.min(1, Number(value) || 0.5)) });
  };

  const handleGaussianStdChange = (value: unknown) => {
    onChange({ gaussianStd: Math.max(0.01, Number(value) || 0.2) });
  };

  const distributionOptions = [
    { value: 'linear', label: 'Linear - Use original weights' },
    { value: 'exponential', label: 'Exponential - Apply power transformation' },
    { value: 'gaussian', label: 'Gaussian - Apply normal distribution curve' },
    { value: 'custom', label: 'Custom - User-defined transformation' }
  ];

  const equalizeWeights = () => {
    const newChoices = choices.map(choice => ({ ...choice, weight: 1 }));
    handleChoicesChange(newChoices);
  };

  const randomizeWeights = () => {
    const newChoices = choices.map(choice => ({ 
      ...choice, 
      weight: Math.random() * 10 + 1 
    }));
    handleChoicesChange(newChoices);
  };

  const setLinearProgression = () => {
    const newChoices = choices.map((choice, index) => ({ 
      ...choice, 
      weight: index + 1 
    }));
    handleChoicesChange(newChoices);
  };

  // Calculate effective weights after distribution and normalization
  const getEffectiveWeights = (): number[] => {
    if (choices.length === 0) return [];
    
    let weights = choices.map(choice => choice.weight);
    
    // Apply distribution transformation
    switch (distributionType) {
    case 'exponential':
      weights = weights.map(w => Math.pow(w, exponentialFactor));
      break;
    case 'gaussian':
      weights = weights.map((w, index) => {
        const x = index / (choices.length - 1 || 1);
        const gaussian = Math.exp(-0.5 * Math.pow((x - gaussianMean) / gaussianStd, 2));
        return w * gaussian;
      });
      break;
    case 'linear':
    case 'custom':
    default:
      // No transformation
      break;
    }
    
    // Apply minimum weight
    if (minWeight > 0) {
      weights = weights.map(w => Math.max(w, minWeight));
    }
    
    // Normalize if requested
    if (normalize) {
      const total = weights.reduce((sum, w) => sum + w, 0);
      if (total > 0) {
        weights = weights.map(w => w / total);
      }
    }
    
    return weights;
  };

  const effectiveWeights = getEffectiveWeights();

  return (
    <div className="weighted-advanced-editor">
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 8
          }}>
            <label style={{ 
              fontWeight: 500, 
              color: '#e2e8f0',
              fontSize: 12
            }}>
              Choice Options & Weights
            </label>
            <button
              onClick={handleAddChoice}
              style={{
                padding: '4px 8px',
                fontSize: 10,
                background: '#4299e1',
                border: 'none',
                borderRadius: 2,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Add Choice
            </button>
          </div>
          
          {choices.length === 0 ? (
            <div style={{
              background: '#2d3748',
              border: '1px solid #4a5568',
              borderRadius: 4,
              padding: 16,
              textAlign: 'center',
              color: '#a0aec0',
              fontSize: 12,
              fontStyle: 'italic'
            }}>
              No choices defined. Add choices to configure weighted selection.
            </div>
          ) : (
            <div style={{
              background: '#2d3748',
              border: '1px solid #4a5568',
              borderRadius: 4,
              padding: 8
            }}>
              {choices.map((choice, index) => {
                const effectiveWeight = effectiveWeights[index] || 0;
                const percentage = effectiveWeights.length > 0
                  ? Math.round(
                    effectiveWeight * (normalize ? 100 : effectiveWeights.reduce((sum,
                    w
                  ) => sum + w, 0) > 0 ? 100 / effectiveWeights.reduce((sum, w) => sum + w, 0) : 0))
                  : Math.round(100 / choices.length);

                return (
                  <div
                    key={index}
                    style={{
                      background: '#1a202c',
                      border: '1px solid #4a5568',
                      borderRadius: 4,
                      padding: 8,
                      marginBottom: index < choices.length - 1 ? 8 : 0
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 8,
                      gap: 8
                    }}>
                      <input
                        type="text"
                        value={choice.value}
                        onChange={(e) => handleUpdateChoice(index, 'value', e.target.value)}
                        style={{
                          flex: 1,
                          padding: 4,
                          border: '1px solid #4a5568',
                          borderRadius: 2,
                          background: '#2d3748',
                          color: '#e2e8f0',
                          fontSize: 11
                        }}
                        placeholder={`Choice ${index + 1}`}
                      />
                      
                      <button
                        onClick={() => handleRemoveChoice(index)}
                        style={{
                          background: '#e53e3e',
                          border: 'none',
                          borderRadius: 2,
                          color: '#fff',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: 10
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <label style={{ fontSize: 10, color: '#a0aec0', minWidth: 80 }}>
                        Raw Weight:
                      </label>
                      <WeightSlider
                        value={choice.weight}
                        onChange={(newWeight) => handleUpdateChoice(index, 'weight', newWeight)}
                        min={0}
                        max={Math.max(10, Math.max(...choices.map(c => c.weight)) * 1.5)}
                        step={0.1}
                        showNumeric={true}
                        label="Raw Weight"
                      />
                      
                      <div style={{ fontSize: 10, color: '#90cdf4', minWidth: 100 }}>
                        Effective: {effectiveWeight.toFixed(3)}
                      </div>
                      
                      <div style={{ 
                        fontSize: 10, 
                        color: '#a0aec0',
                        minWidth: 40,
                        textAlign: 'right'
                      }}>
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weight Controls */}
        {choices.length > 1 && (
          <div style={{ 
            marginTop: 12, 
            display: 'flex', 
            gap: 8,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={equalizeWeights}
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
              onClick={randomizeWeights}
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
            
            <button
              onClick={setLinearProgression}
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
              Linear Progression
            </button>
          </div>
        )}
      </CollapsibleSection>

      {/* Distribution Configuration */}
      <CollapsibleSection 
        title="Distribution Algorithm" 
        collapsed={distributionCollapsed}
        onToggle={() => setDistributionCollapsed(!distributionCollapsed)}
      >
        <div style={{ marginBottom: 16 }}>
          <SelectEditor
            label="Distribution Type"
            value={distributionType}
            fieldKey="distributionType"
            zodType={null as any}
            onChange={handleDistributionTypeChange}
            options={distributionOptions}
          />
        </div>

        {/* Distribution-specific parameters */}
        {distributionType === 'exponential' && (
          <div style={{ marginBottom: 16 }}>
            <TextFieldEditor
              label="Exponential Factor"
              value={exponentialFactor}
              fieldKey="exponentialFactor"
              zodType={null as any}
              onChange={handleExponentialFactorChange}
              placeholder="2.0"
            />
            <div style={{
              fontSize: 10,
              color: '#a0aec0',
              marginTop: 2
            }}>
              Higher values create more extreme weight distributions (factor &gt; 1 amplifies differences)
            </div>
          </div>
        )}

        {distributionType === 'gaussian' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <TextFieldEditor
                label="Gaussian Mean (0-1)"
                value={gaussianMean}
                fieldKey="gaussianMean"
                zodType={null as any}
                onChange={handleGaussianMeanChange}
                placeholder="0.5"
              />
              <div style={{
                fontSize: 10,
                color: '#a0aec0',
                marginTop: 2
              }}>
                Center of the bell curve (0 = first choice, 1 = last choice, 0.5 = middle)
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <TextFieldEditor
                label="Standard Deviation"
                value={gaussianStd}
                fieldKey="gaussianStd"
                zodType={null as any}
                onChange={handleGaussianStdChange}
                placeholder="0.2"
              />
              <div style={{
                fontSize: 10,
                color: '#a0aec0',
                marginTop: 2
              }}>
                Width of the bell curve (smaller = more focused, larger = more spread)
              </div>
            </div>
          </>
        )}

        {/* General settings */}
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 12,
            color: '#e2e8f0',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={normalize}
              onChange={(e) => handleNormalizeChange(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Normalize Weights
          </label>
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 2,
            marginLeft: 20
          }}>
            Scale final weights to sum to 1.0 for probability calculations
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <TextFieldEditor
            label="Minimum Weight"
            value={minWeight}
            fieldKey="minWeight"
            zodType={null as any}
            onChange={handleMinWeightChange}
            placeholder="0"
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 2
          }}>
            Minimum weight threshold (0 = no minimum)
          </div>
        </div>

        {/* Distribution Explanation */}
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
            Distribution Effects:
          </div>
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            lineHeight: 1.4
          }}>
            {distributionType === 'linear' && 
              'Uses original weights without modification. Simple and predictable.'
            }
            {distributionType === 'exponential' && 
              `Applies power transformation: weight^${exponentialFactor}. Amplifies differences between weights.`
            }
            {distributionType === 'gaussian' && 
              `Applies bell curve centered at position ${gaussianMean} with spread ${gaussianStd}. Favors choices near the center.`
            }
            {distributionType === 'custom' && 
              'Uses custom transformation function. Implementation depends on specific requirements.'
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
          {choices.length === 0 ? (
            <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
              Add weighted choices to see selection preview
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Weighted Selection Preview ({distributionType}):
              </div>
              {choices.map((choice, index) => {
                const rawWeight = choice.weight;
                const effectiveWeight = effectiveWeights[index] || 0;
                const percentage = effectiveWeights.length > 0 && effectiveWeights.reduce((sum, w) => sum + w, 0) > 0
                  ? Math.round((effectiveWeight / effectiveWeights.reduce((sum, w) => sum + w, 0)) * 100)
                  : Math.round(100 / choices.length);
                
                return (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                    padding: '4px 8px',
                    background: 'rgba(66, 153, 225, 0.1)',
                    borderRadius: 2
                  }}>
                    <span style={{ flex: 1 }}>"{choice.value}"</span>
                    <span style={{ color: '#a0aec0', fontSize: 10, minWidth: 80 }}>
                      {rawWeight} → {effectiveWeight.toFixed(3)}
                    </span>
                    <span style={{ color: '#90cdf4', minWidth: 50, textAlign: 'right' }}>
                      {percentage}%
                    </span>
                  </div>
                );
              })}
              
              {/* Total weights summary */}
              <div style={{ 
                marginTop: 8, 
                paddingTop: 8, 
                borderTop: '1px solid #4a5568',
                fontSize: 10,
                color: '#a0aec0'
              }}>
                Raw total: {choices.reduce((sum, c) => sum + c.weight, 0).toFixed(2)} → 
                Effective total: {effectiveWeights.reduce((sum, w) => sum + w, 0).toFixed(3)}
                {normalize && ' (normalized to 1.0)'}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Weight Distribution Visualization */}
      {choices.length > 0 && weightOptions.length > 0 && (
        <WeightVisualizationPanel
          options={weightOptions}
          title="Advanced Weight Distribution"
          defaultChartType="donut"
          showChartControls={true}
          showStatistics={true}
          collapsed={visualizationCollapsed}
          onCollapseChange={setVisualizationCollapsed}
          onOptionHover={(option) => {
            console.log('Advanced weight hovered:', option?.text);
          }}
          onOptionClick={(option) => {
            console.log('Advanced weight clicked:', option.text);
          }}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};