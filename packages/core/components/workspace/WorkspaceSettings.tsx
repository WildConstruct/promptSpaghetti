/**
 * Epic 9.2.1 - Workspace Settings Component
 * Settings modal for workspace configuration
 */

import React, { useState } from 'react';
import { WorkspaceWithMembership } from '../../types/workspace';

interface WorkspaceSettingsProps {
  workspace: WorkspaceWithMembership;
  onUpdate: (updates: { name?: string; description?: string }) => void;
  onArchive: () => void;
  onCancel: () => void;
  canArchive: boolean;
}

export const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({
  workspace,
  onUpdate,
  onArchive,
  onCancel,
  canArchive,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'danger'>('general');
  const [formData, setFormData] = useState({
    name: workspace.name,
    description: workspace.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

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

    // Check if there are any changes
    const hasChanges = 
      formData.name !== workspace.name ||
      formData.description !== (workspace.description || '');

    if (!hasChanges) {
      onCancel();
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
    } catch (error) {
      console.error('Failed to update workspace:', error);
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

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      await onArchive();
    } catch (error) {
      console.error('Failed to archive workspace:', error);
    } finally {
      setIsSubmitting(false);
      setShowArchiveConfirm(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal--large">
        <div className="modal__header">
          <h2>Workspace Settings</h2>
          <button
            className="modal__close"
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal__content">
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'general' ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`settings-tab ${activeTab === 'members' ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Members
            </button>
            {canArchive && (
              <button
                className={`settings-tab ${activeTab === 'danger' ? 'settings-tab--active' : ''}`}
                onClick={() => setActiveTab('danger')}
              >
                Danger Zone
              </button>
            )}
          </div>

          <div className="settings-content">
            {activeTab === 'general' && (
              <form onSubmit={handleSubmit} className="settings-form">
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

                <div className="workspace-info">
                  <h3>Workspace Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Created</label>
                      <span>{new Date(workspace.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Updated</label>
                      <span>{new Date(workspace.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Owner</label>
                      <span>{workspace.owner_id}</span>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'members' && (
              <div className="members-tab">
                <div className="members-header">
                  <h3>Workspace Members</h3>
                  <p>Manage who has access to this workspace and their permissions.</p>
                </div>

                <div className="members-list">
                  <div className="member-item">
                    <div className="member-avatar">
                      {workspace.owner_id.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{workspace.owner_id}</div>
                      <div className="member-role">Owner</div>
                    </div>
                    <div className="member-actions">
                      <span className="badge badge--owner">Owner</span>
                    </div>
                  </div>
                  
                  {/* TODO: Add actual member list from API */}
                  <div className="members-empty">
                    <p>No other members yet. Use the "Invite Users" button to add collaborators.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && canArchive && (
              <div className="danger-tab">
                <div className="danger-section">
                  <h3>Archive Workspace</h3>
                  <p>
                    Archiving this workspace will make it read-only and hide it from the main workspace list.
                    All projects and data will be preserved but no new content can be created.
                  </p>
                  
                  {!showArchiveConfirm ? (
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() => setShowArchiveConfirm(true)}
                      disabled={isSubmitting}
                    >
                      Archive Workspace
                    </button>
                  ) : (
                    <div className="confirm-action">
                      <p><strong>Are you sure you want to archive "{workspace.name}"?</strong></p>
                      <p>This action cannot be easily undone.</p>
                      <div className="confirm-actions">
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={() => setShowArchiveConfirm(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger"
                          onClick={handleArchive}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Archiving...' : 'Yes, Archive Workspace'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          {activeTab === 'general' && (
            <button
              type="submit"
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;