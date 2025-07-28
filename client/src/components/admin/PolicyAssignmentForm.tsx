/**
 * Policy Assignment Form
 * 
 * Form component for creating and editing individual policy assignments
 * with validation, inheritance configuration, and condition management
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useEffect } from 'react';
import { 
  PolicyAssignment, 
  AssignmentTargetType,
  AssignmentCondition,
  InheritanceType,
  ConditionType,
  ConditionOperator,
  RiskLevel,
  AssignmentSource
} from '../../types/PolicyAssignmentTypes';
import './PolicyAssignmentForm.css';
interface PolicyAssignmentFormProps {
  assignment?: PolicyAssignment;
  onSubmit: (data: Partial<PolicyAssignment>) => Promise<void>;
  onCancel: () => void;
}
interface FormData {
  policyId: string;
  policyType: string;
  policyVersion: string;
  targetType: AssignmentTargetType;
  targetId: string;
  targetDisplayName: string;
  effectiveDate: string;
  expirationDate: string;
  priority: number;
  conditions: AssignmentCondition[];
  inheritance: {,
    type: InheritanceType;
    inheritanceDepth: number;
    blockInheritance: boolean;
  };
  metadata: {,
    reason: string;
    businessJustification: string;
    riskLevel: RiskLevel;
    reviewRequired: boolean;
    reviewFrequencyDays?: number;
    tags: string[];
    complianceFrameworks: string[];
  };
}
const INITIAL_FORM_DATA: FormData = {
  policyId: '',
  policyType: '',
  policyVersion: '1.0',
  targetType: AssignmentTargetType.USER,
  targetId: '',
  targetDisplayName: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  expirationDate: '',
  priority: 100,
  conditions: [],
  inheritance: {,
    type: InheritanceType.NONE,
    inheritanceDepth: 0,
    blockInheritance: false,
  },
  metadata: {,
    reason: '',
    businessJustification: '',
    riskLevel: RiskLevel.MEDIUM,
    reviewRequired: false,
    tags: [],
    complianceFrameworks: [],
  }
};

export const PolicyAssignmentForm: React.FC<PolicyAssignmentFormProps> = ({)
  assignment,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'conditions' | 'inheritance' | 'metadata'>('basic');
  useEffect(() => {
    if (assignment) {
      setFormData({)
        policyId: assignment.policyId,
        policyType: assignment.policyType,
        policyVersion: assignment.policyVersion,
        targetType: assignment.targetType,
        targetId: assignment.targetId,
        targetDisplayName: assignment.targetDisplayName,
        effectiveDate: assignment.effectiveDate.toISOString().split('T')[0],
        expirationDate: assignment.expirationDate?.toISOString().split('T')[0] || '',
        priority: assignment.priority,
        conditions: assignment.conditions,
        inheritance: assignment.inheritance,
        metadata: assignment.metadata,
      });
    }
  }, [assignment]);
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.policyId.trim()) {
      newErrors.policyId = 'Policy ID is required';
    }
    if (!formData.policyType.trim()) {
      newErrors.policyType = 'Policy type is required';
    }
    if (!formData.targetId.trim()) {
      newErrors.targetId = 'Target ID is required';
    }
    if (!formData.targetDisplayName.trim()) {
      newErrors.targetDisplayName = 'Target display name is required';
    }
    if (formData.priority < 1 || formData.priority > 1000) {
      newErrors.priority = 'Priority must be between 1 and 1000';
    }
    if (formData.expirationDate && formData.expirationDate <= formData.effectiveDate) {
      newErrors.expirationDate = 'Expiration date must be after effective date';
    }
    if (!formData.metadata.businessJustification.trim()) {
      newErrors.businessJustification = 'Business justification is required';
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
      const submitData: Partial<PolicyAssignment> = {
        ...formData,
        effectiveDate: new Date(formData.effectiveDate),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
        metadata: {,
          ...formData.metadata,
          source: AssignmentSource.MANUAL,
        }
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const updateFormData = (field: string, value: Error) => {
    setFormData(prev => ({)
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({)
        ...prev,
        [field]: undefined
      }));
    }
  };
  const updateNestedFormData = (section: string, field: string, value: Error) => {
    setFormData(prev => ({)
      ...prev,
      [section]: {
        ...prev[section as keyof FormData],
        [field]: value
      }
    }));
  };
  const addCondition = () => {
    const newCondition: AssignmentCondition = {
      conditionId: `cond_${Date.now()}`,}
      type: ConditionType.CONTEXTUAL,
      operator: ConditionOperator.EQUALS,
      field: '',
      value: '',
      description: '',
    };
    setFormData(prev => ({)
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };
  const updateCondition = (index: number, field: keyof AssignmentCondition, value: Error) => {
    setFormData(prev => ({)
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
    }));
  };
  const removeCondition = (index: number) => {
    setFormData(prev => ({)
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.metadata.tags.includes(tag.trim())) {
      updateNestedFormData('metadata', 'tags', [...formData.metadata.tags, tag.trim()]);
    }
  };
  const removeTag = (tagToRemove: string) => {
    updateNestedFormData('metadata', 'tags', )
      formData.metadata.tags.filter(tag => tag !== tagToRemove)
    );
  };
  const renderBasicTab = () => (;)
    <div className="form-tab">
      <div className="form-section">
        <h3>Policy Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="policyId">Policy ID *</label>
            <input
              id="policyId"
              type="text"
              value={formData.policyId}
              onChange={(e) => updateFormData('policyId', e.target.value)}
              className={errors.policyId ? 'error' : ''}
              placeholder="Enter policy ID"
            />
            {errors.policyId && <span className="error-message">{errors.policyId}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="policyType">Policy Type *</label>
            <input
              id="policyType"
              type="text"
              value={formData.policyType}
              onChange={(e) => updateFormData('policyType', e.target.value)}
              className={errors.policyType ? 'error' : ''}
              placeholder="e.g., ACCESS_CONTROL, DATA_FILTERING"
            />
            {errors.policyType && <span className="error-message">{errors.policyType}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="policyVersion">Policy Version</label>
            <input
              id="policyVersion"
              type="text"
              value={formData.policyVersion}
              onChange={(e) => updateFormData('policyVersion', e.target.value)}
              placeholder="1.0"
            />
          </div>
        </div>
      </div>
      <div className="form-section">
        <h3>Target Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="targetType">Target Type *</label>
            <select
              id="targetType"
              value={formData.targetType}
              onChange={(e) => updateFormData('targetType', e.target.value as AssignmentTargetType)}
            >
              <option value={AssignmentTargetType.USER}>User</option>
              <option value={AssignmentTargetType.ROLE}>Role</option>
              <option value={AssignmentTargetType.TEAM}>Team</option>
              <option value={AssignmentTargetType.ORG_UNIT}>Organization Unit</option>
              <option value={AssignmentTargetType.DEPARTMENT}>Department</option>
              <option value={AssignmentTargetType.LOCATION}>Location</option>
              <option value={AssignmentTargetType.DATA_TYPE}>Data Type</option>
              <option value={AssignmentTargetType.SYSTEM}>System</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="targetId">Target ID *</label>
            <input
              id="targetId"
              type="text"
              value={formData.targetId}
              onChange={(e) => updateFormData('targetId', e.target.value)}
              className={errors.targetId ? 'error' : ''}
              placeholder="Enter target identifier"
            />
            {errors.targetId && <span className="error-message">{errors.targetId}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="targetDisplayName">Display Name *</label>
            <input
              id="targetDisplayName"
              type="text"
              value={formData.targetDisplayName}
              onChange={(e) => updateFormData('targetDisplayName', e.target.value)}
              className={errors.targetDisplayName ? 'error' : ''}
              placeholder="Human-readable target name"
            />
            {errors.targetDisplayName && <span className="error-message">{errors.targetDisplayName}</span>}
          </div>
        </div>
      </div>
      <div className="form-section">
        <h3>Assignment Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="effectiveDate">Effective Date *</label>
            <input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => updateFormData('effectiveDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="expirationDate">Expiration Date</label>
            <input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => updateFormData('expirationDate', e.target.value)}
              className={errors.expirationDate ? 'error' : ''}
            />
            {errors.expirationDate && <span className="error-message">{errors.expirationDate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority *</label>
            <input
              id="priority"
              type="number"
              min="1"
              max="1000"
              value={formData.priority}
              onChange={(e) => updateFormData('priority', parseInt(e.target.value))}
              className={errors.priority ? 'error' : ''}
            />
            {errors.priority && <span className="error-message">{errors.priority}</span>}
          </div>
        </div>
      </div>
    </div>
  );
  const renderConditionsTab = () => (;)
    <div className="form-tab">
      <div className="form-section">
        <div className="section-header">
          <h3>Assignment Conditions</h3>
          <button type="button" onClick={addCondition} className="btn btn-secondary">
            Add Condition
          </button>
        </div>
        {formData.conditions.length === 0 ? ()
          <p className="empty-state">No conditions defined. This assignment will always be active.</p>
        ) : ()
          <div className="conditions-list">
            {formData.conditions.map((condition, index) => ()
              <div key={condition.conditionId} className="condition-card">
                <div className="condition-header">
                  <span className="condition-label">Condition {index + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => removeCondition(index)}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                </div>
                <div className="condition-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={condition.type}
                        onChange={(e) => updateCondition(index, 'type', e.target.value as ConditionType)}
                      >
                        <option value={ConditionType.TEMPORAL}>Temporal</option>
                        <option value={ConditionType.GEOGRAPHICAL}>Geographical</option>
                        <option value={ConditionType.CONTEXTUAL}>Contextual</option>
                        <option value={ConditionType.DATA_BASED}>Data Based</option>
                        <option value={ConditionType.USER_ATTRIBUTE}>User Attribute</option>
                        <option value={ConditionType.SYSTEM_STATE}>System State</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Field</label>
                      <input
                        type="text"
                        value={condition.field}
                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                        placeholder="Field name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Operator</label>
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value as ConditionOperator)}
                      >
                        <option value={ConditionOperator.EQUALS}>Equals</option>
                        <option value={ConditionOperator.NOT_EQUALS}>Not Equals</option>
                        <option value={ConditionOperator.GREATER_THAN}>Greater Than</option>
                        <option value={ConditionOperator.LESS_THAN}>Less Than</option>
                        <option value={ConditionOperator.IN}>In</option>
                        <option value={ConditionOperator.NOT_IN}>Not In</option>
                        <option value={ConditionOperator.CONTAINS}>Contains</option>
                        <option value={ConditionOperator.STARTS_WITH}>Starts With</option>
                        <option value={ConditionOperator.REGEX_MATCH}>Regex Match</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Value</label>
                      <input
                        type="text"
                        value={condition.value as string}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="Comparison value"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={condition.description}
                      onChange={(e) => updateCondition(index, 'description', e.target.value)}
                      placeholder="Describe when this condition applies"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  const renderInheritanceTab = () => (;)
    <div className="form-tab">
      <div className="form-section">
        <h3>Inheritance Configuration</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="inheritanceType">Inheritance Type</label>
            <select
              id="inheritanceType"
              value={formData.inheritance.type}
              onChange={(e) => updateNestedFormData('inheritance', 'type', e.target.value as InheritanceType)}
            >
              <option value={InheritanceType.NONE}>None</option>
              <option value={InheritanceType.DIRECT}>Direct</option>
              <option value={InheritanceType.CASCADING}>Cascading</option>
              <option value={InheritanceType.CONDITIONAL}>Conditional</option>
            </select>
          </div>
          {formData.inheritance.type !== InheritanceType.NONE && ()
            <>
              <div className="form-group">
                <label htmlFor="inheritanceDepth">Inheritance Depth</label>
                <input
                  id="inheritanceDepth"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.inheritance.inheritanceDepth}
                  onChange={(e) => updateNestedFormData('inheritance', 'inheritanceDepth', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.inheritance.blockInheritance}
                    onChange={(e) => updateNestedFormData('inheritance', 'blockInheritance', e.target.checked)}
                  />
                  Block Further Inheritance
                </label>
              </div>
            </>
          )}
        </div>
        {formData.inheritance.type !== InheritanceType.NONE && ()
          <div className="inheritance-info">
            <h4>Inheritance Rules</h4>
            <ul>
              <li><strong>Direct:</strong> Only direct child targets inherit this policy</li>
              <li><strong>Cascading:</strong> All descendant targets inherit this policy</li>
              <li><strong>Conditional:</strong> Inheritance depends on conditions being met</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
  const renderMetadataTab = () => (;)
    <div className="form-tab">
      <div className="form-section">
        <h3>Assignment Metadata</h3>
        <div className="form-group">
          <label htmlFor="reason">Reason</label>
          <textarea
            id="reason"
            value={formData.metadata.reason}
            onChange={(e) => updateNestedFormData('metadata', 'reason', e.target.value)}
            placeholder="Brief reason for this assignment"
            rows={2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="businessJustification">Business Justification *</label>
          <textarea
            id="businessJustification"
            value={formData.metadata.businessJustification}
            onChange={(e) => updateNestedFormData('metadata', 'businessJustification', e.target.value)}
            className={errors.businessJustification ? 'error' : ''}
            placeholder="Detailed business justification for this assignment"
            rows={3}
          />
          {errors.businessJustification && <span className="error-message">{errors.businessJustification}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="riskLevel">Risk Level</label>
            <select
              id="riskLevel"
              value={formData.metadata.riskLevel}
              onChange={(e) => updateNestedFormData('metadata', 'riskLevel', e.target.value as RiskLevel)}
            >
              <option value={RiskLevel.LOW}>Low</option>
              <option value={RiskLevel.MEDIUM}>Medium</option>
              <option value={RiskLevel.HIGH}>High</option>
              <option value={RiskLevel.CRITICAL}>Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.metadata.reviewRequired}
                onChange={(e) => updateNestedFormData('metadata', 'reviewRequired', e.target.checked)}
              />
              Review Required
            </label>
          </div>
          {formData.metadata.reviewRequired && ()
            <div className="form-group">
              <label htmlFor="reviewFrequency">Review Frequency (days)</label>
              <input
                id="reviewFrequency"
                type="number"
                min="1"
                value={formData.metadata.reviewFrequencyDays || ''}
                onChange={(e) => updateNestedFormData('metadata', 'reviewFrequencyDays', )
                  e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Tags</label>
          <div className="tags-input">
            <div className="tags-list">
              {formData.metadata.tags.map((tag, index) => ()
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
  return ()
    <div className="modal-overlay">
      <div className="policy-assignment-form">
        <div className="form-header">
          <h2>{assignment ? 'Edit' : 'Create'} Policy Assignment</h2>
          <button type="button" onClick={onCancel} className="close-button">
            ×
          </button>
        </div>
        <div className="form-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'conditions' ? 'active' : ''}`}
            onClick={() => setActiveTab('conditions')}
          >
            Conditions ({formData.conditions.length})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'inheritance' ? 'active' : ''}`}
            onClick={() => setActiveTab('inheritance')}
          >
            Inheritance
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'metadata' ? 'active' : ''}`}
            onClick={() => setActiveTab('metadata')}
          >
            Metadata
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-content">
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'conditions' && renderConditionsTab()}
            {activeTab === 'inheritance' && renderInheritanceTab()}
            {activeTab === 'metadata' && renderMetadataTab()}
          </div>
          <div className="form-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : (assignment ? 'Update' : 'Create') + ' Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};