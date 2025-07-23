/**
 * Security Event Logging Configuration Panel
 * 
 * Comprehensive UI for configuring security event logging policies, destinations,
 * alert rules, and compliance framework settings. Builds on existing PromptScape
 * UI patterns and integrates with the security event policy engine.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SecurityEventType,
  SecurityEventSeverity,
  ComplianceFramework,
  SecurityEventPolicy,
  securityEventPolicyEngine,
  securityEventPolicyManager
} from '../../security/SecurityEventLoggingPolicies';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Tabs } from '../ui/Tabs';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import { Progress } from '../ui/Progress';
import { AlertRuleBuilder } from './AlertRuleBuilder';
import './SecurityEventLoggingConfigPanel.css';

interface SecurityLoggingConfig {
  enabled: boolean;
  destinations: LoggingDestination[];
  event_types: SecurityEventType[];
  alert_rules: AlertRule[];
  retention_policies: RetentionPolicy[];
  performance_settings: PerformanceSettings;
  compliance_settings: ComplianceSettings;
}

interface LoggingDestination {
  id: string;
  name: string;
  type: 'file' | 'database' | 'siem' | 'webhook' | 'elasticsearch';
  endpoint: string;
  enabled: boolean;
  credentials?: Record<string, string>;
  format: 'json' | 'csv' | 'syslog' | 'cef';
  batch_size?: number;
  flush_interval?: number;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  event_types: SecurityEventType[];
  severity_threshold: SecurityEventSeverity;
  conditions: AlertCondition[];
  actions: AlertAction[];
  enabled: boolean;
  notification_channels: string[];
}

interface AlertCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
  value: Error;
  logic?: 'and' | 'or';
}

interface AlertAction {
  type: 'notification' | 'containment' | 'escalation' | 'logging';
  config: Record<string, any>;
}

interface RetentionPolicy {
  framework: ComplianceFramework;
  retention_days: number;
  encryption_required: boolean;
  archive_after_days?: number;
  archive_destination?: string;
}

interface PerformanceSettings {
  batch_processing_enabled: boolean;
  batch_size: number;
  batch_interval_ms: number;
  queue_size_limit: number;
  circuit_breaker_enabled: boolean;
  circuit_breaker_threshold: number;
  rate_limit_per_minute: number;
}

interface ComplianceSettings {
  frameworks: ComplianceFramework[];
  automated_reporting: boolean;
  external_notifications: boolean;
  validation_rules: ValidationRule[];
}

interface ValidationRule {
  framework: ComplianceFramework;
  field: string;
  required: boolean;
  pattern?: string;
  custom_validator?: string;
}

/**
 * Main Security Event Logging Configuration Panel
 */
