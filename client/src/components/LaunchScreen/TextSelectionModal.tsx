import React, { useState } from 'react';
import './TextSelectionModal.css';

export interface TextSelection {
  text: string;
  start: number;
  end: number;
}

interface TextSelectionModalProps {
  isOpen: boolean;
  selection: TextSelection | null;
  onConfirm: (nodeType: string, color: string) => void;
  onCancel: () => void;
  showWarning?: boolean;
}

const NODE_TYPES = [
  { value: 'text', label: 'Text Block' },
  { value: 'choice', label: 'Weighted Choice' }
  // { value: 'variable', label: 'Variable' }, // hidden for initial release
];

const SWATCH_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FFB347', // Orange
  '#B19CD9' // Purple
];

export const TextSelectionModal: React.FC<TextSelectionModalProps> = ({
  isOpen,
  selection,
  onConfirm,
  onCancel,
  showWarning = false
}) => {
  const [nodeType, setNodeType] = useState('text');
  const [selectedColor, setSelectedColor] = useState(SWATCH_COLORS[0]);
  const [isAdvanced, setIsAdvanced] = useState(false);

  if (!isOpen || !selection) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(nodeType, selectedColor);
  };

  return (
    <div className="selection-modal-overlay" onClick={onCancel}>
      <div className="selection-modal" onClick={e => e.stopPropagation()}>
        <div className="selection-modal-header">
          <h3>Create Node from Selection</h3>
          {!isAdvanced && (
            <button
              className="mode-toggle"
              onClick={() => setIsAdvanced(true)}
              title="Advanced options"
            >
              ⚙️
            </button>
          )}
        </div>

        <div className="selection-modal-content">
          {/* Show selected text preview */}
          <div className="selection-preview">
            <label>Selected Text:</label>
            <div className="selected-text">&quot;{selection.text}&quot;</div>
          </div>

          {/* Node type selector */}
          <div className="node-type-selector">
            <label>Node Type:</label>
            <select
              value={nodeType}
              onChange={e => setNodeType(e.target.value)}
            >
              {NODE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color swatches */}
          <div className="color-selector">
            <label>Highlight Color:</label>
            <div className="color-swatches">
              {SWATCH_COLORS.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Warning message */}
          {showWarning && (
            <div className="selection-warning">
              ⚠️ This will replace and split any overlapping nodes
            </div>
          )}

          {/* Advanced options */}
          {isAdvanced && (
            <div className="advanced-options">
              <h4>Advanced Options</h4>
              <div className="option-group">
                <label>
                  <input type="checkbox" defaultChecked />
                  Auto-connect to adjacent nodes
                </label>
              </div>
              <div className="option-group">
                <label>
                  <input type="checkbox" />
                  Preserve existing connections
                </label>
              </div>
              <div className="option-group">
                <label>
                  Position:
                  <select defaultValue="inline">
                    <option value="inline">Inline (replace text)</option>
                    <option value="append">Append to graph</option>
                    <option value="branch">Create branch</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="selection-modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Create Node
          </button>
        </div>
      </div>
    </div>
  );
};
