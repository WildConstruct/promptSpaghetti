// packages/core/components/Annotations/ConnectionAnnotationPanel.tsx
// Epic 8.7 Task 4: Connection Label Editing Interface
import React, { useState, useCallback } from 'react';
// import { Edge } from 'reactflow';
import { AnnotatedEdge, ConnectionLabelEditor } from './ConnectionAnnotations';
import { connectionAnnotationPresets, labelTemplates } from '../../hooks/useConnectionAnnotations';
interface ConnectionAnnotationPanelProps {
  edges: AnnotatedEdge[];
  selectedEdgeId: string | null;
  labelEditMode: boolean;
  smartPositioning: boolean;
  showAllLabels: boolean;
  onAddLabel: (edgeId: string, label: string, options?: Partial<AnnotatedEdge>) => void;
  onUpdateLabel: (edgeId: string, updates: Partial<AnnotatedEdge>) => void;
  onRemoveLabel: (edgeId: string) => void;
  onToggleLabel: (edgeId: string) => void;
  onSelectEdge: (edgeId: string | null) => void;
  onShowAllLabelsToggle: () => void;
  onHideAllLabels: () => void;
  onClearAllLabels: () => void;
  onOptimizePositions: () => void;
  onSetLabelEditMode: (enabled: boolean) => void;
  onSetSmartPositioning: (enabled: boolean) => void;
  getVisibleLabelsCount: () => number;
}

