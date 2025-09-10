import React, { memo, useState, useEffect, useCallback } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { 
  PopulateChoicesButton,
  OptimizeWeightsButton,
  InspirationMode 
} from '../../Inspector/IntelligentFeatures';
import { useIntelligence } from '../contexts/IntelligenceContext';
import type { Choice, WeightOptimizationResult } from '../../../services/llm';
import './WeightedChoiceNode.css';
import './VisualFeedbackEnhancements.css';

export interface WeightedOption {
  text: string;
  weight: number;
  hasBranch?: boolean;
}

export interface WeightedChoiceNodeData extends EditableNodeData {
  options: WeightedOption[];
}

/**
 * WeightedChoice node for Epic 1 - inline editing with weight sliders
 */
export const WeightedChoiceNode = memo((props: NodeProps<WeightedChoiceNodeData>) => {
  // Ensure options is always an array
  const initialOptions = Array.isArray(props.data?.options) ? props.data.options : [];
  const [options, setOptions] = useState<WeightedOption[]>(initialOptions);
  const intelligence = useIntelligence();
  
  // Debug logging
  console.log('[WeightedChoiceNode] Intelligence context:', {
    consentGiven: intelligence.consentGiven,
    isOffline: intelligence.isOffline,
    hasNodeIntelligence: !!intelligence.nodeIntelligence,
    optionsLength: options?.length
  });

  // Normalize weights to ensure they sum to 100
  const normalizeWeights = (opts: WeightedOption[]): WeightedOption[] => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) return opts;
    
    return opts.map(opt => ({
      ...opt,
      weight: Math.round((opt.weight / totalWeight) * 100)
    }));
  };

  // Update option text
  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
  };

  // Update option weight
  const updateOptionWeight = (index: number, weight: number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], weight };
    setOptions(normalizeWeights(newOptions));
  };

  // Toggle branching for an option
  const toggleBranch = (index: number) => {
    const newOptions = [...options];
    newOptions[index] = { 
      ...newOptions[index], 
      hasBranch: !newOptions[index].hasBranch 
    };
    setOptions(newOptions);
  };

  // Add new option
  const addOption = () => {
    const newOptions = [...options, { text: '', weight: 50, hasBranch: false }];
    setOptions(normalizeWeights(newOptions));
  };

  // Remove option
  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(normalizeWeights(newOptions));
    }
  };

  // Check if any options have branching enabled
  const hasBranching = Array.isArray(options) && options.some(opt => opt.hasBranch);

  // AI suggestion handlers
  const handleChoicesGenerated = useCallback((choices: Choice[]) => {
    const newOptions = choices.map(choice => ({
      text: choice.text,
      weight: choice.weight || Math.round(100 / choices.length),
      hasBranch: false
    }));
    setOptions(normalizeWeights(newOptions));
  }, []);

  const handleWeightsOptimized = useCallback((result: WeightOptimizationResult) => {
    const optimizedOptions = result.optimized.map((choice, index) => ({
      ...options[index],
      weight: choice.weight
    }));
    setOptions(optimizedOptions);
  }, [options]);

  return (
    <>
      <BaseEditableNode
        {...props}
        className="weighted-choice"
        minWidth={280}
        minHeight={120}
        compactMinWidth={200}
        compactMinHeight={60}
        data={{
          ...props.data,
          options,
          onEdit: (value: string) => {
            // In edit mode, we save the options array
            props.data.onEdit?.(JSON.stringify(options));
          }
        }}
      >
      {({ isEditing, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div 
              className="epic1-weighted-choice-editor"
            >
              <div className="epic1-node-type-label">Weighted Choice</div>
              <div 
                className="epic1-options-list nodrag nopan nowheel"
                onWheel={(e) => {
                  // Stop propagation to prevent canvas panning
                  e.stopPropagation();
                  // Allow default scrolling behavior
                }}
                onPointerDown={(e) => {
                  // Prevent dragging when clicking in the scroll area
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  // Also stop mouse down for better compatibility
                  e.stopPropagation();
                }}
              >
                {options.map((option, index) => (
                  <div key={index} className="epic1-option-row">
                    <input
                      type="text"
                      className="epic1-option-text nodrag"
                      value={option.text}
                      onChange={(e) => updateOptionText(index, e.target.value)}
                      placeholder="Option text..."
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="epic1-weight-controls">
                      <input
                        type="range"
                        className="epic1-weight-slider nodrag"
                        min="0"
                        max="100"
                        value={option.weight}
                        onChange={(e) => {
                          updateOptionWeight(index, parseInt(e.target.value));
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        style={{ '--value': `${option.weight}%` } as React.CSSProperties}
                      />
                      <span className="epic1-weight-value">{option.weight}%</span>
                      <button
                        className={`epic1-branch-toggle nodrag ${option.hasBranch ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleBranch(index);
                        }}
                        type="button"
                        title="Toggle branching for this option"
                      >
                        ⚡
                      </button>
                      {options.length > 1 && (
                        <button
                          className="epic1-remove-option nodrag"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(index);
                          }}
                          title="Remove option"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="epic1-option-controls">
                {/* Debug: Always show for testing, but will check consent inside components */}
                {true && (
                  <div className="epic1-debug-consent">
                    <p>Debug - Consent: {String(intelligence.consentGiven)} | Service: {String(!!intelligence.nodeIntelligence)}</p>
                    {!intelligence.consentGiven && (
                      <button 
                        onClick={() => intelligence.setConsent(true)}
                        style={{ background: 'blue', color: 'white', padding: '4px 8px', margin: '4px' }}
                      >
                        Grant Consent (Debug)
                      </button>
                    )}
                  </div>
                )}
                
                {/* Intelligent Features - only show if consent given */}
                {intelligence.consentGiven && intelligence.nodeIntelligence && (
                  <div className="epic1-intelligent-controls">
                    {options.length === 0 ? (
                      <InspirationMode
                        upstreamContext="weighted choice node" // TODO: derive from graph
                        onInspirationSelected={handleChoicesGenerated}
                        intelligenceService={intelligence.nodeIntelligence}
                      />
                    ) : (
                      <div className="epic1-suggestion-buttons">
                        <PopulateChoicesButton
                          nodeText={JSON.stringify(options.map(opt => opt.text))}
                          context="weighted choice context" // TODO: derive from graph
                          currentChoices={options.map(opt => ({ text: opt.text, weight: opt.weight }))}
                          onChoicesGenerated={handleChoicesGenerated}
                          intelligenceService={intelligence.nodeIntelligence}
                        />
                        {options.length > 1 && (
                          <OptimizeWeightsButton
                            choices={options.map(opt => ({ text: opt.text, weight: opt.weight }))}
                            context="weighted choice context" // TODO: derive from graph
                            onWeightsOptimized={handleWeightsOptimized}
                            intelligenceService={intelligence.nodeIntelligence}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Existing controls */}
                <button
                  className="epic1-add-option nodrag"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    addOption();
                  }}
                  type="button"
                >
                  + Add Option
                </button>
                <div className="epic1-edit-actions">
                  <button
                    className="epic1-confirm nodrag"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      confirmEdit();
                    }}
                    type="button"
                  >
                    ✓
                  </button>
                  <button
                    className="epic1-cancel nodrag"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      cancelEdit();
                    }}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="epic1-weighted-choice-display">
            <div className="epic1-node-type-label">Weighted Choice</div>
            <div className="epic1-options-preview">
              {options.length === 0 ? (
                <span className="epic1-placeholder">Click to add options</span>
              ) : (
                options.map((option, index) => (
                  <div key={index} className="epic1-option-preview">
                    <span className="epic1-option-text-preview">
                      {option.text || '(empty)'}
                      {option.hasBranch && ' ⚡'}
                    </span>
                    <div className="epic1-weight-bar-container">
                      <div 
                        className="epic1-weight-bar"
                        style={{ width: `${option.weight}%` }}
                      />
                      <span className="epic1-weight-label">{option.weight}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }}
    </BaseEditableNode>
      
      {/* Add branch output handles when branching is enabled */}
      {hasBranching && options.map((option, index) => {
        if (!option.hasBranch) return null;
        return (
          <Handle
            key={`branch-${index}`}
            type="source"
            position={Position.Right}
            id={`branch-${index}`}
            className="epic1-branch-handle"
            style={{
              top: `${30 + (index * 35)}px`,
              background: '#fbbf24',
              width: '8px',
              height: '8px',
              border: '2px solid #1e1e1e',
              right: '-6px'
            }}
            title={`Branch: ${option.text || `Option ${index + 1}`}`}
          />
        );
      })}
    </>
  );
});

WeightedChoiceNode.displayName = 'WeightedChoiceNode';
