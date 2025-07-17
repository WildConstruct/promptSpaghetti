// Epic 17.1.2 - Create Toggle Modal Component

import React, { useState } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { Badge } from '../common/Badge';
import { ValidationMessage } from '../common/ValidationMessage';
import { TargetingRuleBuilder } from './targeting/TargetingRuleBuilder';
import './targeting/TargetingRuleBuilder.css';

interface CreateToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (toggleData: CreateToggleData) => Promise<void>;
}

interface CreateToggleData {
  key: string;
  name: string;
  description?: string;
  type: 'boolean' | 'percentage_rollout' | 'multivariate' | 'scheduled' | 'segmentation';
  value: any;
  claudeImpact: 'NONE' | 'PROMPT_COST' | 'MODEL_VERSION' | 'OUTPUT_QUALITY' | 'HALLUCINATION_RISK';
  enabled: boolean;
}

export const CreateToggleModal: React.FC<CreateToggleModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateToggleData>({
    key: '',
    name: '',
    description: '',
    type: 'boolean',
    value: { enabled: false },
    claudeImpact: 'NONE',
    enabled: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate key
    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9_.-]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only lowercase letters, numbers, underscores, dots, and hyphens';
    }

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate type-specific values
    switch (formData.type) {
      case 'percentage_rollout':
        if (typeof formData.value.percentage !== 'number' || 
            formData.value.percentage < 0 || 
            formData.value.percentage > 100) {
          newErrors.value = 'Percentage must be between 0 and 100';
        }
        break;
      case 'multivariate':
        if (!Array.isArray(formData.value.variants) || formData.value.variants.length === 0) {
          newErrors.value = 'At least one variant is required';
        } else {
          const totalPercentage = formData.value.variants.reduce((sum: number, v: any) => sum + (v.percentage || 0), 0);
          if (totalPercentage > 100) {
            newErrors.value = 'Total variant percentages cannot exceed 100%';
          }
        }
        break;
      case 'segmentation':
        if (!Array.isArray(formData.value.rules) || formData.value.rules.length === 0) {
          newErrors.value = 'At least one segmentation rule is required';
        }
        break;
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
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        key: '',
        name: '',
        description: '',
        type: 'boolean',
        value: { enabled: false },
        claudeImpact: 'NONE',
        enabled: false
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create toggle' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: CreateToggleData['type']) => {
    let defaultValue: any;
    
    switch (type) {
      case 'boolean':
        defaultValue = { enabled: false };
        break;
      case 'percentage_rollout':
        defaultValue = { percentage: 0 };
        break;
      case 'multivariate':
        defaultValue = { variants: [{ key: 'variant_a', value: 'A', percentage: 50 }] };
        break;
      case 'scheduled':
        defaultValue = { enabled: false, startTime: null, endTime: null };
        break;
      case 'segmentation':
        defaultValue = { rules: [], defaultValue: false };
        break;
      default:
        defaultValue = {};
    }

    setFormData(prev => ({ ...prev, type, value: defaultValue }));
  };

  const renderValueEditor = () => {
    switch (formData.type) {
      case 'boolean':
        return (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.value.enabled}
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
              value={formData.value.percentage || 0}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                value: { percentage: parseInt(e.target.value) || 0 }
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
              {formData.value.variants?.map((variant: any, index: number) => (
                <div key={index} className="variant-row">
                  <input
                    type="text"
                    placeholder="Variant key"
                    value={variant.key || ''}
                    onChange={(e) => {
                      const newVariants = [...formData.value.variants];
                      newVariants[index] = { ...variant, key: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        value: { variants: newVariants }
                      }));
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Variant value"
                    value={variant.value || ''}
                    onChange={(e) => {
                      const newVariants = [...formData.value.variants];
                      newVariants[index] = { ...variant, value: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        value: { variants: newVariants }
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
                      const newVariants = [...formData.value.variants];
                      newVariants[index] = { ...variant, percentage: parseInt(e.target.value) || 0 };
                      setFormData(prev => ({
                        ...prev,
                        value: { variants: newVariants }
                      }));
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const newVariants = [...(formData.value.variants || []), {
                    key: `variant_${String.fromCharCode(65 + formData.value.variants.length)}`,
                    value: '',
                    percentage: 0
                  }];
                  setFormData(prev => ({
                    ...prev,
                    value: { variants: newVariants }
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
                  checked={formData.value.enabled}
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
                    value={formData.value.startTime || ''}
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
                    value={formData.value.endTime || ''}
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

      case 'segmentation':
        return (
          <div className="form-group">
            <label>Targeting Rules</label>
            <div className="segmentation-editor">
              <TargetingRuleBuilder
                initialRules={formData.value.rules || []}
                onRulesChange={(rules) => setFormData(prev => ({
                  ...prev,
                  value: { ...prev.value, rules }
                }))}
                onTestRule={async (rules) => {
                  // Mock test implementation
                  return {
                    matches: true,
                    userCount: Math.floor(Math.random() * 5000) + 100
                  };
                }}
              />
              
              <div className="default-value-section">
                <label>Default Value</label>
                <input
                  type="text"
                  placeholder="Value when no rules match (e.g., false, disabled)"
                  value={formData.value.defaultValue || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    value: { ...prev.value, defaultValue: e.target.value }
                  }))}
                />
                <div className="form-help">
                  This value will be used when none of the targeting rules match the user
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-toggle-modal">
        <div className="modal-header">
          <h2>Create Feature Toggle</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && (
            <ValidationMessage type="error" message={errors.submit} />
          )}

          <div className="form-group">
            <label>Key *</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
              placeholder="e.g., new_checkout_flow"
              className={errors.key ? 'error' : ''}
            />
            {errors.key && <ValidationMessage type="error" message={errors.key} />}
            <div className="form-help">
              Unique identifier for this toggle. Use lowercase letters, numbers, underscores, dots, and hyphens only.
            </div>
          </div>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., New Checkout Flow"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <ValidationMessage type="error" message={errors.name} />}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this toggle controls..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Type *</label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as CreateToggleData['type'])}
            >
              <option value="boolean">Boolean (On/Off)</option>
              <option value="percentage_rollout">Percentage Rollout</option>
              <option value="multivariate">Multivariate (A/B/C)</option>
              <option value="scheduled">Scheduled</option>
              <option value="segmentation">User Segmentation</option>
            </select>
          </div>

          {renderValueEditor()}
          
          {errors.value && <ValidationMessage type="error" message={errors.value} />}

          <div className="form-group">
            <label>Claude Impact Level</label>
            <select
              value={formData.claudeImpact}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                claudeImpact: e.target.value as CreateToggleData['claudeImpact'] 
              }))}
            >
              <option value="NONE">None - No Claude impact</option>
              <option value="PROMPT_COST">Prompt Cost - Affects token usage</option>
              <option value="MODEL_VERSION">Model Version - Changes Claude model</option>
              <option value="OUTPUT_QUALITY">Output Quality - Affects response quality</option>
              <option value="HALLUCINATION_RISK">Hallucination Risk - May increase hallucinations</option>
            </select>
            <div className="form-help">
              <Info size={14} />
              Select the appropriate impact level for monitoring and alerting
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              Enable immediately after creation
            </label>
            <div className="form-help">
              <AlertCircle size={14} />
              You can enable the toggle later if you prefer to test it first
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Toggle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};