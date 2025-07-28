/**
 * Alert Rule Builder Component
 * 
 * Advanced visual interface for creating and managing security alert rules.
 * Provides drag-and-drop rule building, condition chaining, and action configuration.
 */
import React, { useState } from 'react';
import {
  SecurityEventType,
  SecurityEventSeverity,
  ComplianceFramework
} from '../../security/SecurityEventLoggingPolicies';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import './AlertRuleBuilder.css';
interface AlertRule {
  id: string;,
  name: string;
  description: string;,
  enabled: boolean;
  event_types: SecurityEventType;,
  severity_threshold: SecurityEventSeverity;
  conditions: AlertCondition;,
  actions: AlertAction;
  notification_channels: NotificationChannel;
  escalation_config?: EscalationConfig;
  created_at: Date;,
  updated_at: Date;
interface AlertCondition {
  id: string;,
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex' | 'in' | 'not_in';,
  value: Error;
  logic_operator?: 'and' | 'or';
interface AlertAction {
  id: string;,
  type: 'notification' | 'containment' | 'escalation' | 'logging' | 'webhook';
  name: string;,
  config: Record<string, any>;
  enabled: boolean;
  delay_seconds?: number;
interface NotificationChannel {
  id: string;,
  name: string;
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'dashboard';,
  config: Record<string, any>;
  enabled: boolean;
interface EscalationConfig {
  enabled: boolean;,
  escalation_delay_minutes: number;
  escalation_targets: string;,
  max_escalations: number;
const AVAILABLE_FIELDS = [;
  { value: 'event_type', label: 'Event Type', type: 'enum' },
  { value: 'severity', label: 'Severity', type: 'enum' },
  { value: 'source_ip', label: 'Source IP', type: 'string' },
  { value: 'user_id', label: 'User ID', type: 'string' },
  { value: 'threat_level', label: 'Threat Level', type: 'number' },
  { value: 'confidence_score', label: 'Confidence Score', type: 'number' },
  { value: 'system_component', label: 'System Component', type: 'string' },
  { value: 'tags', label: 'Tags', type: 'array' },
  { value: 'request_count', label: 'Request Count', type: 'number' },
  { value: 'failed_attempts', label: 'Failed Attempts', type: 'number' },
  { value: 'data_volume', label: 'Data Volume', type: 'number' },
  { value: 'response_time', label: 'Response Time', type: 'number' }
];
const OPERATORS_BY_TYPE = {
  string: ['eq', 'ne', 'contains', 'regex'],
  number: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte'],
  enum: ['eq', 'ne', 'in', 'not_in'],
  array: ['contains', 'in', 'not_in'],
};
const ACTION_TYPES = [;
  {
  type: 'notification',
  name: 'Send Notification',
  description: 'Send alert notification to configured channels',
  icon: '📢',
}
  {
  type: 'containment',
  name: 'Automated Containment',
  description: 'Automatically block IPs, lock accounts, or isolate systems',
  icon: '🛡️',
}
  {
  type: 'escalation',
  name: 'Escalate Alert',
  description: 'Escalate to security team or management',
  icon: '🚨',
}
  {
  type: 'logging',
  name: 'Enhanced Logging',
  description: 'Capture additional forensic data',
  icon: '📝',
}
  {
  type: 'webhook',
  name: 'Webhook Call',
  description: 'Call external webhook with alert data',
  icon: '🔗'];
  /**
  * Main Alert Rule Builder Component
  */
  export const AlertRuleBuilder: React.FC<{,
  alertRules: AlertRule;,
  onRulesChange: (rules: AlertRule) => void;
}> = ({ alertRules, onRulesChange }) => {
  const [_____selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const handleCreateRule = () => {
  const newRule: AlertRule = {,
  id: crypto.randomUUID(),
  name: 'New Alert Rule',
  description: '',
  enabled: true,
  event_types: [],
  severity_threshold: SecurityEventSeverity.MEDIUM,
  conditions: [],
  actions: [],
  notification_channels: [],
  created_at: new Date(),
  updated_at: new Date(),
};
    setEditingRule(newRule);
    setShowCreateDialog(true);
  };
  const handleSaveRule = (rule: AlertRule) => {
    const isNew = !alertRules.find(r => r.id === rule.id);
    const updatedRule = { ...rule, updated_at: new Date() };
    if (isNew) {
      onRulesChange([...alertRules, updatedRule]);
    } else {
  onRulesChange(alertRules.map(r => r.id === rule.id ? updatedRule : r));
  setEditingRule(null);
  setShowCreateDialog(false);
};
  const handleDeleteRule = (ruleId: string) => {
    onRulesChange(alertRules.filter(r => r.id !== ruleId));
    setShowDeleteDialog(null);
  };
  const handleToggleRule = (ruleId: string) => {
    onRulesChange();
      alertRules.map(rule => )
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled, updated_at: new Date() }
          : rule
    );
  };
  return;
    <div className="alert-rule-builder">
      <div className="builder-header">
        <div className="header-content">
          <h2>Security Alert Rules</h2>
          <p>Create and manage automated security alert rules with custom conditions and actions</p>
        </div>
        <Button variant="primary" onClick={handleCreateRule}>
          Create Alert Rule
        </Button>
      </div>
      <div className="rules-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <span className="stat-value">{alertRules.length}</span>
            <span className="stat-label">Total Rules</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{alertRules.filter(r => r.enabled).length}</span>
            <span className="stat-label">Active Rules</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{alertRules.reduce((sum, r) => sum + r.actions.length, 0)}</span>
            <span className="stat-label">Total Actions</span>
          </div>
        </div>
      </div>
      <div className="rules-grid">
        {alertRules.map(rule => ()
          <RuleCard
            key={rule.id}
            rule={rule}
            onEdit={() => {
              setEditingRule({ ...rule });
              setShowCreateDialog(true);
            }}
            onToggle={() => handleToggleRule(rule.id)}
            onDelete={() => setShowDeleteDialog(rule.id)}
            onSelect={() => setSelectedRule(rule)}
          />
        ))}
      </div>
      {alertRules.length === 0 && ()
        <div className="empty-state">
          <div className="empty-icon">🚨</div>
          <h3>No Alert Rules Configured</h3>
          <p>Create your first security alert rule to start automated threat detection and response.</p>
          <Button variant="primary" onClick={handleCreateRule}>
            Create First Rule
          </Button>
        </div>
      )}
      {/* Create/Edit Rule Dialog */}
      {showCreateDialog && editingRule && ()
        <RuleEditDialog
          rule={editingRule}
          open={showCreateDialog}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingRule(null);
          }}
          onSave={handleSaveRule}
        />
      )}
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && ()
        <Dialog
          open={!!showDeleteDialog}
          onOpenChange={() => setShowDeleteDialog(null)}
          title="Delete Alert Rule"
          description="Are you sure you want to delete this alert rule? This action cannot be undone."
        >
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteRule(showDeleteDialog)}
            >
              Delete Rule
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};
/**
 * Individual Alert Rule Card Component
 */
