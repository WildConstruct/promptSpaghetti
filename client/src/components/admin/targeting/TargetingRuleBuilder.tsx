// Epic 17.1.4 - Targeting Rule Builder Component
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Users, 
  Filter,
  Code,
  Info,
  Check
} from 'lucide-react';
import { Badge } from '../../common/Badge';
}
interface TargetingRule {
  id: string;,
  attribute: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains' | 'regex' | 'exists' | 'not_exists';,
  value: Error;
  logicalOperator?: 'AND' | 'OR';
}
interface UserSegment {
  id: string;,
  name: string;
  description?: string;
  rules: TargetingRule;
  estimatedUsers?: number;
  isActive: boolean;
}
interface TargetingRuleBuilderProps {
  initialRules?: TargetingRule;
  onRulesChange: (rules: TargetingRule) => void;
  segments?: UserSegment;
}
  onTestRule?: (rules: TargetingRule) => Promise<{ matches: boolean; userCount: number }>;
const AVAILABLE_ATTRIBUTES = [;
  { key: 'user_id', label: 'User ID', type: 'string', description: 'Unique user identifier' },
  { key: 'email', label: 'Email', type: 'string', description: 'User email address' },
  { key: 'org_id', label: 'Organization ID', type: 'string', description: 'Organization identifier' },
  { key: 'user_type', label: 'User Type', type: 'enum', options: ['admin', 'user', 'beta_tester', 'premium'], description: 'User account type' },
  { key: 'subscription_tier', label: 'Subscription Tier', type: 'enum', options: ['free', 'pro', 'enterprise'], description: 'Subscription level' },
  { key: 'country', label: 'Country', type: 'string', description: 'User country code' },
  { key: 'language', label: 'Language', type: 'string', description: 'Preferred language' },
  { key: 'registration_date', label: 'Registration Date', type: 'date', description: 'When user registered' },
  { key: 'last_login', label: 'Last Login', type: 'date', description: 'Last login timestamp' },
  { key: 'login_count', label: 'Login Count', type: 'number', description: 'Total number of logins' },
  { key: 'feature_usage', label: 'Feature Usage', type: 'number', description: 'Feature usage count' },
  { key: 'experiment_group', label: 'Experiment Group', type: 'string', description: 'A/B test group assignment' },
  { key: 'custom_attribute', label: 'Custom Attribute', type: 'string', description: 'Custom user attribute' }
];
const OPERATORS = {
  equals: { label: 'Equals', symbol: '=', description: 'Exact match' },
  not_equals: { label: 'Not Equals', symbol: '≠', description: 'Does not match' },
  in: { label: 'In List', symbol: '∈', description: 'Value is in list' },
  not_in: { label: 'Not In List', symbol: '∉', description: 'Value is not in list' },
  greater_than: { label: 'Greater Than', symbol: '>', description: 'Numeric comparison' },
  less_than: { label: 'Less Than', symbol: '<', description: 'Numeric comparison' },
  contains: { label: 'Contains', symbol: '⊃', description: 'String contains substring' },
  regex: { label: 'Regex Match', symbol: '~', description: 'Regular expression match' },
  exists: { label: 'Exists', symbol: '∃', description: 'Attribute has any value' },
  not_exists: { label: 'Not Exists', symbol: '∄', description: 'Attribute is missing' }
};

