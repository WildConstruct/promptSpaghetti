/**
 * Save As Preset Dialog Component
 * Allows users to save current node configuration as a reusable preset
 */

import React, { useState, useCallback } from 'react';
import { EditableNodeData } from '../nodes';
import { Preset } from './types';
import { createPresetFromNode } from './presetUtils';
import './SaveAsPresetDialog.css';

interface SaveAsPresetDialogProps {
  isOpen: boolean;
  nodeData: EditableNodeData | null;
  nodeType: string;
  onClose: () => void;
  onSave: (preset: Preset) => void;
}

export const SaveAsPresetDialog: React.FC<SaveAsPresetDialogProps> = ({
  isOpen,
  nodeData,
  nodeType,
  onClose,
  onSave
}) => {
  const [presetName, setPresetName] = useState('');
  const [category, setCategory] = useState('custom');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = useCallback(() => {
    if (!nodeData || !presetName.trim()) return;

    // Parse tags from comma-separated string
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Create preset
    const preset = createPresetFromNode(
      nodeData,
      nodeType,
      presetName.trim(),
      category,
      tagArray
    );

    // Add description to metadata
    if (description.trim()) {
      preset.metadata.description = description.trim();
    }

    onSave(preset);
    
    // Reset form
    setPresetName('');
    setCategory('custom');
    setTags('');
    setDescription('');
    
    onClose();
  }, [nodeData, nodeType, presetName, category, tags, description, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setPresetName('');
    setCategory('custom');
    setTags('');
    setDescription('');
    onClose();
  }, [onClose]);

  if (!isOpen || !nodeData) return null;

  return (
    <div className="save-preset-overlay">
      <div className="save-preset-dialog">
        <h2>Save as Preset</h2>
        
        <div className="save-preset-form">
          <div className="form-group">
            <label htmlFor="preset-name">Preset Name *</label>
            <input
              id="preset-name"
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="preset-category">Category</label>
            <select
              id="preset-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="custom">Custom</option>
              <option value="character-occupations">Character Occupations</option>
              <option value="character-states">Character States</option>
              <option value="clothing-appearance">Clothing & Appearance</option>
              <option value="items-props">Items & Props</option>
              <option value="settings-locations">Settings & Locations</option>
              <option value="utility">Utility</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="preset-tags">Tags (comma-separated)</label>
            <input
              id="preset-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., character, medieval, fantasy"
            />
          </div>

          <div className="form-group">
            <label htmlFor="preset-description">Description</label>
            <textarea
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this preset does..."
              rows={3}
            />
          </div>

          <div className="preview-section">
            <h3>Preview</h3>
            <div className="preview-content">
              <div className="preview-type">{nodeType}</div>
              <pre>{JSON.stringify(nodeData, null, 2)}</pre>
            </div>
          </div>
        </div>

        <div className="dialog-buttons">
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!presetName.trim()}
          >
            Save Preset
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};