export const SecurityEventLoggingConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<SecurityLoggingConfig>({
    enabled: true,
    destinations: [],
    event_types: [],
    alert_rules: [],
    retention_policies: [],
    performance_settings: {
      batch_processing_enabled: true,
      batch_size: 100,
      batch_interval_ms: 60000,
      queue_size_limit: 10000,
      circuit_breaker_enabled: true,
      circuit_breaker_threshold: 100,
      rate_limit_per_minute: 1000
    },
    compliance_settings: {
      frameworks: [],
      automated_reporting: true,
      external_notifications: true,
      validation_rules: []
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [policies, setPolicies] = useState<SecurityEventPolicy[]>([]);

  // Load current configuration and policies
  useEffect(() => {
    loadConfiguration();
    loadPolicies();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      // Load current security logging configuration
      // In a real implementation, this would fetch from an API
      const currentConfig = await fetchSecurityLoggingConfig();
      setConfig(currentConfig);
    } catch (error) {
      setErrors(['Failed to load security logging configuration']);
    } finally {
      setLoading(false);
    }
  };

  const loadPolicies = () => {
    try {
      const currentPolicies = securityEventPolicyEngine.getPolicies();
      setPolicies(currentPolicies);
    } catch (error) {
      setErrors(prev => [...prev, 'Failed to load security policies']);
    }
  };

  const handleConfigChange = useCallback((updates: Partial<SecurityLoggingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveConfiguration = async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate configuration
      const validationErrors = validateConfiguration(config);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Save configuration
      await saveSecurityLoggingConfig(config);
      setHasUnsavedChanges(false);

      // Show success message
      // In a real implementation, this would show a toast notification
      console.log('Security logging configuration saved successfully');
    } catch (error) {
      setErrors(['Failed to save configuration: ' + (error instanceof Error ? error.message : 'Unknown error')]);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfiguration = async () => {
    setLoading(true);
    try {
      const testResults = await testSecurityLoggingConfig(config);
      // Show test results in a dialog or notification
      console.log('Configuration test results:', testResults);
    } catch (error) {
      setErrors(['Configuration test failed: ' + (error instanceof Error ? error.message : 'Unknown error')]);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="config-overview">
      <div className="overview-header">
        <h2>Security Event Logging Overview</h2>
        <p>Configure comprehensive security event logging, monitoring, and compliance reporting</p>
      </div>

      {/* System Status */}
      <Card className="status-card">
        <div className="card-header">
          <h3>System Status</h3>
          <Badge variant={config.enabled ? 'success' : 'error'}>
            {config.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Active Destinations</span>
            <span className="value">{config.destinations.filter(d => d.enabled).length}</span>
          </div>
          <div className="status-item">
            <span className="label">Monitored Event Types</span>
            <span className="value">{config.event_types.length}</span>
          </div>
          <div className="status-item">
            <span className="label">Active Alert Rules</span>
            <span className="value">{config.alert_rules.filter(r => r.enabled).length}</span>
          </div>
          <div className="status-item">
            <span className="label">Compliance Frameworks</span>
            <span className="value">{config.compliance_settings.frameworks.length}</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Button
            variant="primary"
            onClick={() => setActiveTab('destinations')}
          >
            Configure Destinations
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('alerts')}
          >
            Manage Alert Rules
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('compliance')}
          >
            Compliance Settings
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConfiguration}
            disabled={loading}
          >
            Test Configuration
          </Button>
        </div>
      </Card>

      {/* Active Policies */}
      <Card className="policies-card">
        <h3>Security Event Policies</h3>
        <div className="policies-grid">
          {policies.map(policy => (
            <div key={policy.policy_id} className="policy-item">
              <div className="policy-header">
                <span className="policy-name">{policy.policy_name}</span>
                <Badge variant={policy.enabled ? 'success' : 'warning'}>
                  {policy.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <div className="policy-details">
                <span>Event Types: {policy.event_types.length}</span>
                <span>Min Severity: {policy.severity_threshold}</span>
                <span>Compliance: {policy.compliance_mapping.frameworks.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDestinationsTab = () => (
    <LogDestinationManager
      destinations={config.destinations}
      onDestinationsChange={(destinations) => handleConfigChange({ destinations })}
    />
  );

  const renderEventTypesTab = () => (
    <EventTypeSelector
      selectedTypes={config.event_types}
      onSelectionChange={(event_types) => handleConfigChange({ event_types })}
    />
  );

  const renderAlertsTab = () => (
    <AlertRuleBuilder
      alertRules={config.alert_rules}
      onRulesChange={(alert_rules) => handleConfigChange({ alert_rules })}
    />
  );

  const renderRetentionTab = () => (
    <RetentionPolicyEditor
      policies={config.retention_policies}
      onPoliciesChange={(retention_policies) => handleConfigChange({ retention_policies })}
    />
  );

  const renderPerformanceTab = () => (
    <PerformanceSettingsPanel
      settings={config.performance_settings}
      onSettingsChange={(performance_settings) => handleConfigChange({ performance_settings })}
    />
  );

  const renderComplianceTab = () => (
    <ComplianceFrameworkSettings
      settings={config.compliance_settings}
      onSettingsChange={(compliance_settings) => handleConfigChange({ compliance_settings })}
    />
  );

  return (
    <div className="security-logging-config">
      <div className="config-header">
        <div className="header-content">
          <h1>🛡️ Security Event Logging Configuration</h1>
          <p>Manage security event logging, monitoring, and compliance settings</p>
        </div>
        <div className="header-actions">
          {hasUnsavedChanges && (
            <Badge variant="warning">Unsaved Changes</Badge>
          )}
          <Button
            variant="outline"
            onClick={() => loadConfiguration()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveConfiguration}
            disabled={loading || !hasUnsavedChanges}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="error" className="config-errors">
          <strong>Configuration Errors:</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="config-tabs"
      >
        <div className="tabs-list">
          <button
            className={`tab-trigger ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-trigger ${activeTab === 'destinations' ? 'active' : ''}`}
            onClick={() => setActiveTab('destinations')}
          >
            Destinations
          </button>
          <button
            className={`tab-trigger ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Event Types
          </button>
          <button
            className={`tab-trigger ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alert Rules
          </button>
          <button
            className={`tab-trigger ${activeTab === 'retention' ? 'active' : ''}`}
            onClick={() => setActiveTab('retention')}
          >
            Retention
          </button>
          <button
            className={`tab-trigger ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`tab-trigger ${activeTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            Compliance
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'destinations' && renderDestinationsTab()}
          {activeTab === 'events' && renderEventTypesTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'retention' && renderRetentionTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'compliance' && renderComplianceTab()}
        </div>
      </Tabs>

      {showConfirmDialog && (
        <Dialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Unsaved Changes"
          description="You have unsaved changes. Are you sure you want to leave this page?"
        >
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              setShowConfirmDialog(false);
              setHasUnsavedChanges(false);
            }}>
              Discard Changes
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

// Component for managing logging destinations
const LogDestinationManager: React.FC<{
  destinations: LoggingDestination[];
  onDestinationsChange: (destinations: LoggingDestination[]) => void;
}> = ({ destinations, onDestinationsChange }) => {
  const [_editingDestination, setEditingDestination] = useState<LoggingDestination | null>(null);
  const [_showAddDialog, setShowAddDialog] = useState(false);

  const _handleAddDestination = (newDestination: LoggingDestination) => {
    onDestinationsChange([...destinations, newDestination]);
    setShowAddDialog(false);
  };

  const _handleUpdateDestination = (updated: LoggingDestination) => {
    const updatedDestinations = destinations.map(dest => 
      dest.id === updated.id ? updated : dest
    );
    onDestinationsChange(updatedDestinations);
    setEditingDestination(null);
  };

  const handleDeleteDestination = (id: string) => {
    const filtered = destinations.filter(dest => dest.id !== id);
    onDestinationsChange(filtered);
  };

  return (
    <div className="destination-manager">
      <div className="manager-header">
        <h2>Logging Destinations</h2>
        <p>Configure where security events are sent for storage and processing</p>
        <Button variant="primary" onClick={() => setShowAddDialog(true)}>
          Add Destination
        </Button>
      </div>

      <div className="destinations-grid">
        {destinations.map(destination => (
          <Card key={destination.id} className="destination-card">
            <div className="destination-header">
              <div className="destination-info">
                <h3>{destination.name}</h3>
                <Badge variant={destination.type === 'siem' ? 'info' : 'default'}>
                  {destination.type.toUpperCase()}
                </Badge>
                <Badge variant={destination.enabled ? 'success' : 'error'}>
                  {destination.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="destination-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingDestination(destination)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDestination(destination.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="destination-details">
              <div className="detail-item">
                <span className="label">Endpoint:</span>
                <span className="value">{destination.endpoint}</span>
              </div>
              <div className="detail-item">
                <span className="label">Format:</span>
                <span className="value">{destination.format.toUpperCase()}</span>
              </div>
              {destination.batch_size && (
                <div className="detail-item">
                  <span className="label">Batch Size:</span>
                  <span className="value">{destination.batch_size}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {destinations.length === 0 && (
        <div className="empty-state">
          <h3>No Destinations Configured</h3>
          <p>Add your first logging destination to start collecting security events.</p>
          <Button variant="primary" onClick={() => setShowAddDialog(true)}>
            Add First Destination
          </Button>
        </div>
      )}
    </div>
  );
};

// Component for selecting event types to monitor
const EventTypeSelector: React.FC<{
  selectedTypes: SecurityEventType[];
  onSelectionChange: (types: SecurityEventType[]) => void;
}> = ({ selectedTypes, onSelectionChange }) => {
  const eventTypeCategories = {
    'Application Security': [
      SecurityEventType.AUTHENTICATION_FAILURE,
      SecurityEventType.AUTHORIZATION_VIOLATION,
      SecurityEventType.CODE_INJECTION_ATTEMPT,
      SecurityEventType.INPUT_VALIDATION_FAILURE,
      SecurityEventType.SESSION_ANOMALY,
      SecurityEventType.FILE_UPLOAD_VIOLATION,
      SecurityEventType.API_ABUSE_DETECTED,
      SecurityEventType.PRIVILEGE_ESCALATION
    ],
    'Network Security': [
      SecurityEventType.NETWORK_INTRUSION_ATTEMPT,
      SecurityEventType.FIREWALL_VIOLATION,
      SecurityEventType.DDOS_ATTACK_DETECTED,
      SecurityEventType.VPN_ACCESS_ANOMALY,
      SecurityEventType.DNS_QUERY_ANOMALY,
      SecurityEventType.NETWORK_SEGMENTATION_BREACH
    ],
    'Compliance Events': [
      SecurityEventType.SOX_ITGC_VIOLATION,
      SecurityEventType.GDPR_DATA_SUBJECT_REQUEST,
      SecurityEventType.CCPA_CONSUMER_REQUEST,
      SecurityEventType.CHANGE_MANAGEMENT_VIOLATION,
      SecurityEventType.SEGREGATION_DUTIES_VIOLATION
    ],
    'Advanced Threats': [
      SecurityEventType.BEHAVIORAL_ANOMALY,
      SecurityEventType.INSIDER_THREAT_INDICATOR,
      SecurityEventType.IOC_DETECTION,
      SecurityEventType.THREAT_INTELLIGENCE_ALERT
    ]
  };

  const handleTypeToggle = (eventType: SecurityEventType) => {
    const isSelected = selectedTypes.includes(eventType);
    if (isSelected) {
      onSelectionChange(selectedTypes.filter(type => type !== eventType));
    } else {
      onSelectionChange([...selectedTypes, eventType]);
    }
  };

  const handleCategoryToggle = (category: string) => {
    const categoryTypes = eventTypeCategories[category as keyof typeof eventTypeCategories];
    const allSelected = categoryTypes.every(type => selectedTypes.includes(type));
    
    if (allSelected) {
      // Deselect all in category
      onSelectionChange(selectedTypes.filter(type => !categoryTypes.includes(type)));
    } else {
      // Select all in category
      const newTypes = [...selectedTypes];
      categoryTypes.forEach(type => {
        if (!newTypes.includes(type)) {
          newTypes.push(type);
        }
      });
      onSelectionChange(newTypes);
    }
  };

  return (
    <div className="event-type-selector">
      <div className="selector-header">
        <h2>Security Event Types</h2>
        <p>Select which types of security events to monitor and log</p>
        <div className="selection-summary">
          <Badge variant="info">
            {selectedTypes.length} of {Object.values(SecurityEventType).length} types selected
          </Badge>
        </div>
      </div>

      {Object.entries(eventTypeCategories).map(([category, types]) => {
        const selectedCount = types.filter(type => selectedTypes.includes(type)).length;
        const allSelected = selectedCount === types.length;

        return (
          <Card key={category} className="category-card">
            <div className="category-header">
              <Checkbox
                checked={allSelected}
                indeterminate={selectedCount > 0 && selectedCount < types.length}
                onChange={() => handleCategoryToggle(category)}
              />
              <h3>{category}</h3>
              <Badge variant={selectedCount > 0 ? 'success' : 'default'}>
                {selectedCount}/{types.length}
              </Badge>
            </div>
            <div className="event-types-grid">
              {types.map(eventType => (
                <div key={eventType} className="event-type-item">
                  <Checkbox
                    checked={selectedTypes.includes(eventType)}
                    onChange={() => handleTypeToggle(eventType)}
                  />
                  <span className="event-type-name">
                    {eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};


/**
 * Retention Policy Editor Component
 */
const RetentionPolicyEditor: React.FC<{
  policies: RetentionPolicy[];
  onPoliciesChange: (policies: RetentionPolicy[]) => void;
}> = ({ policies, onPoliciesChange }) => {
  const [editingPolicy, setEditingPolicy] = useState<RetentionPolicy | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const addPolicy = () => {
    const newPolicy: RetentionPolicy = {
      framework: ComplianceFramework.GDPR,
      retention_days: 365,
      encryption_required: true,
      archive_after_days: 90
    };
    setEditingPolicy(newPolicy);
    setShowAddDialog(true);
  };

  const savePolicy = (policy: RetentionPolicy) => {
    const existingIndex = policies.findIndex(p => p.framework === policy.framework);
    if (existingIndex >= 0) {
      const updatedPolicies = [...policies];
      updatedPolicies[existingIndex] = policy;
      onPoliciesChange(updatedPolicies);
    } else {
      onPoliciesChange([...policies, policy]);
    }
    setEditingPolicy(null);
    setShowAddDialog(false);
  };

  const deletePolicy = (framework: ComplianceFramework) => {
    onPoliciesChange(policies.filter(p => p.framework !== framework));
  };

  return (
    <div className="retention-policy-editor">
      <div className="editor-header">
        <h2>Data Retention Policies</h2>
        <p>Configure compliance-based retention policies for security event data</p>
        <Button variant="primary" onClick={addPolicy}>
          Add Retention Policy
        </Button>
      </div>

      <div className="policies-grid">
        {policies.map(policy => (
          <Card key={policy.framework} className="policy-card">
            <div className="policy-header">
              <h3>{policy.framework}</h3>
              <Badge variant="info">
                {policy.retention_days} days
              </Badge>
            </div>
            <div className="policy-details">
              <div className="detail-row">
                <span className="label">Retention Period:</span>
                <span className="value">{policy.retention_days} days</span>
              </div>
              <div className="detail-row">
                <span className="label">Encryption Required:</span>
                <span className="value">{policy.encryption_required ? 'Yes' : 'No'}</span>
              </div>
              {policy.archive_after_days && (
                <div className="detail-row">
                  <span className="label">Archive After:</span>
                  <span className="value">{policy.archive_after_days} days</span>
                </div>
              )}
            </div>
            <div className="policy-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPolicy(policy);
                  setShowAddDialog(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deletePolicy(policy.framework)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {policies.length === 0 && (
        <div className="empty-state">
          <h3>No Retention Policies Configured</h3>
          <p>Add retention policies to ensure compliance with regulatory requirements.</p>
          <Button variant="primary" onClick={addPolicy}>
            Add First Policy
          </Button>
        </div>
      )}

      {showAddDialog && editingPolicy && (
        <Dialog
          open={showAddDialog}
          onOpenChange={() => {
            setShowAddDialog(false);
            setEditingPolicy(null);
          }}
          title="Configure Retention Policy"
        >
          <div className="dialog-content">
            <div className="form-group">
              <label>Compliance Framework</label>
              <Select
                value={editingPolicy.framework}
                onValueChange={(value) => 
                  setEditingPolicy(prev => ({ ...prev!, framework: value as ComplianceFramework }))
                }
              >
                {Object.values(ComplianceFramework).map(framework => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </Select>
            </div>

            <div className="form-group">
              <label>Retention Period (days)</label>
              <Input
                type="number"
                value={editingPolicy.retention_days}
                onChange={(e) => 
                  setEditingPolicy(prev => ({ ...prev!, retention_days: parseInt(e.target.value) }))
                }
              />
            </div>

            <div className="form-group">
              <label>Archive After (days)</label>
              <Input
                type="number"
                value={editingPolicy.archive_after_days || ''}
                onChange={(e) => 
                  setEditingPolicy(prev => ({ ...prev!, archive_after_days: parseInt(e.target.value) || undefined }))
                }
              />
            </div>

            <div className="form-group">
              <label>
                <Checkbox
                  checked={editingPolicy.encryption_required}
                  onChange={(checked) => 
                    setEditingPolicy(prev => ({ ...prev!, encryption_required: checked }))
                  }
                />
                Encryption Required
              </label>
            </div>

            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => savePolicy(editingPolicy)}>
                Save Policy
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

/**
 * Performance Settings Panel Component
 */
const PerformanceSettingsPanel: React.FC<{
  settings: PerformanceSettings;
  onSettingsChange: (settings: PerformanceSettings) => void;
}> = ({ settings, onSettingsChange }) => {
  const updateSetting = (key: keyof PerformanceSettings, value: Error) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="performance-settings">
      <div className="settings-header">
        <h2>Performance Settings</h2>
        <p>Configure batch processing, queuing, and performance optimization settings</p>
      </div>

      <div className="settings-sections">
        <Card className="settings-section">
          <h3>Batch Processing</h3>
          <div className="form-group">
            <label>
              <Checkbox
                checked={settings.batch_processing_enabled}
                onChange={(checked) => updateSetting('batch_processing_enabled', checked)}
              />
              Enable Batch Processing
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Batch Size</label>
              <Input
                type="number"
                value={settings.batch_size}
                onChange={(e) => updateSetting('batch_size', parseInt(e.target.value))}
                disabled={!settings.batch_processing_enabled}
              />
            </div>
            <div className="form-group">
              <label>Batch Interval (ms)</label>
              <Input
                type="number"
                value={settings.batch_interval_ms}
                onChange={(e) => updateSetting('batch_interval_ms', parseInt(e.target.value))}
                disabled={!settings.batch_processing_enabled}
              />
            </div>
          </div>
        </Card>

        <Card className="settings-section">
          <h3>Queue Management</h3>
          <div className="form-group">
            <label>Queue Size Limit</label>
            <Input
              type="number"
              value={settings.queue_size_limit}
              onChange={(e) => updateSetting('queue_size_limit', parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Rate Limit (per minute)</label>
            <Input
              type="number"
              value={settings.rate_limit_per_minute}
              onChange={(e) => updateSetting('rate_limit_per_minute', parseInt(e.target.value))}
            />
          </div>
        </Card>

        <Card className="settings-section">
          <h3>Circuit Breaker</h3>
          <div className="form-group">
            <label>
              <Checkbox
                checked={settings.circuit_breaker_enabled}
                onChange={(checked) => updateSetting('circuit_breaker_enabled', checked)}
              />
              Enable Circuit Breaker
            </label>
          </div>

          <div className="form-group">
            <label>Failure Threshold</label>
            <Input
              type="number"
              value={settings.circuit_breaker_threshold}
              onChange={(e) => updateSetting('circuit_breaker_threshold', parseInt(e.target.value))}
              disabled={!settings.circuit_breaker_enabled}
            />
          </div>
        </Card>

        <Card className="settings-section">
          <h3>Performance Monitoring</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Current Queue Size</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Processing Rate</span>
              <span className="metric-value">0/min</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Circuit Breaker Status</span>
              <Badge variant={settings.circuit_breaker_enabled ? 'success' : 'secondary'}>
                {settings.circuit_breaker_enabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * Compliance Framework Settings Component
 */
const ComplianceFrameworkSettings: React.FC<{
  settings: ComplianceSettings;
  onSettingsChange: (settings: ComplianceSettings) => void;
}> = ({ settings, onSettingsChange }) => {
  const updateFrameworks = (framework: ComplianceFramework, enabled: boolean) => {
    const updatedFrameworks = enabled
      ? [...settings.frameworks, framework]
      : settings.frameworks.filter(f => f !== framework);
    
    onSettingsChange({ ...settings, frameworks: updatedFrameworks });
  };

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    const updatedRules = [...settings.validation_rules];
    updatedRules[index] = { ...updatedRules[index], ...updates };
    onSettingsChange({ ...settings, validation_rules: updatedRules });
  };

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      framework: ComplianceFramework.GDPR,
      field: 'user_id',
      required: true
    };
    onSettingsChange({
      ...settings,
      validation_rules: [...settings.validation_rules, newRule]
    });
  };

  const removeValidationRule = (index: number) => {
    const updatedRules = settings.validation_rules.filter((_, i) => i !== index);
    onSettingsChange({ ...settings, validation_rules: updatedRules });
  };

  return (
    <div className="compliance-settings">
      <div className="settings-header">
        <h2>Compliance Framework Settings</h2>
        <p>Configure regulatory compliance frameworks and validation rules</p>
      </div>

      <div className="settings-sections">
        <Card className="settings-section">
          <h3>Enabled Frameworks</h3>
          <div className="frameworks-grid">
            {Object.values(ComplianceFramework).map(framework => (
              <label key={framework} className="framework-checkbox">
                <Checkbox
                  checked={settings.frameworks.includes(framework)}
                  onChange={(checked) => updateFrameworks(framework, checked)}
                />
                <div className="framework-info">
                  <span className="framework-name">{framework}</span>
                  <span className="framework-description">
                    {getFrameworkDescription(framework)}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card className="settings-section">
          <h3>General Settings</h3>
          <div className="form-group">
            <label>
              <Checkbox
                checked={settings.automated_reporting}
                onChange={(checked) => 
                  onSettingsChange({ ...settings, automated_reporting: checked })
                }
              />
              Enable Automated Compliance Reporting
            </label>
          </div>

          <div className="form-group">
            <label>
              <Checkbox
                checked={settings.external_notifications}
                onChange={(checked) => 
                  onSettingsChange({ ...settings, external_notifications: checked })
                }
              />
              Enable External Compliance Notifications
            </label>
          </div>
        </Card>

        <Card className="settings-section">
          <h3>Validation Rules</h3>
          <p>Define field validation rules for compliance frameworks</p>
          
          <Button variant="outline" onClick={addValidationRule} className="mb-4">
            Add Validation Rule
          </Button>

          <div className="validation-rules">
            {settings.validation_rules.map((rule, index) => (
              <div key={index} className="validation-rule">
                <div className="rule-config">
                  <Select
                    value={rule.framework}
                    onValueChange={(value) => 
                      updateValidationRule(index, { framework: value as ComplianceFramework })
                    }
                  >
                    {Object.values(ComplianceFramework).map(framework => (
                      <option key={framework} value={framework}>
                        {framework}
                      </option>
                    ))}
                  </Select>

                  <Input
                    value={rule.field}
                    onChange={(e) => updateValidationRule(index, { field: e.target.value })}
                    placeholder="Field name"
                  />

                  <label>
                    <Checkbox
                      checked={rule.required}
                      onChange={(checked) => updateValidationRule(index, { required: checked })}
                    />
                    Required
                  </label>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeValidationRule(index)}
                  >
                    Remove
                  </Button>
                </div>

                {rule.pattern && (
                  <Input
                    value={rule.pattern}
                    onChange={(e) => updateValidationRule(index, { pattern: e.target.value })}
                    placeholder="Validation pattern (regex)"
                  />
                )}
              </div>
            ))}
          </div>

          {settings.validation_rules.length === 0 && (
            <div className="empty-validation-rules">
              <p>No validation rules configured. Add rules to enforce compliance requirements.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Helper function for framework descriptions
function getFrameworkDescription(framework: ComplianceFramework): string {
  const descriptions: Record<ComplianceFramework, string> = {
    [ComplianceFramework.GDPR]: 'General Data Protection Regulation (EU)',
    [ComplianceFramework.CCPA]: 'California Consumer Privacy Act',
    [ComplianceFramework.SOX]: 'Sarbanes-Oxley Act',
    [ComplianceFramework.HIPAA]: 'Health Insurance Portability and Accountability Act',
    [ComplianceFramework.ISO27001]: 'ISO 27001 Information Security Management',
    [ComplianceFramework.PCI_DSS]: 'Payment Card Industry Data Security Standard',
    [ComplianceFramework.NIST]: 'NIST Cybersecurity Framework',
    [ComplianceFramework.FERPA]: 'Family Educational Rights and Privacy Act',
    [ComplianceFramework.GLBA]: 'Gramm-Leach-Bliley Act',
    [ComplianceFramework.FEDRAMP]: 'Federal Risk and Authorization Management Program'
  };
  return descriptions[framework] || framework;
}

// Utility functions (would be replaced with actual API calls)
async function fetchSecurityLoggingConfig(): Promise<SecurityLoggingConfig> {
  // Simulate API call
  return {
    enabled: true,
    destinations: [
      {
        id: '1',
        name: 'Primary Database',
        type: 'database',
        endpoint: 'postgresql://localhost:5432/security_logs',
        enabled: true,
        format: 'json',
        batch_size: 100,
        flush_interval: 30000
      },
      {
        id: '2',
        name: 'SIEM Integration',
        type: 'siem',
        endpoint: 'https://siem.company.com/api/events',
        enabled: true,
        format: 'cef',
        credentials: { api_key: '***' }
      }
    ],
    event_types: [
      SecurityEventType.AUTHENTICATION_FAILURE,
      SecurityEventType.CODE_INJECTION_ATTEMPT,
      SecurityEventType.NETWORK_INTRUSION_ATTEMPT
    ],
    alert_rules: [],
    retention_policies: [],
    performance_settings: {
      batch_processing_enabled: true,
      batch_size: 100,
      batch_interval_ms: 60000,
      queue_size_limit: 10000,
      circuit_breaker_enabled: true,
      circuit_breaker_threshold: 100,
      rate_limit_per_minute: 1000
    },
    compliance_settings: {
      frameworks: [ComplianceFramework.SOX, ComplianceFramework.GDPR],
      automated_reporting: true,
      external_notifications: true,
      validation_rules: []
    }
  };
}

async function saveSecurityLoggingConfig(config: SecurityLoggingConfig): Promise<void> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Saved configuration:', config);
}

async function testSecurityLoggingConfig(_config: SecurityLoggingConfig): Promise<unknown> {
  // Simulate configuration test
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    success: true,
    tests: [
      { name: 'Database Connection', status: 'pass' },
      { name: 'SIEM Integration', status: 'pass' },
      { name: 'Event Processing', status: 'pass' }
    ]
  };
}

function validateConfiguration(config: SecurityLoggingConfig): string[] {
  const errors: string[] = [];

  if (config.destinations.length === 0) {
    errors.push('At least one logging destination must be configured');
  }

  if (config.event_types.length === 0) {
    errors.push('At least one event type must be selected for monitoring');
  }

  // Add more validation rules as needed

  return errors;
}

export default SecurityEventLoggingConfigPanel;