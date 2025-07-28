import React, { useState, useCallback, useMemo } from 'react';
import { Node } from 'reactflow';
import { NodeData } from '../../types/NodeTypes';
interface BatchNodeEditorProps {
  selectedNodes: Node<NodeData>[];
  isActive: boolean;
  onUpdate: (updates: Record<string, Partial<NodeData>>) => void;
  onClose: () => void;
  position: { x: number; y: number };
  theme?: 'light' | 'dark' | 'cinema';
}

export const BatchNodeEditor: React.FC<BatchNodeEditorProps> = ({)
  selectedNodes,
  isActive,
  onUpdate,
  onClose,
  position,
  theme = 'cinema'
}) => {
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState(false);
  // Analyze selected nodes to find common properties
  const nodeAnalysis = useMemo(() => {
    if (selectedNodes.length === 0) return { commonTypes: [], commonFields: [], conflicts: {} };
    const nodeTypes = Array.from(new Set(selectedNodes.map(n => n.type || 'default')));
    const allFields = new Set<string>();
    const fieldValues: Record<string, Set<any>> = {};
    const conflicts: Record<string, boolean> = {};
    // Collect all fields and their values
    selectedNodes.forEach(node => {)
      Object.keys(node.data).forEach(field => {)
        allFields.add(field);
        if (!fieldValues[field]) fieldValues[field] = new Set();
        fieldValues[field].add(node.data[field]);
      });
    });
    // Identify conflicts (fields with different values)
    Object.keys(fieldValues).forEach(field => {)
      conflicts[field] = fieldValues[field].size > 1;
    });
    const commonFields = Array.from(allFields);
    return {
      commonTypes: nodeTypes,
      commonFields,
      conflicts,
      fieldValues,
      totalNodes: selectedNodes.length,
    };
  }, [selectedNodes]);
  const handleFieldSelection = useCallback((field: string, selected: boolean) => {
    const newSelectedFields = new Set(selectedFields);
    if (selected) {
      newSelectedFields.add(field);
    } else {
      newSelectedFields.delete(field);
      const newUpdates = { ...updates };
      delete newUpdates[field];
      setUpdates(newUpdates);
    }
    setSelectedFields(newSelectedFields);
  }, [selectedFields, updates]);
  const handleFieldUpdate = useCallback((field: string, value: any) => {
    setUpdates(prev => ({ ...prev, [field]: value }));
  }, []);
  const handleApplyChanges = useCallback(() => {
    const nodeUpdates: Record<string, Partial<NodeData>> = {};
    selectedNodes.forEach(node => {)
      const nodeUpdate: Partial<NodeData> = {};
      selectedFields.forEach(field => {)
        if (field in updates) {
          nodeUpdate[field] = updates[field];
        }
      });
      if (Object.keys(nodeUpdate).length > 0) {
        nodeUpdates[node.id] = nodeUpdate;
      }
    });
    onUpdate(nodeUpdates);
    onClose();
  }, [selectedNodes, selectedFields, updates, onUpdate, onClose]);
  const getThemeColors = () => {
    switch (theme) {
      case 'cinema':
        return {
          background: '#2d3748',
          border: '#4a5568',
          text: '#e2e8f0',
          accent: '#4299e1',
          success: '#38a169',
          warning: '#f6ad55',
          danger: '#e53e3e',
        };
      case 'dark':
        return {
          background: '#1a202c',
          border: '#2d3748',
          text: '#f7fafc',
          accent: '#38a169',
          success: '#48bb78',
          warning: '#ed8936',
          danger: '#f56565',
        };
      case 'light':
      default:
        return {
          background: '#ffffff',
          border: '#e2e8f0',
          text: '#2d3748',
          accent: '#3182ce',
          success: '#38a169',
          warning: '#d69e2e',
          danger: '#e53e3e',
        };
    }
  };
  const colors = getThemeColors();
  if (!isActive || selectedNodes.length === 0) return null;
  return ();
    <div
      className="batch-node-editor"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 480,
        maxHeight: 600,
        background: colors.background,
        border: `2px solid ${colors.accent}`,}
        borderRadius: 8,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        zIndex: 1000,
        color: colors.text,
        fontSize: 14,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottom: `1px solid ${colors.border}`}
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            Batch Edit Nodes
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, opacity: 0.7 }}>
            {nodeAnalysis.totalNodes} nodes selected • {nodeAnalysis.commonTypes.join(', ')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{
              padding: '6px 12px',
              background: previewMode ? colors.accent : colors.border,
              color: previewMode ? 'white' : colors.text,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              fontSize: 18,
              padding: 0,
              width: 24,
              height: 24,
            }}
          >
            ×
          </button>
        </div>
      </div>
      {/* Content */}
      <div style={{ maxHeight: 400, overflowY: 'auto', padding: 16 }}>
        {previewMode ? ()
          <BatchPreview
            selectedNodes={selectedNodes}
            updates={updates}
            selectedFields={selectedFields}
            colors={colors}
          />
        ) : ()
          <BatchEditForm
            nodeAnalysis={nodeAnalysis}
            selectedFields={selectedFields}
            updates={updates}
            onFieldSelection={handleFieldSelection}
            onFieldUpdate={handleFieldUpdate}
            colors={colors}
          />
        )}
      </div>
      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTop: `1px solid ${colors.border}`}
      }}>
        <div style={{ fontSize: 12, color: colors.text, opacity: 0.7 }}>
          {selectedFields.size} field{selectedFields.size === 1 ? '' : 's'} selected for update
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: colors.border,
              color: colors.text,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApplyChanges}
            disabled={selectedFields.size === 0}
            style={{
              padding: '8px 16px',
              background: selectedFields.size > 0 ? colors.success : colors.border,
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: selectedFields.size > 0 ? 'pointer' : 'not-allowed',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Apply to {nodeAnalysis.totalNodes} Node{nodeAnalysis.totalNodes === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Batch Edit Form Component
interface BatchEditFormProps {
  nodeAnalysis: any;
  selectedFields: Set<string>;
  updates: Record<string, any>;
  onFieldSelection: (field: string, selected: boolean) => void;
  onFieldUpdate: (field: string, value: any) => void;
  colors: any;
}
const BatchEditForm: React.FC<BatchEditFormProps> = ({)
  nodeAnalysis,
  selectedFields,
  updates,
  onFieldSelection,
  onFieldUpdate,
  colors
}) => {
  return ();
    <div>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>
          Select fields to update:
        </h4>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
          Fields with conflicts will overwrite existing values
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {nodeAnalysis.commonFields.map((field: string) => ()
          <div key={field} style={{
            padding: 12,
            border: `1px solid ${colors.border}`,}
            borderRadius: 6,
            background: selectedFields.has(field) ? `${colors.accent}10` : 'transparent'}
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}>
                <input
                  type="checkbox"
                  checked={selectedFields.has(field)}
                  onChange={(e) => onFieldSelection(field, e.target.checked)}
                  style={{ accentColor: colors.accent }}
                />
                {field}
              </label>
              {nodeAnalysis.conflicts[field] && ()
                <span style={{
                  fontSize: 11,
                  color: colors.warning,
                  background: `${colors.warning}20`,}
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}>
                  CONFLICT
                </span>
              )}
            </div>
            {selectedFields.has(field) && ()
              <div style={{ marginTop: 8 }}>
                <FieldEditor
                  field={field}
                  value={updates[field] || ''}
                  onChange={(value) => onFieldUpdate(field, value)}
                  nodeAnalysis={nodeAnalysis}
                  colors={colors}
                />
              </div>
            )}
            {nodeAnalysis.conflicts[field] && ()
              <div style={{
                marginTop: 8,
                fontSize: 11,
                opacity: 0.7,
              }}>
                Current values: {Array.from(nodeAnalysis.fieldValues[field]).map(v => )
                  typeof v === 'string' ? `"${v}"` : String(v)}
                ).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Field Editor Component
interface FieldEditorProps {
  field: string;
  value: any;
  onChange: (value: any) => void;
  nodeAnalysis: any;
  colors: any;
}
const FieldEditor: React.FC<FieldEditorProps> = ({)
  field,
  value,
  onChange,
  nodeAnalysis,
  colors
}) => {
  // Determine field type based on existing values
  const fieldType = useMemo(() => {
    const existingValues = Array.from(nodeAnalysis.fieldValues[field] || []);
    if (existingValues.every(v => typeof v === 'boolean')) return 'boolean';
    if (existingValues.every(v => typeof v === 'number')) return 'number';
    if (existingValues.some(v => typeof v === 'string' && v.length > 50)) return 'textarea';
    return 'text';
  }, [field, nodeAnalysis.fieldValues]);
  const inputStyle = {
    width: '100%',
    padding: 8,
    background: colors.background,
    border: `1px solid ${colors.border}`,}
    borderRadius: 4,
    color: colors.text,
    fontSize: 13,
  };
  switch (fieldType) {
    case 'boolean':
      return ();
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: colors.accent }}
          />
          <span style={{ fontSize: 12 }}>Enable/Disable</span>
        </label>
      );
    case 'number':
      return ();
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          style={inputStyle}
          placeholder="Enter number value"
        />
      );
    case 'textarea':
      return ();
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          placeholder={`Enter new ${field} value`}
        />
      );
    default:
      return ();
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
          placeholder={`Enter new ${field} value`}
        />
      );
  }
};