const RuleCard: React.FC<{,
  rule: AlertRule;
  onEdit: () => void;,
  onToggle: () => void;
  onDelete: () => void;,
  onSelect: () => void;
}> = ({ rule, onEdit, onToggle, onDelete, onSelect }) => {
  return;
    <Card className={`rule-card ${!rule.enabled ? 'disabled' : ''}`}>}
      <div className="rule-header">
        <div className="rule-info">
          <h3 className="rule-name">{rule.name}</h3>
          <p className="rule-description">{rule.description || 'No description'}</p>
        </div>
        <div className="rule-status">
          <Badge variant={rule.enabled ? 'success' : 'secondary'}>
            {rule.enabled ? 'Active' : 'Disabled'}
          </Badge>
        </div>
      </div>
      <div className="rule-details">
        <div className="detail-row">
          <span className="detail-label">Event Types:</span>
          <span className="detail-value">
            {rule.event_types.length > 0 
              ? `${rule.event_types.length} types`}
              : 'All types'
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Severity:</span>
          <span className="detail-value">
            {rule.severity_threshold.toUpperCase()} and above
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Conditions:</span>
          <span className="detail-value">{rule.conditions.length} conditions</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Actions:</span>
          <span className="detail-value">{rule.actions.length} actions</span>
        </div>
      </div>
      <div className="rule-actions">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button 
          variant={rule.enabled ? 'outline' : 'secondary'} 
          size="sm" 
          onClick={onToggle}
        >
          {rule.enabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
};
/**
 * Rule Edit Dialog Component
 */