export const ConnectionAnnotationPanel: React.FC<ConnectionAnnotationPanelProps> = ({)
  edges,
  selectedEdgeId,
  labelEditMode,
  smartPositioning,
  showAllLabels,
  onAddLabel,
  onUpdateLabel,
  onRemoveLabel,
  onToggleLabel,
  onSelectEdge,
  onShowAllLabelsToggle,
  onHideAllLabels,
  onClearAllLabels,
  onOptimizePositions,
  onSetLabelEditMode,
  onSetSmartPositioning,
  getVisibleLabelsCount
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [quickLabelInput, setQuickLabelInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof connectionAnnotationPresets>('dataFlow');
  const selectedEdge = edges.find(edge => edge.id === selectedEdgeId);
  const edgesWithLabels = edges.filter(edge => edge.label && edge.label.trim().length > 0);
  const visibleLabelsCount = getVisibleLabelsCount();
  const handleQuickAddLabel = useCallback(() => {
    if (!selectedEdgeId || !quickLabelInput.trim()) return;
    onAddLabel()
      selectedEdgeId, 
      quickLabelInput.trim(),
      connectionAnnotationPresets[selectedPreset]
    );
    setQuickLabelInput('');
  }, [selectedEdgeId, quickLabelInput, selectedPreset, onAddLabel]);
  const handleOpenEditor = useCallback(() => {
    setShowEditor(true);
  }, []);
  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
  }, []);
  const handleTemplateSelect = useCallback((template: string) => {
    setQuickLabelInput(template);
  }, []);
  return ()
    <div style={{
      position: 'fixed',
      top: 80,
      right: 20,
      width: 320,
      background: '#2d3748',
      border: '1px solid #4a5568',
      borderRadius: 8,
      padding: 16,
      zIndex: 1000,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottom: '1px solid #4a5568',
        paddingBottom: 8,
      }}>
        <h3 style={{ 
          color: '#e2e8f0', 
          fontSize: 14, 
          margin: 0,
          fontWeight: 600,
        }}>
          Connection Labels
        </h3>
        <div style={{ 
          color: '#a0aec0', 
          fontSize: 11 ,
        }}>
          {visibleLabelsCount} visible
        </div>
      </div>
      {/* Quick Actions */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 8, 
          marginBottom: 8 ,
        }}>
          <button
            onClick={onShowAllLabelsToggle}
            style={{
              padding: '6px 8px',
              background: showAllLabels ? '#4299e1' : '#4a5568',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {showAllLabels ? 'Hide All' : 'Show All'}
          </button>
          <button
            onClick={() => onSetLabelEditMode(!labelEditMode)}
            style={{
              padding: '6px 8px',
              background: labelEditMode ? '#48bb78' : '#4a5568',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {labelEditMode ? 'Edit On' : 'Edit Off'}
          </button>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 8 ,
        }}>
          <button
            onClick={onOptimizePositions}
            disabled={!smartPositioning}
            style={{
              padding: '6px 8px',
              background: '#9f7aea',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              fontSize: 11,
              cursor: smartPositioning ? 'pointer' : 'not-allowed',
              opacity: smartPositioning ? 1 : 0.5
            }}
          >
            Optimize
          </button>
          <button
            onClick={onClearAllLabels}
            style={{
              padding: '6px 8px',
              background: '#f56565',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        </div>
      </div>
      {/* Settings */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 8 ,
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#e2e8f0', 
            fontSize: 11, 
            gap: 4 ,
          }}>
            <input
              type="checkbox"
              checked={smartPositioning}
              onChange={(e) => onSetSmartPositioning(e.target.checked)}
            />
            Smart Positioning
          </label>
        </div>
      </div>
      {/* Quick Add Interface */}
      {selectedEdgeId && ()
        <div style={{ 
          background: '#1a202c', 
          padding: 12, 
          borderRadius: 6, 
          marginBottom: 16 ,
        }}>
          <h4 style={{ 
            color: '#e2e8f0', 
            fontSize: 12, 
            margin: '0 0 8px 0' 
          }}>
            Add Label to Selected Connection
          </h4>
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={quickLabelInput}
              onChange={(e) => setQuickLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAddLabel()}
              placeholder="Enter connection label..."
              style={{
                width: '100%',
                padding: 6,
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: 4,
                color: '#e2e8f0',
                fontSize: 11,
              }}
            />
          </div>
          {/* Preset Style Selection */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ 
              display: 'block', 
              color: '#a0aec0', 
              fontSize: 10, 
              marginBottom: 4 ,
            }}>
              Style Preset
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as keyof typeof connectionAnnotationPresets)}
              style={{
                width: '100%',
                padding: 4,
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: 4,
                color: '#e2e8f0',
                fontSize: 11,
              }}
            >
              <option value="dataFlow">Data Flow</option>
              <option value="control">Control</option>
              <option value="dependency">Dependency</option>
              <option value="error">Error</option>
            </select>
          </div>
          {/* Quick Templates */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ 
              display: 'block', 
              color: '#a0aec0', 
              fontSize: 10, 
              marginBottom: 4 ,
            }}>
              Quick Templates
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: 4 ,
            }}>
              {Object.values(labelTemplates).slice(0, 6).map(template => ()
                <button
                  key={template}
                  onClick={() => handleTemplateSelect(template)}
                  style={{
                    padding: '2px 4px',
                    background: '#4a5568',
                    border: 'none',
                    borderRadius: 2,
                    color: '#e2e8f0',
                    fontSize: 9,
                    cursor: 'pointer',
                  }}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleQuickAddLabel}
              disabled={!quickLabelInput.trim()}
              style={{
                flex: 1,
                padding: '6px 8px',
                background: quickLabelInput.trim() ? '#4299e1' : '#4a5568',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                fontSize: 11,
                cursor: quickLabelInput.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Add Label
            </button>
            {selectedEdge && ()
              <button
                onClick={handleOpenEditor}
                style={{
                  padding: '6px 8px',
                  background: '#9f7aea',
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Advanced
              </button>
            )}
          </div>
        </div>
      )}
      {/* Existing Labels List */}
      <div>
        <h4 style={{ 
          color: '#e2e8f0', 
          fontSize: 12, 
          margin: '0 0 8px 0',
          borderBottom: '1px solid #4a5568',
          paddingBottom: 4,
        }}>
          Labeled Connections ({edgesWithLabels.length})
        </h4>
        {edgesWithLabels.length === 0 ? ()
          <div style={{ 
            color: '#a0aec0', 
            fontSize: 11, 
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '16px 8px'
          }}>
            No labeled connections.{' '}
            {edges.length > 0 ? 'Select a connection to add labels.' : 'Create connections first.'}
          </div>
        ) : ()
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {edgesWithLabels.map(edge => ()
              <div
                key={edge.id}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  background: selectedEdgeId === edge.id ? '#1a202c' : 'transparent',
                  border: `1px solid ${selectedEdgeId === edge.id ? '#4299e1' : '#4a5568'}`,}
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={() => onSelectEdge(edge.id)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <div style={{ 
                    color: '#e2e8f0', 
                    fontSize: 11,
                    fontWeight: 500,
                    maxWidth: 150,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    "{edge.label}"
                  </div>
                  <div style={{ 
                    fontSize: 9, 
                    color: edge.showLabel ? '#48bb78' : '#a0aec0'
                  }}>
                    {edge.showLabel ? 'Visible' : 'Hidden'}
                  </div>
                </div>
                <div style={{ 
                  fontSize: 9, 
                  color: '#a0aec0',
                  marginBottom: 4,
                }}>
                  {edge.source} → {edge.target}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLabel(edge.id);
                    }}
                    style={{
                      padding: '2px 6px',
                      background: 'none',
                      border: '1px solid #4a5568',
                      borderRadius: 2,
                      color: '#a0aec0',
                      fontSize: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {edge.showLabel ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveLabel(edge.id);
                    }}
                    style={{
                      padding: '2px 6px',
                      background: 'none',
                      border: '1px solid #f56565',
                      borderRadius: 2,
                      color: '#f56565',
                      fontSize: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Advanced Label Editor Modal */}
      {showEditor && selectedEdge && ()
        <ConnectionLabelEditor
          edge={selectedEdge}
          onUpdateEdge={onUpdateLabel}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
};

// Compact connection annotation toolbar for the main UI
export const ConnectionAnnotationToolbar: React.FC<{
  visible: boolean;
  onToggle: () => void;
  labelEditMode: boolean;
  onSetLabelEditMode: (enabled: boolean) => void;
  visibleLabelsCount: number;
  totalLabelsCount: number;
}> = ({)
  visible,
  onToggle,
  labelEditMode,
  onSetLabelEditMode,
  visibleLabelsCount,
  totalLabelsCount
}) => {
  return ()
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#2d3748',
      padding: '8px 12px',
      borderRadius: 6,
      border: '1px solid #4a5568',
      zIndex: 999,
    }}>
      <div style={{ 
        color: '#a0aec0', 
        fontSize: 11 ,
      }}>
        Labels: {visibleLabelsCount}/{totalLabelsCount}
      </div>
      <button
        onClick={() => onSetLabelEditMode(!labelEditMode)}
        style={{
          padding: '4px 8px',
          background: labelEditMode ? '#48bb78' : '#4a5568',
          border: 'none',
          borderRadius: 3,
          color: 'white',
          fontSize: 10,
          cursor: 'pointer',
        }}
      >
        Edit Mode
      </button>
      <button
        onClick={onToggle}
        style={{
          padding: '4px 8px',
          background: visible ? '#4299e1' : '#4a5568',
          border: 'none',
          borderRadius: 3,
          color: 'white',
          fontSize: 10,
          cursor: 'pointer',
        }}
      >
        Panel
      </button>
    </div>
  );
};