// Batch Preview Component
interface BatchPreviewProps {
  selectedNodes: Node<NodeData>[];
  updates: Record<string, any>;
  selectedFields: Set<string>;
  colors: any;
}
const BatchPreview: React.FC<BatchPreviewProps> = ({)
  selectedNodes,
  updates,
  selectedFields,
  colors
}) => {
  return ();
    <div>
      <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600 }}>
        Preview Changes
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {selectedNodes.map(node => ()
          <div key={node.id} style={{
            padding: 12,
            border: `1px solid ${colors.border}`,}
            borderRadius: 6,
            background: `${colors.background}50`}
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <strong style={{ fontSize: 13 }}>
                {node.data.label || node.id}
              </strong>
              <span style={{
                fontSize: 11,
                color: colors.accent,
                background: `${colors.accent}20`,}
                padding: '2px 6px',
                borderRadius: 10,
              }}>
                {node.type || 'default'}
              </span>
            </div>
            {Array.from(selectedFields).map(field => ()
              <div key={field} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 4,
              }}>
                <span style={{ opacity: 0.7 }}>{field}:</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    textDecoration: 'line-through',
                    opacity: 0.5,
                  }}>
                    {String(node.data[field] || 'undefined')}
                  </span>
                  <span>→</span>
                  <span style={{ color: colors.success, fontWeight: 600 }}>
                    {String(updates[field] || 'undefined')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchNodeEditor;