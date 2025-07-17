/**
 * Epic 9.2.1 - Create Workspace Modal Component
 * Modal for creating new workspaces
 */

import React, { useState } from 'react';

interface CreateWorkspaceModalProps {
  onSubmit: (data: { name: string; description?: string }) => void;
  onCancel: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Workspace name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Workspace name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
    } catch (error) {
      // Handle error (could set form-level error state)
      console.error('Failed to create workspace:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal--medium">
        <div className="modal__header">
          <h2>Create New Workspace</h2>
          <button
            className="modal__close"
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal__content">
          <div className="form-group">
            <label htmlFor="workspace-name" className="form-label">
              Workspace Name *
            </label>
            <input
              id="workspace-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              placeholder="Enter workspace name"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.name && (
              <div className="form-error">{errors.name}</div>
            )}
            <div className="form-hint">
              Choose a descriptive name for your workspace
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="workspace-description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="workspace-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`form-textarea ${errors.description ? 'form-textarea--error' : ''}`}
              placeholder="Describe what this workspace is for..."
              rows={3}
              maxLength={200}
              disabled={isSubmitting}
            />
            {errors.description && (
              <div className="form-error">{errors.description}</div>
            )}
            <div className="form-hint">
              {formData.description.length}/200 characters
            </div>
          </div>

          <div className="workspace-preview">
            <h3>Preview</h3>
            <div className="workspace-item workspace-item--preview">
              <div className="workspace-item__avatar">
                {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="workspace-item__content">
                <h4 className="workspace-item__name">
                  {formData.name || 'Workspace Name'}
                </h4>
                {formData.description && (
                  <p className="workspace-item__description">
                    {formData.description}
                  </p>
                )}
                <div className="workspace-item__meta">
                  <span className="badge badge--owner">Owner</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;