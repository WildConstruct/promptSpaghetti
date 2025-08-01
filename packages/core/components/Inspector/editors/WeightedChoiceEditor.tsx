import React, { useCallback } from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { VariationList } from '../VariationList';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { WeightControlSlider, WeightControlOption, useWeightControlIntegration } from '../WeightControlSlider';
import { useRealTimePreview } from '../../../hooks/useRealTimePreview';
import { useUISettingsStore } from '../../../stores/uiSettingsStore';
import { useGraphStore } from '../../../graphStore';
import { HelpfulInput, 
  HelpfulButton,
  HelpfulSection }
  useContextualHelp 
 from '../../Help';

export interface WeightedChoiceEditorProps extends Omit<BaseNodeEditorProps, 'children'> { // WeightedChoice specific props can be added here
  onGlobalPreviewRequest?: () => void;
  export const WeightedChoiceEditor: React.FC<WeightedChoiceEditorProps> = ({ )
  nodeData
  onChange
  errors }
  onGlobalPreviewRequest
}) => {
  // WeightedChoice specific fields
  const choices = (nodeData.choices as string) || [];
  const weights = (nodeData.weights as number) || [];
  const name = (nodeData.name as string) || (nodeData.label as string) || 'WeightedChoice';
  // UI settings
  const { complexityLevel, shouldShowTechnicalFields } = useUISettingsStore();
  // Global graph state for triggering full preview
  const { nodes, edges } = useGraphStore();
  // Convert choices and weights to WeightControlOptions
  const weightOptions: WeightControlOption = choices.map((choice, index) => ({)
  id: `choice_${index}`}

  text: choice
    weight: weights[index] || 1;
  }));
  // Real-time preview integration
  const { variants
    isGenerating
    performance
    error
    requestPreview
    forcePreview
    refreshVariant
    clearVariants }
    getPerformanceInsights
 = useRealTimePreview()
    name || 'WeightedChoice Result: {weighted_choice}'
    {}
    { maxVariants: 5
  debounceMs: 300
  enablePerformanceTracking: complexityLevel !== 'basic');
  // Weight control integration with global preview support
  const handleGlobalPreviewRequest = useCallback((weightOptions: WeightControlOption) => {
  console.log('[Epic 8.5-5] Weight change triggering global preview with', weightOptions.length, 'options');
  // Update the node data first
  const newChoices = weightOptions.map(option => option.text);
  const newWeights = weightOptions.map(option => option.weight);
  onChange({)
  choices: newChoices
  weights: newWeights }
});
    // Trigger global preview with updated graph after a short delay
    setTimeout(() => { onGlobalPreviewRequest?.() }, 50); // Short delay to ensure state updates
    // Keep local preview for immediate feedback
    requestPreview(weightOptions);
  }, [onChange, onGlobalPreviewRequest, requestPreview]);
  // Weight control integration with Epic 8.5 Task 6 enhancements
  const { handleOptionsChange, lastUpdateTime } = useWeightControlIntegration()
    weightOptions
    handleGlobalPreviewRequest
  );
  const handleChoicesChange = (newChoices: string) => { onChange({)
  choices: newChoices
  // Ensure weights array matches choices length
  weights: newChoices.map((_, index) => weights[index] || 1) }
});
  };
      newWeights[index] = Math.max(0, weight); // Ensure non-negative weights
    onChange({ weights: newWeights });
  };
  const handleNameChange = (value: unknown) => {
    onChange({ name: value as string, label: value as string });
  };
  // Contextual help for the node name field
  const { wrapWithHelp: wrapNameHelp } = useContextualHelp({ )
  id: 'weighted-choice-name'
  title: 'Node Name'
  description: 'Give your weighted choice node a descriptive name to identify it in your graph workflow.'
  category: 'basic'
  trigger: 'focus'
  position: 'right'
  showOnDisclosureLevel: ['basic', 'advanced', 'debug']
  examples: ['Character Selection', 'Action Randomizer', 'Spell Generator']
  priority: 'high' }
});
  // Contextual help for choice options
  const { wrapWithHelp: wrapChoicesHelp } = useContextualHelp({ )
  id: 'weighted-choice-options'
  title: 'Choice Options'
  description: 'Add the different options that this node can randomly select from. Each option can have its own probability weight.'
  category: 'basic'
  trigger: 'hover'
  position: 'left'
  showOnDisclosureLevel: ['basic', 'advanced', 'debug']
  examples: ['Fire Spell', 'Ice Spell', 'Lightning Spell']
  relatedFeatures: ['weight-controls', 'drag-reorder']
  priority: 'high' }
});
  // Contextual help for weight controls
  const { wrapWithHelp: wrapWeightsHelp } = useContextualHelp({ )
  id: 'weighted-choice-weights'
  title: 'Weight Controls'
  description: 'Adjust the probability of each option being selected. Higher weights make options more likely to appear in results.'
  category: 'advanced'
  trigger: 'hover'
  position: 'top'
  showOnDisclosureLevel: ['advanced', 'debug']
  examples: ['70% Fire, 20% Ice, 10% Lightning']
  relatedFeatures: ['weight-presets', 'distribution-charts']
  priority: 'medium' }
});
  return;
    <div className="weighted-choice-editor">
      {/* BASIC LEVEL: Essential node configuration */}
      <ProgressiveDisclosureSection
        title="Essential Settings"
        level="basic"
        description="Core node configuration for weighted choices"
        defaultExpanded={true}
        priority="critical"
        fieldName="name"
      >
        {wrapNameHelp()
          <TextFieldEditor
            label="Choice Name"
            value={name}
            fieldKey="name"
            zodType={null}
            onChange={handleNameChange}
            placeholder="Enter a name for this weighted choice node..."
          />
        )}
      </ProgressiveDisclosureSection>
      {/* BASIC LEVEL: Choice options configuration */}
      <ProgressiveDisclosureSection
        title="Choice Options"
        level="basic"
        description="Add and manage the available choices for random selection"
        defaultExpanded={true}
        priority="critical"
        fieldName="choices"
      >
{wrapChoicesHelp()
          <div style={{ marginBottom: 12 }}>
            <label style={ {
  display: 'block'
  fontWeight: 500
  marginBottom: 8
  color: '#e2e8f0'
  fontSize: 12 }
}>
              Available Choices
            </label>
            <VariationList
              nodeId={nodeData.id as string}
              variations={choices}
              onAdd={(choice) => handleChoicesChange([...choices, choice])}
              onRemove={ (index) => {
                const newChoices = choices.filter((_, i) => i !== index);
                handleChoicesChange(newChoices) }}
              onUpdate={ (index, newValue) => {
                const newChoices = [...choices];
                newChoices[index] = newValue;
                handleChoicesChange(newChoices) }}
              onReorder={ (fromIndex, toIndex) => {
                const newChoices = [...choices];
                const [movedItem] = newChoices.splice(fromIndex, 1);
                newChoices.splice(toIndex, 0, movedItem);
                handleChoicesChange(newChoices) }}
              placeholder="Enter choice option..."
              maxVariations={20}
              allowQuickEntry={true}
            />
          </div>
        )}
      </ProgressiveDisclosureSection>
      {/* ADVANCED LEVEL: Weight Controls */}
      {choices.length > 0 && ()
        <ProgressiveDisclosureSection
          title="Weight Controls"
          level="advanced"
          description="Fine-tune the probability of each choice being selected"
          defaultExpanded={false}
          priority="important"
          fieldName="weights"
        >
{wrapWeightsHelp()
            <WeightControlSlider
              options={weightOptions}
              onOptionsChange={handleOptionsChange}
              onPreviewRequest={handleGlobalPreviewRequest}
              visualization={complexityLevel === 'basic' ? 'slider-only' : 'pie'}
              showLegend={true}
              enableDragReorder={complexityLevel !== 'basic'}
              showPresets={true}
              compactPresets={complexityLevel === 'basic'}
            />
          )}
          {/* Epic 8.5 Task 6: Real-time Weight Integration Status */}
          { complexityLevel !== 'basic' && ()
            <div style={{
  marginTop: 12
  padding: 8
  background: 'rgba(77, 124, 255, 0.1)'
  border: '1px solid rgba(77, 124, 255, 0.2)'
  borderRadius: 4
  fontSize: 11
  color: '#4d7cff' }
}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                🎬 <strong>Epic 8.5 Real-Time Integration</strong>
                <span style={ {
  fontSize: 8
  background: 'rgba(77, 124, 255, 0.3)'
  padding: '1px 4px'
  borderRadius: 6
  fontWeight: 600 }
}>
                  TASK 6
                </span>
              </div>
              <div style={{ fontSize: 10, opacity: 0.9 }}>
                Weight changes automatically trigger debounced 5-seed preview generation
              </div>
              <div style={ {
  fontSize: 9
  opacity: 0.7
  marginTop: 4
  display: 'flex'
  alignItems: 'center'
  gap: 4 }
}>
                <span>Last update:</span>
                <span style={ {
  fontFamily: 'monospace'
  background: 'rgba(255, 255, 255, 0.2)'
  padding: '1px 4px'
  borderRadius: 2 }
}>
                  {new Date(lastUpdateTime).toLocaleTimeString()}
                </span>
                <div style={ {
  width: 6
  height: 6
  borderRadius: '50%'
  background: Date.now() - lastUpdateTime < 2000 ? '#10b981' : '#6b7280'
  animation: Date.now() - lastUpdateTime < 2000 ? 'pulse 1.5s infinite' : 'none' }
} />
              </div>
            </div>
          )}
        </ProgressiveDisclosureSection>
      )}
      {/* ADVANCED LEVEL: Real-Time Preview Results */}
      {variants.length > 0 && ()
        <ProgressiveDisclosureSection
          title="Real-Time Preview"
          level="advanced"
          description="Live preview of weighted choice results with performance metrics"
          defaultExpanded={false}
          priority="standard"
          fieldName="preview"
        >
          <div style={{ marginBottom: 12 }}>
            <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  marginBottom: 8 }
}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e8f0' }}>
                Live Results {isGenerating && '⚡'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => forcePreview(weightOptions)}
                  disabled={isGenerating}
                  style={ {
  padding: '2px 6px'
  fontSize: 10
  background: '#4a5568'
  border: 'none'
  borderRadius: 2
  color: '#e2e8f0'
  cursor: isGenerating ? 'wait' : 'pointer'
  opacity: isGenerating ? 0.6 : 1 }
}
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={clearVariants}
                  style={ {
  padding: '2px 6px'
  fontSize: 10
  background: '#4a5568'
  border: 'none'
  borderRadius: 2
  color: '#e2e8f0'
  cursor: 'pointer' }
}
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
            { error && ()
              <div style={{
  padding: 8
  background: '#fed7d7'
  color: '#c53030'
  borderRadius: 4
  fontSize: 12
  marginBottom: 8 }
}>
                Error: {error}
              </div>
            )}
            <div style={ {
  background: '#1a202c'
  border: '1px solid #4a5568'
  borderRadius: 6
  padding: 12 }
}>
              {variants.map((variant, index) => ()
                <div
                  key={variant.id}
                  style={ {
  marginBottom: index < variants.length - 1 ? 12 : 0
  padding: 8
  background: '#2d3748'
  borderRadius: 4 }
}
                >
                  <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  marginBottom: 4 }
}>
                    <div style={ {
  fontSize: 10
  color: '#a0aec0' }
}>
                      Variant {index + 1} • Seed {variant.seed}
                    </div>
                    <button
                      onClick={() => refreshVariant(variant.id)}
                      style={ {
  padding: '1px 4px'
  fontSize: 9
  background: 'none'
  border: '1px solid #4a5568'
  borderRadius: 2
  color: '#a0aec0'
  cursor: 'pointer' }

                    >
                      🔄
                    </button>
                  </div>
                  <div style={ {
  color: '#e2e8f0'
  fontSize: 12
  lineHeight: 1.4 }
}>
                    "{variant.result}"
                  </div>
                </div>
              ))}
            </div>
            {/* Performance Insights (Advanced/Debug only) */}
            { shouldShowTechnicalFields() && ()
              <div style={{
  marginTop: 12
  padding: 8
  background: '#2d3748'
  borderRadius: 4
  fontSize: 10
  color: '#a0aec0' }
}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Performance:</div>
                <div>Avg. time: {performance.averageExecutionTime.toFixed(0)}ms</div>
                <div>Generations: {performance.totalGenerations}</div>
                <div>Success rate: {performance.successRate.toFixed(1)}%</div>
                {getPerformanceInsights().length > 0 && ()
                  <div style={{ marginTop: 4 }}>
                    {getPerformanceInsights().join(' • ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </ProgressiveDisclosureSection>
      )}
      {/* BASIC LEVEL: Simple Preview (Basic Mode Fallback) */}
      {complexityLevel === 'basic' && variants.length === 0 && ()
        <ProgressiveDisclosureSection
          title="Choice Preview"
          level="basic"
          description="Preview of how weighted choices will behave"
          defaultExpanded={false}
          priority="standard"
          fieldName="basicPreview"
        >
        <div style={ {
  background: '#1a202c'
  border: '1px solid #4a5568'
  borderRadius: 4
  padding: 12
  fontSize: 12
  color: '#e2e8f0' }
}>
          {choices.length === 0 ? ()
            <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
              Add choices to see preview
            </div>
          ) : ()
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                This node will randomly select one of:
              </div>
              {choices.map((choice, index) => {
                const weight = weights[index] || 1;
                const percentage = weights.length > 0 ;
                  ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                  : Math.round(100 / choices.length);
                return;
                  <div key={index} style={ {
  display: 'flex'
  justifyContent: 'space-between'
  marginBottom: 4
  padding: '2px 4px'
  background: 'rgba(66, 153, 225, 0.1)'
  borderRadius: 2 }
}>
                    <span>"{choice}"</span>
                    <span style={{ color: '#a0aec0' }}>{percentage}% chance</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ProgressiveDisclosureSection>
      )}
    </div>
  );
};

export default WeightedChoiceEditor;