const RuleEditDialog: React.FC<{,
  rule: AlertRule;
  open: boolean;,
  onClose: () => void;
  onSave: (rule: AlertRule) => void;
}> = ({ rule, open, onClose, onSave }) => {
  const [editedRule, setEditedRule] = useState<AlertRule>({ ...rule });
  const [activeTab, setActiveTab] = useState<'basic' | 'conditions' | 'actions' | 'notifications'>('basic');
  const [errors, setErrors] = useState<string>([]);
  const handleSave = () => {
    const validationErrors = validateRule(editedRule);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    setErrors([]);
    onSave(editedRule);
  };
  const updateRule = (updates: Partial<AlertRule>) => {
    setEditedRule(prev => ({ ...prev, ...updates }));
  };
  return;
    <Dialog
      open={open}
      onOpenChange={onClose}
      title={rule.id ? 'Edit Alert Rule' : 'Create Alert Rule'}
      className="rule-edit-dialog"
    >
      <div className="dialog-content">
        {errors.length > 0 && ()
          <Alert variant="error" className="mb-4">
            <strong>Validation Errors:</strong>
            <ul>
              {errors.map((error, index) => ()
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
        <div className="edit-tabs">
          <div className="tabs-list">
            {['basic', 'conditions', 'actions', 'notifications'].map(tab => ()
              <button
                key={tab}
                className={`tab-trigger ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === 'basic' && ()
              <BasicRuleSettings rule={editedRule} onUpdate={updateRule} />
            )}
            {activeTab === 'conditions' && ()
              <ConditionBuilder rule={editedRule} onUpdate={updateRule} />
            )}
            {activeTab === 'actions' && ()
              <ActionBuilder rule={editedRule} onUpdate={updateRule} />
            )}
            {activeTab === 'notifications' && ()
              <NotificationSettings rule={editedRule} onUpdate={updateRule} />
            )}
          </div>
        </div>
        <div className="dialog-actions">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Rule
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
/**
 * Basic Rule Settings Tab
 */
const BasicRuleSettings: React.FC<{,
  rule: AlertRule;
  onUpdate: (updates: Partial<AlertRule>) => void;
}> = ({ rule, onUpdate }) => {
  return;
    <div className="basic-settings">
      <div className="form-group">
        <label htmlFor="ruleName">Rule Name</label>
        <Input
          id="ruleName"
          value={rule.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Enter rule name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="ruleDescription">Description</label>
        <Textarea
          id="ruleDescription"
          value={rule.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe what this rule detects and why it's important"
          rows={3}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="severityThreshold">Minimum Severity</label>
          <Select
            id="severityThreshold"
            value={rule.severity_threshold}
            onValueChange={(value) => onUpdate({ severity_threshold: value as SecurityEventSeverity })}
          >
            {Object.values(SecurityEventSeverity).map(severity => ()
              <option key={severity} value={severity}>
                {severity.toUpperCase()}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-group">
          <label>
            <Checkbox
              checked={rule.enabled}
              onChange={(checked) => onUpdate({ enabled: checked })}
            />
            Enable this rule
          </label>
        </div>
      </div>
      <div className="form-group">
        <label>Event Types to Monitor</label>
        <div className="event-types-selector">
          {Object.values(SecurityEventType).map(eventType => ()
            <label key={eventType} className="event-type-checkbox">
              <Checkbox
                checked={rule.event_types.includes(eventType)}
                onChange={(checked) => {
                  const updatedTypes = checked;
                    ? [...rule.event_types, eventType]
                    : rule.event_types.filter(t => t !== eventType);
                  onUpdate({ event_types: updatedTypes });
                }}
              />
              {eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
/**
 * Condition Builder Tab
 */
const ConditionBuilder: React.FC<{,
  rule: AlertRule;
  onUpdate: (updates: Partial<AlertRule>) => void;
}> = ({ rule, onUpdate }) => {
  const addCondition = () => {
  const newCondition: AlertCondition = {,
  id: crypto.randomUUID(),
  field: 'threat_level',
  operator: 'gte',
  value: 5,
  logic_operator: rule.conditions.length > 0 ? 'and' : undefined,
};
    onUpdate({ conditions: [...rule.conditions, newCondition] });
  };
  const updateCondition = (id: string, updates: Partial<AlertCondition>) => {
    const updatedConditions = rule.conditions.map(condition =>;);
      condition.id === id ? { ...condition, ...updates } : condition
    );
    onUpdate({ conditions: updatedConditions });
  };
  const removeCondition = (id: string) => {
    onUpdate({ conditions: rule.conditions.filter(c => c.id !== id) });
  };
  return;
    <div className="condition-builder">
      <div className="builder-header">
        <p>Define conditions that must be met to trigger this alert rule.</p>
        <Button variant="outline" onClick={addCondition}>
          Add Condition
        </Button>
      </div>
      {rule.conditions.map((condition, index) => ()
        <div key={condition.id} className="condition-item">
          {index > 0 && ()
            <div className="logic-operator">
              <Select
                value={condition.logic_operator || 'and'}
                onValueChange={(value) => updateCondition(condition.id, { logic_operator: value as 'and' | 'or' })}
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </Select>
            </div>
          )}
          <div className="condition-config">
            <Select
              value={condition.field}
              onValueChange={(value) => updateCondition(condition.id, { field: value })}
            >
              {AVAILABLE_FIELDS.map(field => ()
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </Select>
            <Select
              value={condition.operator}
              onValueChange={(value) => updateCondition(condition.id, { operator: value as any })}
            >
              {getOperatorsForField(condition.field).map(op => ()
                <option key={op} value={op}>
                  {getOperatorLabel(op)}
                </option>
              ))}
            </Select>
            <Input
              value={condition.value}
              onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
              placeholder="Value"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeCondition(condition.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      {rule.conditions.length === 0 && ()
        <div className="empty-conditions">
          <p>No conditions defined. Add conditions to specify when this rule should trigger.</p>
        </div>
      )}
    </div>
  );
};
/**
 * Action Builder Tab
 */
const ActionBuilder: React.FC<{,
  rule: AlertRule;
  onUpdate: (updates: Partial<AlertRule>) => void;
}> = ({ rule, onUpdate }) => {
  const addAction = (actionType: string) => {
    const newAction: AlertAction = {,
  id: crypto.randomUUID(),
      type: actionType as any,
      name: ACTION_TYPES.find(t => t.type === actionType)?.name || actionType,
      config: {},
      enabled: true;
  };
    onUpdate({ actions: [...rule.actions, newAction] });
  };
  const updateAction = (id: string, updates: Partial<AlertAction>) => {
    const updatedActions = rule.actions.map(action =>;);
      action.id === id ? { ...action, ...updates } : action
    );
    onUpdate({ actions: updatedActions });
  };
  const removeAction = (id: string) => {
    onUpdate({ actions: rule.actions.filter(a => a.id !== id) });
  };
  return;
    <div className="action-builder">
      <div className="builder-header">
        <p>Configure actions to take when this alert rule is triggered.</p>
        <div className="action-types">
          {ACTION_TYPES.map(actionType => ()
            <Button
              key={actionType.type}
              variant="outline"
              size="sm"
              onClick={() => addAction(actionType.type)}
            >
              {actionType.icon} {actionType.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="actions-list">
        {rule.actions.map(action => ()
          <Card key={action.id} className="action-card">
            <div className="action-header">
              <div className="action-info">
                <span className="action-icon">
                  {ACTION_TYPES.find(t => t.type === action.type)?.icon}
                </span>
                <span className="action-name">{action.name}</span>
                <Badge variant={action.enabled ? 'success' : 'secondary'}>
                  {action.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="action-controls">
                <Checkbox
                  checked={action.enabled}
                  onChange={(checked) => updateAction(action.id, { enabled: checked })}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAction(action.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
            <div className="action-config">
              <ActionConfigForm action={action} onUpdate={(updates) => updateAction(action.id, updates)} />
            </div>
          </Card>
        ))}
      </div>
      {rule.actions.length === 0 && ()
        <div className="empty-actions">
          <p>No actions defined. Add actions to specify what should happen when this rule triggers.</p>
        </div>
      )}
    </div>
  );
};
/**
 * Action Configuration Form
 */
const ActionConfigForm: React.FC<{,
  action: AlertAction;
  onUpdate: (updates: Partial<AlertAction>) => void;
}> = ({ action, onUpdate }) => {
  const updateConfig = (key: string, value: Error) => {
    onUpdate({)
  config: { ...action.config, [key]: value }
    });
  };
  switch (action.type) {
  case 'notification':
    return;
      <div className="config-form">
        <div className="form-group">
          <label>Message Template</label>
          <Textarea
            value={action.config.message_template || ''}
            onChange={(e) => updateConfig('message_template', e.target.value)}
            placeholder="Alert: {event_type} detected from {source_ip}"
          />
        </div>
      </div>
    );
  case 'containment':
    return;
      <div className="config-form">
        <div className="form-group">
          <label>Containment Actions</label>
          <div className="checkbox-group">
            <label>
              <Checkbox
                checked={action.config.block_ip || false}
                onChange={(checked) => updateConfig('block_ip', checked)}
              />
                Block Source IP
            </label>
            <label>
              <Checkbox
                checked={action.config.lock_account || false}
                onChange={(checked) => updateConfig('lock_account', checked)}
              />
                Lock User Account
            </label>
            <label>
              <Checkbox
                checked={action.config.isolate_system || false}
                onChange={(checked) => updateConfig('isolate_system', checked)}
              />
                Isolate System
            </label>
          </div>
        </div>
      </div>
    );
  case 'webhook':
    return;
      <div className="config-form">
        <div className="form-group">
          <label>Webhook URL</label>
          <Input
            value={action.config.webhook_url || ''}
            onChange={(e) => updateConfig('webhook_url', e.target.value)}
            placeholder="https://api.example.com/alerts"
          />
        </div>
        <div className="form-group">
          <label>HTTP Method</label>
          <Select
            value={action.config.method || 'POST'}
            onValueChange={(value) => updateConfig('method', value)}
          >
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </Select>
        </div>
      </div>
    );
  default:
    return null;
};
/**
 * Notification Settings Tab
 */
const NotificationSettings: React.FC<{,
  rule: AlertRule;
  onUpdate: (updates: Partial<AlertRule>) => void;
}> = ({ rule, onUpdate }) => {
  return;
    <div className="notification-settings">
      <p>Configure notification channels for this alert rule.</p>
      <div className="placeholder-content">
        <p>Notification channel configuration will be implemented based on the existing notification system.</p>
      </div>
    </div>
  );
};

// Utility functions
function validateRule(rule: AlertRule): string {
  const errors: string = [];
  if (!rule.name.trim()) {
  errors.push('Rule name is required');
  if (rule.conditions.length === 0) {
  errors.push('At least one condition must be defined');
  if (rule.actions.length === 0) {
  errors.push('At least one action must be defined');
  return errors;
  function getOperatorsForField(field: string): string {,
  const fieldType = AVAILABLE_FIELDS.find(f => f.value === field)?.type || 'string';
  return OPERATORS_BY_TYPE[fieldType as keyof typeof OPERATORS_BY_TYPE] || [];
  function getOperatorLabel(operator: string): string {,
  const labels: Record<string, string> = {,
  eq: 'equals',
  ne: 'not equals',
  gt: 'greater than',
  lt: 'less than',
  gte: 'greater than or equal',
  lte: 'less than or equal',
  contains: 'contains',
  regex: 'matches regex',
  in: 'is in',
  not_in: 'is not in',
};
  return labels[operator] || operator;

export default AlertRuleBuilder;