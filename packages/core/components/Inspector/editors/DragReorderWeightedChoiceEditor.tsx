/**
 * Drag-to-Reorder Weighted Choice Editor
 * Epic 8.3 Task 3 - Integration with Weighted Choice Nodes (E8.3-3-drag-reorder)
 * Epic 8.4 - Three-Tier Progressive Disclosure System
 * 
 * Professional weighted choice editor with drag-and-drop weight management
 * and three-tier progressive disclosure for filmmaker-friendly UI
 */

import React, { useState, useCallback, useMemo } from 'react';
import { DragReorderWeightManager, WeightedOption } from '../WeightManagement/DragReorderWeightManager';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';

export interface WeightedChoiceData {
  choices?: Array<{
    text: string;
    weight: number;
  }>;
  [key: string]: any;
}

export interface DragReorderWeightedChoiceEditorProps {
  data: WeightedChoiceData;
  onChange: (data: Partial<WeightedChoiceData>) => void;
  nodeId?: string;
  disabled?: boolean;
  theme?: 'light' | 'dark' | 'cinema';
  showPreview?: boolean;
  showAnalytics?: boolean;
}

/**
 * Enhanced WeightedChoice editor with professional drag-to-reorder interface
 */
export const DragReorderWeightedChoiceEditor: React.FC<DragReorderWeightedChoiceEditorProps> = ({
  data,
  onChange,
  nodeId = 'drag-reorder-weighted-choice',
  disabled = false,
  theme = 'cinema',
  showPreview = true,
  showAnalytics = true
}) => {
  const [isAddingChoice, setIsAddingChoice] = useState(false);
  const [newChoiceText, setNewChoiceText] = useState('');
  const [previewCount, setPreviewCount] = useState(10);
  const [previewResults, setPreviewResults] = useState<string[]>([]);

  // Convert data to WeightedOption format
  const options: WeightedOption[] = useMemo(() => {
    if (!data.choices || !Array.isArray(data.choices)) {
      return [];
    }
    
    return data.choices.map((choice, index) => ({
      id: `choice-${index}`,
      text: choice.text || `Choice ${index + 1}`,
      weight: choice.weight || 1,
      category: 'choice'
    }));
  }, [data.choices]);

  // Handle options change from drag-reorder component
  const handleOptionsChange = useCallback((newOptions: WeightedOption[]) => {
    const newChoices = newOptions.map(option => ({
      text: option.text,
      weight: option.weight
    }));
    
    onChange({ choices: newChoices });
  }, [onChange]);

  // Add new choice
  const handleAddChoice = useCallback(() => {
    if (!newChoiceText.trim()) return;
    
    const currentChoices = data.choices || [];
    const newChoices = [
      ...currentChoices,
      {
        text: newChoiceText.trim(),
        weight: 1
      }
    ];
    
    onChange({ choices: newChoices });
    setNewChoiceText('');
    setIsAddingChoice(false);
  }, [data.choices, newChoiceText, onChange]);

  // Remove choice
  const removeChoice = useCallback((index: number) => {
    const currentChoices = data.choices || [];
    const newChoices = currentChoices.filter((_, i) => i !== index);
    onChange({ choices: newChoices });
  }, [data.choices, onChange]);

  // Generate preview
  const generatePreview = useCallback(() => {
    if (!data.choices || data.choices.length === 0) {
      setPreviewResults([]);
      return;
    }

    const totalWeight = data.choices.reduce((sum, choice) => sum + choice.weight, 0);
    if (totalWeight <= 0) {
      setPreviewResults([]);
      return;
    }

    const results: string[] = [];
    for (let i = 0; i < previewCount; i++) {
      let random = Math.random() * totalWeight;
      for (const choice of data.choices) {
        random -= choice.weight;
        if (random <= 0) {
          results.push(choice.text);
          break;
        }
      }
    }
    
    setPreviewResults(results);
  }, [data.choices, previewCount]);

  // Calculate choice statistics
  const choiceStats = useMemo(() => {
    if (!data.choices || data.choices.length === 0) {
      return { totalWeight: 0, mostLikely: null, leastLikely: null };
    }

    const totalWeight = data.choices.reduce((sum, choice) => sum + choice.weight, 0);
    const sortedChoices = [...data.choices].sort((a, b) => b.weight - a.weight);
    
    return {
      totalWeight,
      mostLikely: sortedChoices[0],
      leastLikely: sortedChoices[sortedChoices.length - 1]
    };
  }, [data.choices]);

  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        accent: '#60a5fa',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171'
      },
      cinema: {
        background: '#1a1a1a',
        secondary: '#0d1117',
        border: '#ff7c00',
        text: '#ffffff',
        accent: '#ff7c00',
        success: '#00d084',
        warning: '#ffb700',
        error: '#ff6b6b'
      }
    };
    return themes[theme];
  };

  const styles = getThemeStyles();

  return (
    <div className="drag-reorder-weighted-choice-editor">
      {/* BASIC LEVEL: Essential drag-and-drop choice management */}
      <ProgressiveDisclosureSection
        title="Choice Management"
        level="basic"
        description="Drag and drop to reorder weighted story choices"
        defaultExpanded={true}
        priority="critical"
        fieldName="choices"
      >
        <div style={{
          background: styles.background,
          color: styles.text,
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '16px',
          borderRadius: '8px'
        }}>
          {/* Essential Header */}
          <div style={{
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${styles.border}`
          }}>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: styles.text
            }}>
              🎲 Weighted Story Choices
            </h4>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              opacity: 0.7
            }}>
              Drag to reorder by importance, adjust weights for probability control
            </p>
          </div>
        
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '12px',
              padding: '4px 8px',
              background: styles.secondary,
              border: `1px solid ${styles.border}`,
              borderRadius: '6px',
              opacity: 0.8
            }}>
              {options.length} {options.length === 1 ? 'choice' : 'choices'}
            </span>
          
            {!disabled && (
              <button
                onClick={() => setIsAddingChoice(true)}
                style={{
                  background: styles.accent,
                  color: styles.background,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  boxShadow: `0 2px 8px ${styles.accent}40`
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
              ＋ Add Choice
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {showAnalytics && options.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
            padding: '16px',
            background: styles.secondary,
            border: `1px solid ${styles.border}`,
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: styles.accent,
                marginBottom: '4px'
              }}>
                {choiceStats.totalWeight.toFixed(1)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Weight</div>
            </div>
          
            {choiceStats.mostLikely && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 600, 
                  color: styles.success,
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {choiceStats.mostLikely.text}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                Most Likely ({((choiceStats.mostLikely.weight / choiceStats.totalWeight) * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          
            {choiceStats.leastLikely && choiceStats.leastLikely !== choiceStats.mostLikely && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 600, 
                  color: styles.warning,
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {choiceStats.leastLikely.text}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                Least Likely ({((choiceStats.leastLikely.weight / choiceStats.totalWeight) * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Choice Form */}
        {isAddingChoice && (
          <div style={{
            background: styles.secondary,
            border: `1px solid ${styles.border}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                value={newChoiceText}
                onChange={(e) => setNewChoiceText(e.target.value)}
                placeholder="Enter choice text..."
                autoFocus
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${styles.border}`,
                  borderRadius: '6px',
                  background: styles.background,
                  color: styles.text,
                  fontSize: '14px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddChoice();
                  if (e.key === 'Escape') setIsAddingChoice(false);
                }}
              />
              <button
                onClick={handleAddChoice}
                disabled={!newChoiceText.trim()}
                style={{
                  background: styles.success,
                  color: styles.background,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: newChoiceText.trim() ? 'pointer' : 'not-allowed',
                  opacity: newChoiceText.trim() ? 1 : 0.5
                }}
              >
              Add
              </button>
              <button
                onClick={() => {
                  setIsAddingChoice(false);
                  setNewChoiceText('');
                }}
                style={{
                  background: 'transparent',
                  color: styles.text,
                  border: `1px solid ${styles.border}`,
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
              Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Drag-to-Reorder Interface */}
        <DragReorderWeightManager
          options={options}
          onChange={handleOptionsChange}
          disabled={disabled}
          theme={theme}
          showWeights={true}
          showPercentages={true}
          allowWeightEditing={!disabled}
          allowLocking={false}
          enableBulkOperations={!disabled}
          showStatistics={true}
          showVisualWeights={true}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0
          }}
        />

        {/* Empty State */}
        {options.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: styles.secondary,
            border: `2px dashed ${styles.border}`,
            borderRadius: '12px',
            color: styles.text,
            opacity: 0.7
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎲</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
            No Choices Yet
            </h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
            Add some choices to get started with weighted random selection
            </p>
            {!disabled && (
              <button
                onClick={() => setIsAddingChoice(true)}
                style={{
                  background: styles.accent,
                  color: styles.background,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${styles.accent}30`
                }}
              >
              ＋ Add Your First Choice
              </button>
            )}
          </div>
        )}

        {/* Preview Section */}
        {showPreview && options.length > 0 && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: styles.secondary,
            border: `1px solid ${styles.border}`,
            borderRadius: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: styles.accent
              }}>
              🎯 Preview Results
              </h4>
            
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', opacity: 0.7 }}>
                Sample size:
                </label>
                <input
                  type="number"
                  value={previewCount}
                  onChange={(e) => setPreviewCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                  min={1}
                  max={100}
                  style={{
                    width: '60px',
                    padding: '4px 6px',
                    border: `1px solid ${styles.border}`,
                    borderRadius: '4px',
                    background: styles.background,
                    color: styles.text,
                    fontSize: '12px'
                  }}
                />
                <button
                  onClick={generatePreview}
                  style={{
                    background: styles.accent,
                    color: styles.background,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                Generate
                </button>
              </div>
            </div>

            {previewResults.length > 0 && (
              <div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {previewResults.map((result, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 8px',
                        background: styles.accent + '20',
                        border: `1px solid ${styles.accent}40`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: styles.accent,
                        fontWeight: 500
                      }}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              
                {/* Preview Statistics */}
                <div style={{
                  padding: '12px',
                  background: styles.background,
                  border: `1px solid ${styles.border}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  <strong>Distribution:</strong>{' '}
                  {Array.from(new Set(previewResults)).map(unique => {
                    const count = previewResults.filter(r => r === unique).length;
                    const percentage = (count / previewResults.length) * 100;
                    return `${unique} (${count}×, ${percentage.toFixed(1)}%)`;
                  }).join(' • ')}
                </div>
              </div>
            )}
          </div>
        )}
      </ProgressiveDisclosureSection>

      {/* Professional Footer */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: `1px solid ${styles.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        opacity: 0.6
      }}>
        <div>
          Wild Construct • Weighted Choice Editor
        </div>
        <div>
          {theme === 'cinema' && '🎬 Cinema Mode Enabled'}
        </div>
      </div>
    </div>
  );
};

export default DragReorderWeightedChoiceEditor;