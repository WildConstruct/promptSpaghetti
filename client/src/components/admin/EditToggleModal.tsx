// Epic 17.1.3 - Edit Toggle Modal Component

import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, AlertCircle, Info } from 'lucide-react';
import { Badge } from '../common/Badge';
import { ValidationMessage } from '../common/ValidationMessage';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface EditToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  toggleId: string;
  onSave: () => void;
}

interface ToggleData {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: string;
  value: unknown;
  claudeImpact: string;
  enabled: boolean;
  version: number;
}

export const EditToggleModal: React.FC<EditToggleModalProps> = ({
  isOpen,
  onClose,
  toggleId,
  onSave
}) => {
  const [toggle, setToggle] = useState<ToggleData | null>(null);
  const [formData, setFormData] = useState<Partial<ToggleData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen && toggleId) {
      fetchToggle();
    }
  }, [isOpen, toggleId, fetchToggle]);

  const fetchToggle = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/feature-toggles/toggles/${toggleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load toggle');
      }

      const data = await response.json();
      setToggle(data);
      setFormData({
        name: data.name,
        description: data.description,
        value: data.value,
        claudeImpact: data.claudeImpact,
        enabled: data.enabled
      });
    } catch (error) {
      setErrors({ fetch: error instanceof Error ? error.message : 'Failed to load toggle' });
    } finally {
      setLoading(false);
    }
  }, [toggleId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason for change is required';
    }

    // Validate type-specific values
    if (toggle?.type === 'percentage_rollout') {
      if (typeof formData.value?.percentage !== 'number' || 
          formData.value.percentage < 0 || 
          formData.value.percentage > 100) {
        newErrors.value = 'Percentage must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/feature-toggles/toggles/${toggleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          reason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update toggle');
      }

      onSave();
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update toggle' });
    } finally {
      setSaving(false);
    }
  };

  const renderValueEditor = () => {
    if (!toggle) return null;

    switch (toggle.type) {
    case 'boolean':
      return (
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.value?.enabled || false}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                value: { enabled: e.target.checked }
              }))}
            />
              Toggle is enabled by default
          </label>
        </div>
      );

    case 'percentage_rollout':
      return (
        <div className="form-group">
          <label>Rollout Percentage</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.value?.percentage || 0}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              value: { ...prev.value, percentage: parseInt(e.target.value) || 0 }
            }))}
            className={errors.value ? 'error' : ''}
          />
          <div className="form-help">
              Percentage of users who will see this feature (0-100)
          </div>
        </div>
      );

    case 'multivariate':
      return (
        <div className="form-group">
          <label>Variants</label>
          <div className="variants-editor">
            {formData.value?.variants?.map((
              variant: { key?: string; value?: string; percentage?: number }, 
              index: number
            ) => (
              <div key={index} className="variant-row">
                <input
                  type="text"
                  placeholder="Variant key"
                  value={variant.key || ''}
                  onChange={(e) => {
                    const newVariants = [...(formData.value?.variants || [])];
                    newVariants[index] = { ...variant, key: e.target.value };
                    setFormData(prev => ({
                      ...prev,
                      value: { ...prev.value, variants: newVariants }
                    }));
                  }}
                />
                <input
                  type="text"
                  placeholder="Variant value"
                  value={variant.value || ''}
                  onChange={(e) => {
                    const newVariants = [...(formData.value?.variants || [])];
                    newVariants[index] = { ...variant, value: e.target.value };
                    setFormData(prev => ({
                      ...prev,
                      value: { ...prev.value, variants: newVariants }
                    }));
                  }}
                />
                <input
                  type="number"
                  placeholder="% "
                  min="0"
                  max="100"
                  value={variant.percentage || 0}
                  onChange={(e) => {
                    const newVariants = [...(formData.value?.variants || [])];
                    newVariants[index] = { ...variant, percentage: parseInt(e.target.value) || 0 };
                    setFormData(prev => ({
                      ...prev,
                      value: { ...prev.value, variants: newVariants }
                    }));
                  }}
                />
                <button
                  type="button"
                  className="btn-icon btn-danger"
                  onClick={() => {
                    const newVariants = (formData.value?.variants || []).filter((_: unknown, i: number) => i !== index);
                    setFormData(prev => ({
                      ...prev,
                      value: { ...prev.value, variants: newVariants }
                    }));
                  }}
                >
                    ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const newVariants = [...(formData.value?.variants || []), {
                  key: `variant_${String.fromCharCode(65 + (formData.value?.variants?.length || 0))}`,
                  value: '',
                  percentage: 0
                }];
                setFormData(prev => ({
                  ...prev,
                  value: { ...prev.value, variants: newVariants }
                }));
              }}
            >
                Add Variant
            </button>
          </div>
        </div>
      );

    case 'scheduled':
      return (
        <div className="form-group">
          <label>Schedule Configuration</label>
          <div className="schedule-editor">
            <label>
              <input
                type="checkbox"
                checked={formData.value?.enabled || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  value: { ...prev.value, enabled: e.target.checked }
                }))}
              />
                Schedule is active
            </label>
              
            <div className="date-inputs">
              <div>
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.value?.startTime || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    value: { ...prev.value, startTime: e.target.value }
                  }))}
                />
              </div>
                
              <div>
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={formData.value?.endTime || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    value: { ...prev.value, endTime: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="form-group">
          <label>Configuration</label>
          <textarea
            value={JSON.stringify(formData.value, null, 2)}
            onChange={(e) => {
              try {
                const value = JSON.parse(e.target.value);
                setFormData(prev => ({ ...prev, value }));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            rows={6}
            className="json-editor"
          />
          <div className="form-help">
              Edit the raw JSON configuration
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-toggle-modal">
        <div className="modal-header">
          <div className="header-left">
            <h2>Edit Toggle</h2>
            {toggle && (
              <div className="header-meta">
                <code className="toggle-key">{toggle.key}</code>
                <span className="version">v{toggle.version}</span>
                <Badge color={toggle.enabled ? 'green' : 'gray'}>
                  {toggle.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            )}
          </div>
          
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <LoadingSpinner />
              <p>Loading toggle...</p>
            </div>
          ) : toggle ? (
            <>
              {errors.submit && (
                <ValidationMessage type="error" message={errors.submit} />
              )}
              
              {errors.fetch && (
                <ValidationMessage type="error" message={errors.fetch} />
              )}

              {/* Change Reason */}
              <div className="form-group change-reason">
                <label>Reason for Change *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe why you're making this change..."
                  rows={2}
                  className={errors.reason ? 'error' : ''}
                />
                {errors.reason && <ValidationMessage type="error" message={errors.reason} />}
                <div className="form-help">
                  <Info size={14} />
                  This will be recorded in the audit log
                </div>
              </div>

              {/* Basic Fields */}
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <ValidationMessage type="error" message={errors.name} />}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Toggle Status */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.enabled || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  Toggle is enabled
                </label>
                <div className="form-help">
                  <AlertCircle size={14} />
                  Changing this will immediately affect users
                </div>
              </div>

              {/* Claude Impact */}
              <div className="form-group">
                <label>Claude Impact Level</label>
                <select
                  value={formData.claudeImpact || 'NONE'}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    claudeImpact: e.target.value 
                  }))}
                >
                  <option value="NONE">None - No Claude impact</option>
                  <option value="PROMPT_COST">Prompt Cost - Affects token usage</option>
                  <option value="MODEL_VERSION">Model Version - Changes Claude model</option>
                  <option value="OUTPUT_QUALITY">Output Quality - Affects response quality</option>
                  <option value="HALLUCINATION_RISK">Hallucination Risk - May increase hallucinations</option>
                </select>
              </div>

              {/* Type-specific Value Editor */}
              <div className="value-editor-section">
                <h3>Configuration</h3>
                <div className="type-indicator">
                  <Badge color="blue">{toggle.type.replace('_', ' ')}</Badge>
                </div>
                {renderValueEditor()}
                {errors.value && <ValidationMessage type="error" message={errors.value} />}
              </div>
            </>
          ) : null}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};