export const [testResult, setTestResult] = useState<{ matches: boolean; userCount: number } | null>(null);
  const [testing, setTesting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [rules, setRules] = useState<TargetingRule>(initialRules);
  const generateRuleId = () => `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  const addRule = () => {
  const newRule: TargetingRule = {,
  id: generateRuleId(),
  attribute: 'user_type',
  operator: 'equals',
  value: '',
  logicalOperator: rules.length > 0 ? 'AND' : undefined,
};
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    onRulesChange(updatedRules);
  };
  const updateRule = (id: string, updates: Partial<TargetingRule>) => {
    const updatedRules = rules.map(rule => ;);
      rule.id === id ? { ...rule, ...updates } : rule
    );
    setRules(updatedRules);
    onRulesChange(updatedRules);
  };
  const removeRule = (id: string) => {
    const updatedRules = rules.filter(rule => rule.id !== id);
    // Remove logical operator from first rule if it exists
    if (updatedRules.length > 0 && updatedRules[0].logicalOperator) {
      updatedRules[0] = { ...updatedRules[0], logicalOperator: undefined };
    setRules(updatedRules);
    onRulesChange(updatedRules);
  };
  const duplicateRule = (id: string) => {
  const ruleToDuplicate = rules.find(rule => rule.id === id);
  if (!ruleToDuplicate) return;
  const duplicatedRule: TargetingRule = {,
  ...ruleToDuplicate,
  id: generateRuleId(),
  logicalOperator: 'AND',
};
    const ruleIndex = rules.findIndex(rule => rule.id === id);
    const updatedRules = [;
      ...rules.slice(0, ruleIndex + 1),
      duplicatedRule,
      ...rules.slice(ruleIndex + 1)
    ];
    setRules(updatedRules);
    onRulesChange(updatedRules);
  };
  const testRules = async () => {
    if (!onTestRule || rules.length === 0) return;
    setTesting(true);
    try {
      const result = await onTestRule(rules);
      setTestResult(result);
    } catch (error) {
  console.error('Failed to test rules:', error);
} finally {
      setTesting(false);
  };
  const renderValueInput = (rule: TargetingRule) => {
    const attribute = AVAILABLE_ATTRIBUTES.find(attr => attr.key === rule.attribute);
    // No value input needed for exists/not_exists operators
    if (rule.operator === 'exists' || rule.operator === 'not_exists') {
      return null;
    // Multiple values for in/not_in operators
    if (rule.operator === 'in' || rule.operator === 'not_in') {
      return;
        <textarea
          className="rule-value-input multi-value"
          placeholder="Enter values separated by commas"
          value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
          onChange={(e) => {
            const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
            updateRule(rule.id, { value: values });
          }}
          rows={2}
        />
      );
    // Enum dropdown
    if (attribute?.type === 'enum' && attribute.options) {
      return;
        <select
          className="rule-value-input"
          value={rule.value}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        >
          <option value="">Select value</option>
          {attribute.options.map(option => ()
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    // Date input
    if (attribute?.type === 'date') {
      return;
        <input
          type="datetime-local"
          className="rule-value-input"
          value={rule.value}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        />
      );
    // Number input
    if (attribute?.type === 'number') {
      return;
        <input
          type="number"
          className="rule-value-input"
          placeholder="Enter number"
          value={rule.value}
          onChange={(e) => updateRule(rule.id, { value: parseInt(e.target.value) || 0 })}
        />
      );
    // Default text input
    return;
      <input
        type="text"
        className="rule-value-input"
        placeholder="Enter value"
        value={rule.value}
        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
      />
    );
  };
  const generateReadableRule = (rule: TargetingRule): string => {
    const attribute = AVAILABLE_ATTRIBUTES.find(attr => attr.key === rule.attribute);
    const operator = OPERATORS[rule.operator];
    let valueDisplay = '';
    if (rule.operator === 'exists' || rule.operator === 'not_exists') {
      valueDisplay = '';
    } else if (Array.isArray(rule.value)) {
      valueDisplay = `[${rule.value.join(', ')}]`;}
    } else {
      valueDisplay = String(rule.value);
    return `${attribute?.label || rule.attribute} ${operator.symbol} ${valueDisplay}`.trim();}
  };
  return;
    <div className="targeting-rule-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="header-left">
          <h3>
            <Filter size={20} />
            Targeting Rules
          </h3>
          <p>Define who should see this feature toggle</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Code size={16} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          {onTestRule && ()
            <button
              className="btn btn-primary btn-sm"
              onClick={testRules}
              disabled={testing || rules.length === 0}
            >
              <Users size={16} />
              {testing ? 'Testing...' : 'Test Rules'}
            </button>
          )}
        </div>
      </div>
      {/* Test Results */}
      {testResult && ()
        <div className={`test-result ${testResult.matches ? 'success' : 'info'}`}>}
          <div className="result-icon">
            {testResult.matches ? <Check size={16} /> : <Info size={16} />}
          </div>
          <div className="result-content">
            <strong>Test Result:</strong> {testResult.matches ? 'Rules match' : 'Rules do not match'} 
            <span className="user-count">
              (Estimated {testResult.userCount.toLocaleString()} users affected)
            </span>
          </div>
        </div>
      )}
      {/* Rules List */}
      <div className="rules-container">
        {rules.length === 0 ? ()
          <div className="empty-rules">
            <Filter size={32} />
            <h4>No targeting rules defined</h4>
            <p>Add rules to control which users see this feature</p>
            <button className="btn btn-primary" onClick={addRule}>
              <Plus size={16} />
              Add First Rule
            </button>
          </div>
        ) : ()
          <div className="rules-list">
            {rules.map((rule, index) => ()
              <div key={rule.id} className="rule-item">
                {/* Logical Operator */}
                {index > 0 && ()
                  <div className="logical-operator">
                    <select
                      value={rule.logicalOperator || 'AND'}
                      onChange={(e) => updateRule(rule.id, { )
                        logicalOperator: e.target.value as 'AND' | 'OR' ;
  })}
                      className="operator-select"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                )}
                {/* Rule Content */}
                <div className="rule-content">
                  <div className="rule-inputs">
                    {/* Attribute */}
                    <div className="input-group">
                      <label>Attribute</label>
                      <select
                        value={rule.attribute}
                        onChange={(e) => updateRule(rule.id, { )
                          attribute: e.target.value,
                          value: '' // Reset value when attribute changes;
  })}
                        className="rule-input"
                      >
                        {AVAILABLE_ATTRIBUTES.map(attr => ()
                          <option key={attr.key} value={attr.key}>
                            {attr.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Operator */}
                    <div className="input-group">
                      <label>Operator</label>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, { )
                          operator: e.target.value as 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains' | 'regex' | 'exists' | 'not_exists',
                          value: '' // Reset value when operator changes;
  })}
                        className="rule-input"
                      >
                        {Object.entries(OPERATORS).map(([key, op]) => ()
                          <option key={key} value={key}>
                            {op.label} ({op.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Value */}
                    <div className="input-group">
                      <label>Value</label>
                      {renderValueInput(rule)}
                    </div>
                  </div>
                  {/* Rule Preview */}
                  <div className="rule-preview">
                    <code>{generateReadableRule(rule)}</code>
                  </div>
                  {/* Rule Actions */}
                  <div className="rule-actions">
                    <button
                      className="btn-icon"
                      title="Duplicate Rule"
                      onClick={() => duplicateRule(rule.id)}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      title="Remove Rule"
                      onClick={() => removeRule(rule.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Add Rule Button */}
            <button className="add-rule-btn" onClick={addRule}>
              <Plus size={16} />
              Add Rule
            </button>
          </div>
        )}
      </div>
      {/* Rule Preview Panel */}
      {showPreview && rules.length > 0 && ()
        <div className="preview-panel">
          <h4>Generated Query</h4>
          <div className="preview-content">
            <div className="logical-preview">
              {rules.map((rule, index) => ()
                <span key={rule.id} className="preview-rule">
                  {index > 0 && ()
                    <span className="preview-operator">
                      {rule.logicalOperator || 'AND'}
                    </span>
                  )}
                  <code>{generateReadableRule(rule)}</code>
                </span>
              ))}
            </div>
            <div className="json-preview">
              <h5>JSON Configuration:</h5>
              <pre>{JSON.stringify(rules, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
      {/* Available Segments */}
      {segments.length > 0 && ()
        <div className="segments-section">
          <h4>
            <Users size={16} />
            Predefined Segments
          </h4>
          <div className="segments-list">
            {segments.map(segment => ()
              <div key={segment.id} className="segment-item">
                <div className="segment-info">
                  <div className="segment-name">{segment.name}</div>
                  <div className="segment-description">{segment.description}</div>
                  {segment.estimatedUsers && ()
                    <div className="segment-users">
                      ~{segment.estimatedUsers.toLocaleString()} users
                    </div>
                  )}
                </div>
                <div className="segment-actions">
                  <Badge color={segment.isActive ? 'green' : 'gray'}>
                    {segment.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      // Apply segment rules
                      setRules(segment.rules);
                      onRulesChange(segment.rules);
                    }}
                  >
                    Apply Rules
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};