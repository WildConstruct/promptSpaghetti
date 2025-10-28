import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import './SupabaseDialogs.css';

interface SupabaseSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    description: string,
    isPublic: boolean,
    tags: string[]
  ) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentNodes: Node[];
  currentEdges: Edge[];
}

export const SupabaseSaveDialog: React.FC<SupabaseSaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
  isAuthenticated,
  currentNodes,
  currentEdges
}) => {
  const [name, setName] = useState(`Graph ${new Date().toLocaleDateString()}`);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim(), isPublic, tags);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.currentTarget.name === 'tag') {
        handleAddTag();
      } else {
        handleSave();
      }
    }
  };

  if (!isOpen) {return null;}

  return (
    <div className="supabase-dialog-overlay" onClick={onClose}>
      <div
        className="supabase-dialog save-dialog"
        onClick={e => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2>Save Graph to Cloud</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dialog-content">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter graph name..."
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your graph (optional)..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tag-input-container">
              <input
                id="tags"
                name="tag"
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags..."
                className="form-input tag-input"
              />
              <button
                className="button secondary small"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag removable">
                    {tag}
                    <button
                      className="remove-tag"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                />
                <span>Make this graph public (share with community)</span>
              </label>
            </div>
          )}

          <div className="graph-info">
            <p className="info-text">
              This graph contains {currentNodes.length} nodes and{' '}
              {currentEdges.length} edges.
            </p>
            {!isAuthenticated && (
              <p className="warning-text">
                ⚠️ You&apos;re not signed in. This graph will be saved locally
                only.
              </p>
            )}
          </div>
        </div>

        <div className="dialog-footer">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button primary"
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
