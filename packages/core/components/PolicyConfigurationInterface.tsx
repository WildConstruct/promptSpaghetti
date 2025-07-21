/**
 * Policy Configuration Interface - Epic 19
 * 
 * Comprehensive React interface for policy authoring, management, versioning,
 * and deployment configuration.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';

// Type definitions matching the service
type PolicyType = 
  'PRIVACY_POLICY' | 'TERMS_OF_SERVICE' | 'COOKIE_POLICY' | 
  'DATA_PROCESSING_AGREEMENT' | 'CONSENT_POLICY' | 'RETENTION_POLICY' |
  'SECURITY_POLICY' | 'ACCEPTABLE_USE_POLICY' | 'GDPR_POLICY' | 'CCPA_POLICY' | 'CUSTOM';

type PolicyStatus = 
  'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 
  'ACTIVE' | 'DEPRECATED' | 'ARCHIVED' | 'SUSPENDED';

type ChangeImpact = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface PolicyConfigurationInterfaceProps {
  onPolicyCreate?: (policy: any) => void;
  onPolicyUpdate?: (policy: any) => void;
  onPolicyDeploy?: (deployment: any) => void;
  initialPolicy?: any;
  mode?: 'create' | 'edit' | 'view';
  complianceFrameworks?: string[];
  jurisdictions?: string[];
  templates?: PolicyTemplate[];
}

interface PolicyTemplate {
  templateId: string;
  name: string;
  description: string;
  framework: string;
  policyType: PolicyType;
  variables: TemplateVariable[];
}

interface TemplateVariable {
  name: string;
  type: 'TEXT' | 'EMAIL' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'LIST';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

interface PolicyFormData {
  policyType: PolicyType;
  title: string;
  description: string;
  jurisdiction: string[];
  complianceFrameworks: string[];
  audience: string[];
  templateId?: string;
  variables: Record<string, any>;
  customizations: PolicyCustomization[];
}

interface PolicyCustomization {
  customizationId: string;
  type: 'BRANDING' | 'CONTENT' | 'STRUCTURE' | 'VARIABLES' | 'STYLING';
  target: string;
  value: any;
  priority: number;
  enabled: boolean;
}

interface DeploymentConfig {
  environment: 'STAGING' | 'PRODUCTION';
  channels: string[];
  rolloutType: 'IMMEDIATE' | 'PHASED' | 'CANARY' | 'BLUE_GREEN';
  phases: RolloutPhase[];
  notifications: NotificationConfig;
}

interface RolloutPhase {
  phaseId: string;
  name: string;
  percentage: number;
  audience: string[];
  duration: number;
}

interface NotificationConfig {
  enabled: boolean;
  channels: string[];
  template: string;
  immediate: boolean;
  scheduled?: Date;
}

// Validation schemas
const PolicyFormSchema = z.object({
  policyType: z.enum(['PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'COOKIE_POLICY', 'DATA_PROCESSING_AGREEMENT', 'CONSENT_POLICY', 'RETENTION_POLICY', 'SECURITY_POLICY', 'ACCEPTABLE_USE_POLICY', 'GDPR_POLICY', 'CCPA_POLICY', 'CUSTOM']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  jurisdiction: z.array(z.string()).min(1, 'At least one jurisdiction is required'),
  complianceFrameworks: z.array(z.string()),
  audience: z.array(z.string()).min(1, 'At least one audience is required')
});

export const PolicyConfigurationInterface: React.FC<PolicyConfigurationInterfaceProps> = ({
  onPolicyCreate,
  onPolicyUpdate,
  onPolicyDeploy,
  initialPolicy,
  mode = 'create',
  complianceFrameworks = ['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI-DSS'],
  jurisdictions = ['US', 'EU', 'UK', 'CA', 'AU'],
  templates = []
}) => {
  // State management
  const [currentTab, setCurrentTab] = useState<'basic' | 'content' | 'compliance' | 'deployment' | 'preview'>('basic');
  const [formData, setFormData] = useState<PolicyFormData>({
    policyType: 'PRIVACY_POLICY',
    title: '',
    description: '',
    jurisdiction: [],
    complianceFrameworks: [],
    audience: [],
    templateId: '',
    variables: {},
    customizations: []
  });
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    environment: 'STAGING',
    channels: [],
    rolloutType: 'IMMEDIATE',
    phases: [],
    notifications: {
      enabled: true,
      channels: ['EMAIL'],
      template: 'default',
      immediate: true
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);

  // Initialize form with initial policy data
  useEffect(() => {
    if (initialPolicy && mode !== 'create') {
      setFormData({
        policyType: initialPolicy.policyType,
        title: initialPolicy.title,
        description: initialPolicy.description,
        jurisdiction: initialPolicy.jurisdiction,
        complianceFrameworks: initialPolicy.complianceFrameworks,
        audience: initialPolicy.audience,
        templateId: initialPolicy.templateId || '',
        variables: initialPolicy.variables || {},
        customizations: initialPolicy.customizations || []
      });
    }
  }, [initialPolicy, mode]);

  // Template selection handling
  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t.templateId === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        templateId,
        policyType: template.policyType,
        complianceFrameworks: [template.framework],
        variables: template.variables.reduce((acc, variable) => ({
          ...acc,
          [variable.name]: variable.defaultValue || ''
        }), {})
      }));
    }
  }, [templates]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    try {
      PolicyFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  // Form submission handlers
  const handleCreate = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const policyData = {
        ...formData,
        templateId: selectedTemplate?.templateId
      };
      
      if (onPolicyCreate) {
        await onPolicyCreate(policyData);
      }
    } catch (error) {
      console.error('Error creating policy:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedTemplate, validateForm, onPolicyCreate]);

  const handleUpdate = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updateData = {
        policyId: initialPolicy?.policyId,
        version: initialPolicy?.version,
        changes: [
          {
            changeId: `CHG-${Date.now()}`,
            type: 'CONTENT',
            location: 'general',
            description: 'Policy configuration updated via interface',
            impact: 'MEDIUM' as ChangeImpact,
            requiresReacceptance: true,
            newValue: formData
          }
        ],
        description: 'Updated policy configuration',
        impact: 'MEDIUM' as ChangeImpact,
        requiresApproval: true,
        notificationRequired: true
      };
      
      if (onPolicyUpdate) {
        await onPolicyUpdate(updateData);
      }
    } catch (error) {
      console.error('Error updating policy:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, initialPolicy, validateForm, onPolicyUpdate]);

  const handleDeploy = useCallback(async () => {
    if (!initialPolicy?.policyId) return;

    setIsLoading(true);
    try {
      const deploymentData = {
        policyId: initialPolicy.policyId,
        version: initialPolicy.version,
        environment: deploymentConfig.environment,
        channels: deploymentConfig.channels,
        rolloutStrategy: {
          type: deploymentConfig.rolloutType,
          phases: deploymentConfig.phases.map(phase => ({
            ...phase,
            startDate: new Date(),
            successCriteria: [],
            dependencies: []
          })),
          rollbackCriteria: [],
          monitoringPeriod: 24
        },
        notificationSettings: {
          enabled: deploymentConfig.notifications.enabled,
          channels: deploymentConfig.notifications.channels.map(channel => ({
            type: channel,
            configuration: {},
            enabled: true
          })),
          audiences: formData.audience,
          template: deploymentConfig.notifications.template,
          scheduling: {
            immediate: deploymentConfig.notifications.immediate,
            scheduled: deploymentConfig.notifications.scheduled
          }
        }
      };
      
      if (onPolicyDeploy) {
        await onPolicyDeploy(deploymentData);
      }
    } catch (error) {
      console.error('Error deploying policy:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deploymentConfig, initialPolicy, formData.audience, onPolicyDeploy]);

  // Computed values
  const availableTemplates = useMemo(() => {
    return templates.filter(template => 
      formData.complianceFrameworks.length === 0 || 
      formData.complianceFrameworks.includes(template.framework)
    );
  }, [templates, formData.complianceFrameworks]);

  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 && formData.title && formData.description && 
           formData.jurisdiction.length > 0 && formData.audience.length > 0;
  }, [errors, formData]);

  // Helper functions for form inputs
  const updateFormField = useCallback((field: keyof PolicyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addCustomization = useCallback(() => {
    const newCustomization: PolicyCustomization = {
      customizationId: `CUST-${Date.now()}`,
      type: 'CONTENT',
      target: '',
      value: '',
      priority: 1,
      enabled: true
    };
    setFormData(prev => ({
      ...prev,
      customizations: [...prev.customizations, newCustomization]
    }));
  }, []);

  const updateCustomization = useCallback((index: number, field: keyof PolicyCustomization, value: any) => {
    setFormData(prev => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) => 
        i === index ? { ...cust, [field]: value } : cust
      )
    }));
  }, []);

  const removeCustomization = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      customizations: prev.customizations.filter((_, i) => i !== index)
    }));
  }, []);

  return (
    <div className="policy-configuration-interface">
      <div className="policy-config-header">
        <h2 className="policy-config-title">
          {mode === 'create' ? 'Create New Policy' : 
           mode === 'edit' ? 'Edit Policy' : 'View Policy'}
        </h2>
        {initialPolicy && (
          <div className="policy-info">
            <span className="policy-id">ID: {initialPolicy.policyId}</span>
            <span className="policy-version">Version: {initialPolicy.version}</span>
            <span className={`policy-status status-${initialPolicy.status?.toLowerCase()}`}>
              {initialPolicy.status}
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="policy-config-tabs">
        <button
          className={`tab-button ${currentTab === 'basic' ? 'active' : ''}`}
          onClick={() => setCurrentTab('basic')}
        >
          Basic Information
        </button>
        <button
          className={`tab-button ${currentTab === 'content' ? 'active' : ''}`}
          onClick={() => setCurrentTab('content')}
        >
          Content & Templates
        </button>
        <button
          className={`tab-button ${currentTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setCurrentTab('compliance')}
        >
          Compliance & Frameworks
        </button>
        <button
          className={`tab-button ${currentTab === 'deployment' ? 'active' : ''}`}
          onClick={() => setCurrentTab('deployment')}
          disabled={mode === 'create'}
        >
          Deployment
        </button>
        <button
          className={`tab-button ${currentTab === 'preview' ? 'active' : ''}`}
          onClick={() => setCurrentTab('preview')}
        >
          Preview
        </button>
      </div>

      {/* Tab Content */}
      <div className="policy-config-content">
        {currentTab === 'basic' && (
          <div className="config-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="policyType">Policy Type *</label>
              <select
                id="policyType"
                value={formData.policyType}
                onChange={(e) => updateFormField('policyType', e.target.value as PolicyType)}
                disabled={mode === 'view'}
              >
                <option value="PRIVACY_POLICY">Privacy Policy</option>
                <option value="TERMS_OF_SERVICE">Terms of Service</option>
                <option value="COOKIE_POLICY">Cookie Policy</option>
                <option value="DATA_PROCESSING_AGREEMENT">Data Processing Agreement</option>
                <option value="CONSENT_POLICY">Consent Policy</option>
                <option value="RETENTION_POLICY">Retention Policy</option>
                <option value="SECURITY_POLICY">Security Policy</option>
                <option value="ACCEPTABLE_USE_POLICY">Acceptable Use Policy</option>
                <option value="GDPR_POLICY">GDPR Policy</option>
                <option value="CCPA_POLICY">CCPA Policy</option>
                <option value="CUSTOM">Custom Policy</option>
              </select>
              {errors.policyType && <div className="error-message">{errors.policyType}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => updateFormField('title', e.target.value)}
                placeholder="Enter policy title"
                disabled={mode === 'view'}
              />
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Enter policy description"
                rows={4}
                disabled={mode === 'view'}
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label>Jurisdiction *</label>
              <div className="checkbox-group">
                {jurisdictions.map(jurisdiction => (
                  <label key={jurisdiction} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.jurisdiction.includes(jurisdiction)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormField('jurisdiction', [...formData.jurisdiction, jurisdiction]);
                        } else {
                          updateFormField('jurisdiction', formData.jurisdiction.filter(j => j !== jurisdiction));
                        }
                      }}
                      disabled={mode === 'view'}
                    />
                    {jurisdiction}
                  </label>
                ))}
              </div>
              {errors.jurisdiction && <div className="error-message">{errors.jurisdiction}</div>}
            </div>

            <div className="form-group">
              <label>Target Audience *</label>
              <div className="checkbox-group">
                {['all-users', 'customers', 'employees', 'partners', 'vendors'].map(audience => (
                  <label key={audience} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.audience.includes(audience)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormField('audience', [...formData.audience, audience]);
                        } else {
                          updateFormField('audience', formData.audience.filter(a => a !== audience));
                        }
                      }}
                      disabled={mode === 'view'}
                    />
                    {audience.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
              {errors.audience && <div className="error-message">{errors.audience}</div>}
            </div>
          </div>
        )}

        {currentTab === 'content' && (
          <div className="config-section">
            <h3>Content & Templates</h3>
            
            {templates.length > 0 && (
              <div className="form-group">
                <label htmlFor="template">Use Template</label>
                <select
                  id="template"
                  value={formData.templateId || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  disabled={mode === 'view'}
                >
                  <option value="">No template (start from scratch)</option>
                  {availableTemplates.map(template => (
                    <option key={template.templateId} value={template.templateId}>
                      {template.name} ({template.framework})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedTemplate && (
              <div className="template-variables">
                <h4>Template Variables</h4>
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.name} className="form-group">
                    <label htmlFor={variable.name}>
                      {variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {variable.required && ' *'}
                    </label>
                    {variable.description && (
                      <div className="help-text">{variable.description}</div>
                    )}
                    {variable.type === 'BOOLEAN' ? (
                      <input
                        type="checkbox"
                        id={variable.name}
                        checked={formData.variables[variable.name] || false}
                        onChange={(e) => updateFormField('variables', {
                          ...formData.variables,
                          [variable.name]: e.target.checked
                        })}
                        disabled={mode === 'view'}
                      />
                    ) : variable.type === 'DATE' ? (
                      <input
                        type="date"
                        id={variable.name}
                        value={formData.variables[variable.name] || ''}
                        onChange={(e) => updateFormField('variables', {
                          ...formData.variables,
                          [variable.name]: e.target.value
                        })}
                        disabled={mode === 'view'}
                      />
                    ) : variable.type === 'NUMBER' ? (
                      <input
                        type="number"
                        id={variable.name}
                        value={formData.variables[variable.name] || ''}
                        onChange={(e) => updateFormField('variables', {
                          ...formData.variables,
                          [variable.name]: e.target.value
                        })}
                        disabled={mode === 'view'}
                      />
                    ) : (
                      <input
                        type={variable.type === 'EMAIL' ? 'email' : 'text'}
                        id={variable.name}
                        value={formData.variables[variable.name] || ''}
                        onChange={(e) => updateFormField('variables', {
                          ...formData.variables,
                          [variable.name]: e.target.value
                        })}
                        disabled={mode === 'view'}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="customizations-section">
              <div className="section-header">
                <h4>Customizations</h4>
                {mode !== 'view' && (
                  <button
                    type="button"
                    onClick={addCustomization}
                    className="add-button"
                  >
                    Add Customization
                  </button>
                )}
              </div>

              {formData.customizations.map((customization, index) => (
                <div key={customization.customizationId} className="customization-item">
                  <div className="customization-header">
                    <span>Customization {index + 1}</span>
                    {mode !== 'view' && (
                      <button
                        type="button"
                        onClick={() => removeCustomization(index)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="customization-fields">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={customization.type}
                        onChange={(e) => updateCustomization(index, 'type', e.target.value)}
                        disabled={mode === 'view'}
                      >
                        <option value="BRANDING">Branding</option>
                        <option value="CONTENT">Content</option>
                        <option value="STRUCTURE">Structure</option>
                        <option value="VARIABLES">Variables</option>
                        <option value="STYLING">Styling</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Target</label>
                      <input
                        type="text"
                        value={customization.target}
                        onChange={(e) => updateCustomization(index, 'target', e.target.value)}
                        placeholder="e.g., section.introduction, header.logo"
                        disabled={mode === 'view'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Value</label>
                      <textarea
                        value={customization.value}
                        onChange={(e) => updateCustomization(index, 'value', e.target.value)}
                        placeholder="Customization value"
                        rows={2}
                        disabled={mode === 'view'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Priority</label>
                      <input
                        type="number"
                        value={customization.priority}
                        onChange={(e) => updateCustomization(index, 'priority', parseInt(e.target.value))}
                        min="1"
                        max="10"
                        disabled={mode === 'view'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={customization.enabled}
                          onChange={(e) => updateCustomization(index, 'enabled', e.target.checked)}
                          disabled={mode === 'view'}
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'compliance' && (
          <div className="config-section">
            <h3>Compliance & Frameworks</h3>
            
            <div className="form-group">
              <label>Compliance Frameworks</label>
              <div className="checkbox-group">
                {complianceFrameworks.map(framework => (
                  <label key={framework} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.complianceFrameworks.includes(framework)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormField('complianceFrameworks', [...formData.complianceFrameworks, framework]);
                        } else {
                          updateFormField('complianceFrameworks', formData.complianceFrameworks.filter(f => f !== framework));
                        }
                      }}
                      disabled={mode === 'view'}
                    />
                    {framework}
                  </label>
                ))}
              </div>
            </div>

            {formData.complianceFrameworks.length > 0 && (
              <div className="compliance-info">
                <h4>Framework Requirements</h4>
                {formData.complianceFrameworks.map(framework => (
                  <div key={framework} className="framework-requirements">
                    <h5>{framework}</h5>
                    <ul>
                      {framework === 'GDPR' && (
                        <>
                          <li>✓ Clear legal basis for processing</li>
                          <li>✓ Data subject rights section</li>
                          <li>✓ Contact information for DPO</li>
                          <li>✓ Data transfer safeguards</li>
                        </>
                      )}
                      {framework === 'CCPA' && (
                        <>
                          <li>✓ Categories of personal information</li>
                          <li>✓ Right to know and delete</li>
                          <li>✓ Non-discrimination clause</li>
                          <li>✓ Contact information for requests</li>
                        </>
                      )}
                      {framework === 'HIPAA' && (
                        <>
                          <li>✓ Protected health information usage</li>
                          <li>✓ Patient rights section</li>
                          <li>✓ Security safeguards description</li>
                          <li>✓ Breach notification procedures</li>
                        </>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'deployment' && mode !== 'create' && (
          <div className="config-section">
            <h3>Deployment Configuration</h3>
            
            <div className="form-group">
              <label htmlFor="environment">Environment</label>
              <select
                id="environment"
                value={deploymentConfig.environment}
                onChange={(e) => setDeploymentConfig(prev => ({
                  ...prev,
                  environment: e.target.value as 'STAGING' | 'PRODUCTION'
                }))}
                disabled={mode === 'view'}
              >
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rolloutType">Rollout Strategy</label>
              <select
                id="rolloutType"
                value={deploymentConfig.rolloutType}
                onChange={(e) => setDeploymentConfig(prev => ({
                  ...prev,
                  rolloutType: e.target.value as any
                }))}
                disabled={mode === 'view'}
              >
                <option value="IMMEDIATE">Immediate</option>
                <option value="PHASED">Phased</option>
                <option value="CANARY">Canary</option>
                <option value="BLUE_GREEN">Blue-Green</option>
              </select>
            </div>

            <div className="form-group">
              <label>Deployment Channels</label>
              <div className="checkbox-group">
                {['web', 'mobile', 'email', 'api'].map(channel => (
                  <label key={channel} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.channels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDeploymentConfig(prev => ({
                            ...prev,
                            channels: [...prev.channels, channel]
                          }));
                        } else {
                          setDeploymentConfig(prev => ({
                            ...prev,
                            channels: prev.channels.filter(c => c !== channel)
                          }));
                        }
                      }}
                      disabled={mode === 'view'}
                    />
                    {channel.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            <div className="notification-settings">
              <h4>Notification Settings</h4>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.notifications.enabled}
                    onChange={(e) => setDeploymentConfig(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enabled: e.target.checked }
                    }))}
                    disabled={mode === 'view'}
                  />
                  Enable Notifications
                </label>
              </div>

              {deploymentConfig.notifications.enabled && (
                <>
                  <div className="form-group">
                    <label>Notification Channels</label>
                    <div className="checkbox-group">
                      {['EMAIL', 'SMS', 'IN_APP', 'PUSH'].map(channel => (
                        <label key={channel} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={deploymentConfig.notifications.channels.includes(channel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDeploymentConfig(prev => ({
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    channels: [...prev.notifications.channels, channel]
                                  }
                                }));
                              } else {
                                setDeploymentConfig(prev => ({
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    channels: prev.notifications.channels.filter(c => c !== channel)
                                  }
                                }));
                              }
                            }}
                            disabled={mode === 'view'}
                          />
                          {channel}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={deploymentConfig.notifications.immediate}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, immediate: e.target.checked }
                        }))}
                        disabled={mode === 'view'}
                      />
                      Send Immediately
                    </label>
                  </div>

                  {!deploymentConfig.notifications.immediate && (
                    <div className="form-group">
                      <label htmlFor="scheduledDate">Scheduled Date</label>
                      <input
                        type="datetime-local"
                        id="scheduledDate"
                        value={deploymentConfig.notifications.scheduled?.toISOString().slice(0, 16) || ''}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            scheduled: new Date(e.target.value)
                          }
                        }))}
                        disabled={mode === 'view'}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {currentTab === 'preview' && (
          <div className="config-section">
            <h3>Configuration Preview</h3>
            
            <div className="preview-content">
              <div className="preview-section">
                <h4>Basic Information</h4>
                <dl>
                  <dt>Policy Type:</dt>
                  <dd>{formData.policyType.replace(/_/g, ' ')}</dd>
                  <dt>Title:</dt>
                  <dd>{formData.title || 'Not specified'}</dd>
                  <dt>Description:</dt>
                  <dd>{formData.description || 'Not specified'}</dd>
                  <dt>Jurisdiction:</dt>
                  <dd>{formData.jurisdiction.join(', ') || 'Not specified'}</dd>
                  <dt>Audience:</dt>
                  <dd>{formData.audience.join(', ') || 'Not specified'}</dd>
                </dl>
              </div>

              <div className="preview-section">
                <h4>Compliance</h4>
                <dl>
                  <dt>Frameworks:</dt>
                  <dd>{formData.complianceFrameworks.join(', ') || 'None selected'}</dd>
                </dl>
              </div>

              {selectedTemplate && (
                <div className="preview-section">
                  <h4>Template</h4>
                  <dl>
                    <dt>Selected Template:</dt>
                    <dd>{selectedTemplate.name}</dd>
                    <dt>Framework:</dt>
                    <dd>{selectedTemplate.framework}</dd>
                    <dt>Variables:</dt>
                    <dd>
                      {Object.entries(formData.variables).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                    </dd>
                  </dl>
                </div>
              )}

              {formData.customizations.length > 0 && (
                <div className="preview-section">
                  <h4>Customizations</h4>
                  {formData.customizations.map((cust, index) => (
                    <div key={cust.customizationId} className="customization-preview">
                      <strong>{cust.type}</strong> - {cust.target}: {cust.value}
                    </div>
                  ))}
                </div>
              )}

              {mode !== 'create' && (
                <div className="preview-section">
                  <h4>Deployment Configuration</h4>
                  <dl>
                    <dt>Environment:</dt>
                    <dd>{deploymentConfig.environment}</dd>
                    <dt>Rollout Strategy:</dt>
                    <dd>{deploymentConfig.rolloutType}</dd>
                    <dt>Channels:</dt>
                    <dd>{deploymentConfig.channels.join(', ') || 'None selected'}</dd>
                    <dt>Notifications:</dt>
                    <dd>{deploymentConfig.notifications.enabled ? 'Enabled' : 'Disabled'}</dd>
                  </dl>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="policy-config-actions">
        {mode === 'create' && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={!isFormValid || isLoading}
            className="primary-button"
          >
            {isLoading ? 'Creating...' : 'Create Policy'}
          </button>
        )}

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!isFormValid || isLoading}
            className="primary-button"
          >
            {isLoading ? 'Updating...' : 'Update Policy'}
          </button>
        )}

        {mode !== 'create' && currentTab === 'deployment' && (
          <button
            type="button"
            onClick={handleDeploy}
            disabled={isLoading || deploymentConfig.channels.length === 0}
            className="deploy-button"
          >
            {isLoading ? 'Deploying...' : 'Deploy Policy'}
          </button>
        )}

        <button type="button" className="secondary-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PolicyConfigurationInterface;