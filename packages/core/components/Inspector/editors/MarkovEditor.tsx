import React, { useState } from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { TextAreaEditor } from '../TextAreaEditor';
import { CollapsibleSection } from '../CollapsibleSection';

interface MarkovTransition {
  from: string;
  to: string;
  probability: number;
}

export interface MarkovEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Markov specific props can be added here
}

export const MarkovEditor: React.FC<MarkovEditorProps> = (props) => {
  const { nodeData, onChange } = props;
  
  // Markov specific fields
  const states = (nodeData.states as string[]) || [];
  const transitions = (nodeData.transitions as Record<string, Record<string, number>>) || {};
  const initialState = (nodeData.initialState as string) || '';
  const name = (nodeData.name as string) || (nodeData.label as string) || 'Markov';
  const maxTransitions = (nodeData.maxTransitions as number) || 1000;
  const detectLoops = (nodeData.detectLoops as boolean) ?? false;
  const terminationStates = (nodeData.terminationStates as string[]) || [];

  // State for collapsible sections
  const [commonPropsCollapsed, setCommonPropsCollapsed] = useState(false);
  const [statesCollapsed, setStatesCollapsed] = useState(false);
  const [transitionsCollapsed, setTransitionsCollapsed] = useState(false);
  const [settingsCollapsed, setSettingsCollapsed] = useState(true);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  // Convert transitions object to array for easier editing
  const getTransitionArray = (): MarkovTransition[] => {
    const result: MarkovTransition[] = [];
    for (const [from, targets] of Object.entries(transitions)) {
      for (const [to, probability] of Object.entries(targets)) {
        result.push({ from, to, probability });
      }
    }
    return result;
  };

  const setTransitionArray = (transitionArray: MarkovTransition[]) => {
    const newTransitions: Record<string, Record<string, number>> = {};
    
    for (const { from, to, probability } of transitionArray) {
      if (!newTransitions[from]) {
        newTransitions[from] = {};
      }
      if (probability > 0) { // Only include positive probabilities
        newTransitions[from][to] = probability;
      }
    }
    
    onChange({ transitions: newTransitions });
  };

  const transitionArray = getTransitionArray();

  const handleStatesChange = (newStates: string[]) => {
    // Update states and clean up invalid transitions
    const validStates = new Set(newStates);
    const cleanedTransitions: Record<string, Record<string, number>> = {};
    
    for (const [from, targets] of Object.entries(transitions)) {
      if (validStates.has(from)) {
        cleanedTransitions[from] = {};
        for (const [to, probability] of Object.entries(targets)) {
          if (validStates.has(to)) {
            cleanedTransitions[from][to] = probability;
          }
        }
      }
    }
    
    onChange({ 
      states: newStates,
      transitions: cleanedTransitions,
      // Update initial state if it's no longer valid
      initialState: newStates.includes(initialState) ? initialState : (newStates[0] || ''),
      // Clean up termination states
      terminationStates: terminationStates.filter(state => newStates.includes(state))
    });
  };

  const handleAddState = () => {
    const newStateName = `State ${states.length + 1}`;
    handleStatesChange([...states, newStateName]);
  };

  const handleRemoveState = (index: number) => {
    const newStates = states.filter((_, i) => i !== index);
    handleStatesChange(newStates);
  };

  const handleUpdateState = (index: number, newValue: string) => {
    const newStates = [...states];
    const oldState = states[index];
    newStates[index] = newValue;
    
    // Update transitions to use new state name
    const updatedTransitions: Record<string, Record<string, number>> = {};
    for (const [from, targets] of Object.entries(transitions)) {
      const newFrom = from === oldState ? newValue : from;
      updatedTransitions[newFrom] = {};
      for (const [to, probability] of Object.entries(targets)) {
        const newTo = to === oldState ? newValue : to;
        updatedTransitions[newFrom][newTo] = probability;
      }
    }
    
    onChange({ 
      states: newStates, 
      transitions: updatedTransitions,
      initialState: initialState === oldState ? newValue : initialState,
      terminationStates: terminationStates.map(state => state === oldState ? newValue : state)
    });
  };

  const handleAddTransition = () => {
    if (states.length >= 2) {
      const newTransition: MarkovTransition = {
        from: states[0],
        to: states[1],
        probability: 0.5
      };
      setTransitionArray([...transitionArray, newTransition]);
    }
  };

  const handleRemoveTransition = (index: number) => {
    const newArray = transitionArray.filter((_, i) => i !== index);
    setTransitionArray(newArray);
  };

  const handleUpdateTransition = (index: number, field: keyof MarkovTransition, value: string | number) => {
    const newArray = [...transitionArray];
    newArray[index] = { ...newArray[index], [field]: value };
    setTransitionArray(newArray);
  };

  const handleNameChange = (value: unknown) => {
    onChange({ name: value as string, label: value as string });
  };

  const handleInitialStateChange = (value: unknown) => {
    onChange({ initialState: value as string });
  };

  const handleMaxTransitionsChange = (value: unknown) => {
    onChange({ maxTransitions: Math.max(1, Number(value) || 1000) });
  };

  const handleDetectLoopsChange = (value: unknown) => {
    onChange({ detectLoops: Boolean(value) });
  };

  const handleTerminationStatesChange = (value: unknown) => {
    const stateList = String(value).split(',').map(s => s.trim()).filter(s => s && states.includes(s));
    onChange({ terminationStates: stateList });
  };

  const normalizeTransitions = (fromState: string) => {
    const stateTransitions = transitions[fromState] || {};
    const total = Object.values(stateTransitions).reduce((sum, prob) => sum + prob, 0);
    
    if (total > 0) {
      const normalizedTransitions = { ...transitions };
      normalizedTransitions[fromState] = {};
      
      for (const [to, prob] of Object.entries(stateTransitions)) {
        normalizedTransitions[fromState][to] = prob / total;
      }
      
      onChange({ transitions: normalizedTransitions });
    }
  };

  // Get probability totals for each state
  const getProbabilityTotals = (): Record<string, number> => {
    const totals: Record<string, number> = {};
    for (const state of states) {
      const stateTransitions = transitions[state] || {};
      totals[state] = Object.values(stateTransitions).reduce((sum, prob) => sum + prob, 0);
    }
    return totals;
  };

  const probabilityTotals = getProbabilityTotals();

  return (
    <div className="markov-editor">
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
        
        <div style={{ marginTop: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 4,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Initial State
          </label>
          <select
            value={initialState}
            onChange={(e) => handleInitialStateChange(e.target.value)}
            style={{
              width: '100%',
              padding: 6,
              border: '1px solid #4a5568',
              borderRadius: 4,
              background: '#2d3748',
              color: '#e2e8f0',
              fontSize: 12
            }}
          >
            <option value="">Select initial state...</option>
            {states.map((state, index) => (
              <option key={index} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </CollapsibleSection>

      {/* States */}
      <CollapsibleSection 
        title="States" 
        collapsed={statesCollapsed}
        onToggle={() => setStatesCollapsed(!statesCollapsed)}
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
              Markov Chain States
            </label>
            <button
              onClick={handleAddState}
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
              Add State
            </button>
          </div>
          
          {states.length === 0 ? (
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
              No states defined. Add states to create your Markov chain.
            </div>
          ) : (
            <div style={{
              background: '#2d3748',
              border: '1px solid #4a5568',
              borderRadius: 4,
              padding: 8
            }}>
              {states.map((state, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: index < states.length - 1 ? 8 : 0,
                    gap: 8
                  }}
                >
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => handleUpdateState(index, e.target.value)}
                    style={{
                      flex: 1,
                      padding: 4,
                      border: '1px solid #4a5568',
                      borderRadius: 2,
                      background: '#1a202c',
                      color: '#e2e8f0',
                      fontSize: 11
                    }}
                    placeholder={`State ${index + 1}`}
                  />
                  
                  {/* Probability total indicator */}
                  <div style={{
                    fontSize: 10,
                    color: probabilityTotals[state] === 1 ? '#68d391' : '#fbb6ce',
                    minWidth: 50,
                    textAlign: 'center'
                  }}>
                    {probabilityTotals[state]?.toFixed(2) || '0.00'}
                  </div>
                  
                  <button
                    onClick={() => handleRemoveState(index)}
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
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Transitions */}
      <CollapsibleSection 
        title="Transition Matrix" 
        collapsed={transitionsCollapsed}
        onToggle={() => setTransitionsCollapsed(!transitionsCollapsed)}
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
              State Transitions
            </label>
            <button
              onClick={handleAddTransition}
              disabled={states.length < 2}
              style={{
                padding: '4px 8px',
                fontSize: 10,
                background: states.length < 2 ? '#4a5568' : '#4299e1',
                border: 'none',
                borderRadius: 2,
                color: '#fff',
                cursor: states.length < 2 ? 'not-allowed' : 'pointer'
              }}
            >
              Add Transition
            </button>
          </div>
          
          {transitionArray.length === 0 ? (
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
              No transitions defined. Add transitions to define state behavior.
            </div>
          ) : (
            <div style={{
              background: '#2d3748',
              border: '1px solid #4a5568',
              borderRadius: 4,
              padding: 8
            }}>
              {transitionArray.map((transition, index) => (
                <div
                  key={index}
                  style={{
                    background: '#1a202c',
                    border: '1px solid #4a5568',
                    borderRadius: 4,
                    padding: 8,
                    marginBottom: index < transitionArray.length - 1 ? 8 : 0
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8
                  }}>
                    <select
                      value={transition.from}
                      onChange={(e) => handleUpdateTransition(index, 'from', e.target.value)}
                      style={{
                        flex: 1,
                        padding: 4,
                        border: '1px solid #4a5568',
                        borderRadius: 2,
                        background: '#2d3748',
                        color: '#e2e8f0',
                        fontSize: 11
                      }}
                    >
                      {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    
                    <span style={{ color: '#a0aec0', fontSize: 12 }}>→</span>
                    
                    <select
                      value={transition.to}
                      onChange={(e) => handleUpdateTransition(index, 'to', e.target.value)}
                      style={{
                        flex: 1,
                        padding: 4,
                        border: '1px solid #4a5568',
                        borderRadius: 2,
                        background: '#2d3748',
                        color: '#e2e8f0',
                        fontSize: 11
                      }}
                    >
                      {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => handleRemoveTransition(index)}
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
                      ✕
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <label style={{ fontSize: 10, color: '#a0aec0' }}>Probability:</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={transition.probability}
                      onChange={(e) => handleUpdateTransition(index, 'probability', parseFloat(e.target.value) || 0)}
                      style={{
                        width: 80,
                        padding: 4,
                        border: '1px solid #4a5568',
                        borderRadius: 2,
                        background: '#2d3748',
                        color: '#e2e8f0',
                        fontSize: 11,
                        textAlign: 'center'
                      }}
                    />
                    
                    <button
                      onClick={() => normalizeTransitions(transition.from)}
                      style={{
                        padding: '2px 6px',
                        fontSize: 9,
                        background: '#38a169',
                        border: 'none',
                        borderRadius: 2,
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      Normalize {transition.from}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Probability Summary */}
        {states.length > 0 && (
          <div style={{
            background: '#1a202c',
            border: '1px solid #4a5568',
            borderRadius: 4,
            padding: 8,
            marginTop: 12
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#e2e8f0',
              marginBottom: 4
            }}>
              Probability Totals by State:
            </div>
            <div style={{
              fontSize: 10,
              color: '#a0aec0',
              lineHeight: 1.4
            }}>
              {states.map(state => {
                const total = probabilityTotals[state] || 0;
                const isValid = Math.abs(total - 1.0) < 0.001;
                return (
                  <div key={state} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    color: isValid ? '#68d391' : '#fbb6ce'
                  }}>
                    <span>{state}:</span>
                    <span>{total.toFixed(3)} {isValid ? '✓' : '⚠'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Settings */}
      <CollapsibleSection 
        title="Settings" 
        collapsed={settingsCollapsed}
        onToggle={() => setSettingsCollapsed(!settingsCollapsed)}
      >
        <div style={{ marginBottom: 12 }}>
          <TextFieldEditor
            label="Max Transitions"
            value={maxTransitions}
            fieldKey="maxTransitions"
            zodType={null}
            onChange={handleMaxTransitionsChange}
            placeholder="1000"
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 2
          }}>
            Maximum number of transitions before forcing termination
          </div>
        </div>

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
              checked={detectLoops}
              onChange={(e) => handleDetectLoopsChange(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Detect Loops
          </label>
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 2,
            marginLeft: 20
          }}>
            Stop execution when repetitive state patterns are detected
          </div>
        </div>

        <div>
          <TextAreaEditor
            label="Termination States"
            value={terminationStates.join(', ')}
            fieldKey="terminationStates"
            zodType={null}
            onChange={handleTerminationStatesChange}
            placeholder="State1, State2, State3..."
            rows={2}
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 2
          }}>
            Comma-separated list of states that will stop the chain when reached
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
          {states.length === 0 ? (
            <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
              Add states to see Markov chain preview
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Markov Chain Configuration:
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#90cdf4' }}>States:</span> {states.length} total
                <br />
                <span style={{ color: '#90cdf4' }}>Initial:</span> {initialState || 'Not set'}
                <br />
                <span style={{ color: '#90cdf4' }}>Transitions:</span> {transitionArray.length} defined
              </div>

              {transitionArray.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#90cdf4', marginBottom: 4 }}>
                    Transition Matrix:
                  </div>
                  {states.map(fromState => {
                    const stateTransitions = transitions[fromState] || {};
                    const hasTransitions = Object.keys(stateTransitions).length > 0;
                    
                    if (!hasTransitions) return null;
                    
                    return (
                      <div key={fromState} style={{
                        marginBottom: 4,
                        padding: '2px 4px',
                        background: 'rgba(66, 153, 225, 0.1)',
                        borderRadius: 2,
                        fontSize: 10
                      }}>
                        <span style={{ fontWeight: 500 }}>{fromState}</span> →{' '}
                        {Object.entries(stateTransitions).map(([toState, prob]) => (
                          `${toState}(${(prob * 100).toFixed(1)}%)`
                        )).join(', ')}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};