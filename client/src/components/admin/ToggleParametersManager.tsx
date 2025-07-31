/**
 * Toggle Parameters Manager - Epic 17
 * Task: E17-1753114396772-E6C1FD - Create toggle parameters
 * 
 * Advanced parameter management for different feature toggle types.
 * Handles configuration of percentage rollouts, multivariate variants, 
 * scheduled activation, and segmentation rules.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Percent,
  Calendar,
  Target,
  Plus,
  Minus,
  Clock,
  Filter,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Play,
  Pause
} from 'lucide-react';
import { Badge } from '../common/Badge';
import './ToggleParametersManager.css';

export enum ToggleType {
  BOOLEAN = 'boolean',
  PERCENTAGE_ROLLOUT = 'percentage_rollout',
  MULTIVARIATE = 'multivariate',
  SCHEDULED = 'scheduled',
  SEGMENTATION = 'segmentation'
  interface ToggleParametersProps {
  toggleId: string;,
  toggleType: ToggleType;
  currentValue: Record<string, unknown>;
  onParametersChange: (value: Record<string, unknown>) => void;
  onSave?: () => void;
  readonly?: boolean;
  interface PercentageRolloutParams {
  percentage: number;
  saltKey?: string;
  gradualRollout?: {
  enabled: boolean;,
  startPercentage: number;
  endPercentage: number;,
  durationHours: number;
  incrementSize: number;
}
};
}
interface MultivariateVariant {
  key: string;,
  value: Error;
  percentage: number;
  description?: string;
  enabled: boolean;
  interface MultivariateParams {
  variants: MultivariateVariant;
  saltKey?: string;
  defaultVariant?: string;
  trafficAllocation: number;
  interface ScheduledParams {
  enabled: boolean;
  startTime?: string;
  endTime?: string;
  timezone: string;
  recurrence?: {
  type: 'none' | 'daily' | 'weekly' | 'monthly';,
  interval: number;
  daysOfWeek?: number;
  dayOfMonth?: number;
}
};
  overrideOnHolidays?: boolean;
}
interface SegmentationRule {
  id: string;,
  attribute: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';,
  value: Error;
  logicalOperator: 'AND' | 'OR';,
  enabled: boolean;
  interface SegmentationParams {
  rules: SegmentationRule;,
  defaultValue: Error;
  evaluationMode: 'first_match' | 'all_rules' | 'weighted';,
  fallbackBehavior: 'default' | 'disable' | 'error';
  export const ToggleParametersManager: React.FC<ToggleParametersProps> = ({,)
  toggleId: _toggleId, // eslint-disable-line @typescript-eslint/no-unused-vars,
  toggleType,
  currentValue,
  onParametersChange,
  onSave,
  readonly = false
}
}) => {
  const [parameters, setParameters] = useState<Record<string, unknown>>(currentValue);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string }>({ isValid: true, errors: [] });
  const [previewMode, setPreviewMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  useEffect(() => {
    setParameters(currentValue);
    validateParameters(currentValue);
  }, [currentValue, toggleType, validateParameters]);
  const validateParameters = useCallback((params: Record<string, unknown>) => {
    const errors: string = [];
    let isValid = true;
    try {
      switch (toggleType) {
      case ToggleType.PERCENTAGE_ROLLOUT: {
        const percentageParams = params as PercentageRolloutParams;
        if (percentageParams.percentage < 0 || percentageParams.percentage > 100) {
          errors.push('Percentage must be between 0 and 100');
          isValid = false;
        if (percentageParams.gradualRollout?.enabled) {
          if (percentageParams.gradualRollout.startPercentage >= percentageParams.gradualRollout.endPercentage) {
            errors.push('Start percentage must be less than end percentage');
            isValid = false;
        break;
      case ToggleType.MULTIVARIATE: {
        const multivariateParams = params as MultivariateParams;
        const totalPercentage = multivariateParams.variants?.reduce(;);
          (sum)
          v
        ) => sum + (v.enabled ? v.percentage : 0), 0) || 0;
        if (Math.abs(totalPercentage - 100) > 0.01) {
          errors.push(`Total variant percentages must equal 100% (currently ${totalPercentage.toFixed(1)}%)`);}
          isValid = false;
        if (!multivariateParams.variants?.length) {
  errors.push('At least one variant is required');
  isValid = false;
  break;
  case ToggleType.SCHEDULED: {
  const scheduledParams = params as ScheduledParams;
  if (scheduledParams.enabled && scheduledParams.startTime && scheduledParams.endTime) {
  if (new Date(scheduledParams.startTime) >= new Date(scheduledParams.endTime)) {
  errors.push('Start time must be before end time');
  isValid = false;
  break;
  case ToggleType.SEGMENTATION: {
  const segmentationParams = params as SegmentationParams;
  if (!segmentationParams.rules?.length) {
  errors.push('At least one segmentation rule is required');
  isValid = false;
  break;
} catch {
      errors.push('Invalid parameter configuration');
      isValid = false;
    setValidation({ isValid, errors });
    return { isValid, errors };
  }, [toggleType]);
  const handleParametersUpdate = useCallback((newParams: Record<string, unknown>) => {
    setParameters(newParams);
    const validation = validateParameters(newParams);
    if (validation.isValid) {
      onParametersChange(newParams);
  }, [onParametersChange, validateParameters]);
  const renderPercentageRolloutEditor = () => {
    const params = parameters as PercentageRolloutParams;
    return;
      <div className="parameters-editor percentage-rollout">
        <div className="parameter-section">
          <div className="section-header">
            <Percent size={18} />
            <h3>Percentage Rollout Configuration</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rollout Percentage</label>
              <div className="percentage-input-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={params.percentage || 0}
                  onChange={(e) => handleParametersUpdate({)
  ...params,
  percentage: parseFloat(e.target.value),
})}
                  disabled={readonly}
                  className="percentage-slider"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={params.percentage || 0}
                  onChange={(e) => handleParametersUpdate({)
  ...params,
  percentage: parseFloat(e.target.value) || 0,
})}
                  disabled={readonly}
                  className="percentage-number"
                />
                <span className="percentage-label">%</span>
              </div>
            </div>
            <div className="form-group">
              <label>Salt Key (Optional)</label>
              <input
                type="text"
                value={params.saltKey || ''}
                onChange={(e) => handleParametersUpdate({)
  ...params,
  saltKey: e.target.value,
})}
                placeholder="Custom salt for consistent user assignment"
                disabled={readonly}
                className="form-control"
              />
              <div className="form-help">
                Used to ensure consistent user assignment across deployments
              </div>
            </div>
          </div>
        </div>
        {showAdvanced && ()
          <div className="parameter-section">
            <div className="section-header">
              <Clock size={18} />
              <h3>Gradual Rollout (Advanced)</h3>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={params.gradualRollout?.enabled || false}
                  onChange={(e) => handleParametersUpdate({)
  ...params,
  gradualRollout: {
  ...params.gradualRollout,
  enabled: e.target.checked,
  startPercentage: params.gradualRollout?.startPercentage || 0,
  endPercentage: params.gradualRollout?.endPercentage || params.percentage || 100,
  durationHours: params.gradualRollout?.durationHours || 24,
  incrementSize: params.gradualRollout?.incrementSize || 10,
})}
                  disabled={readonly}
                />
                Enable Gradual Rollout
              </label>
            </div>
            {params.gradualRollout?.enabled && ()
              <div className="gradual-rollout-config">
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={params.gradualRollout?.startPercentage || 0}
                      onChange={(e) => handleParametersUpdate({)
  ...params,
  gradualRollout: {
  ...params.gradualRollout!,
  startPercentage: parseFloat(e.target.value) || 0,
})}
                      disabled={readonly}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={params.gradualRollout?.endPercentage || 100}
                      onChange={(e) => handleParametersUpdate({)
  ...params,
  gradualRollout: {
  ...params.gradualRollout!,
  endPercentage: parseFloat(e.target.value) || 100,
})}
                      disabled={readonly}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      value={params.gradualRollout?.durationHours || 24}
                      onChange={(e) => handleParametersUpdate({)
  ...params,
  gradualRollout: {
  ...params.gradualRollout!,
  durationHours: parseInt(e.target.value) || 24,
})}
                      disabled={readonly}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Increment Size (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={params.gradualRollout?.incrementSize || 10}
                      onChange={(e) => handleParametersUpdate({)
  ...params,
  gradualRollout: {
  ...params.gradualRollout!,
  incrementSize: parseInt(e.target.value) || 10,
})}
                      disabled={readonly}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  const renderMultivariateEditor = () => {
    const params = parameters as MultivariateParams;
    const addVariant = () => {
      const newVariant: MultivariateVariant = {,
  key: `variant_${(params.variants?.length || 0) + 1}`}
},
  value: '',
        percentage: 0,
        enabled: true;
  };
      handleParametersUpdate({)
  ...params,
  variants: [...(params.variants || []), newVariant],
});
    };
    const updateVariant = (index: number, updatedVariant: MultivariateVariant) => {
  const newVariants = [...(params.variants || [])];
  newVariants[index] = updatedVariant;
  handleParametersUpdate({)
  ...params,
  variants: newVariants,
});
    };
    const removeVariant = (index: number) => {
  const newVariants = [...(params.variants || [])];
  newVariants.splice(index, 1);
  handleParametersUpdate({)
  ...params,
  variants: newVariants,
});
    };
    const totalPercentage = params.variants?.reduce((sum, v) => sum + (v.enabled ? v.percentage : 0), 0) || 0;
    return;
      <div className="parameters-editor multivariate">
        <div className="parameter-section">
          <div className="section-header">
            <Target size={18} />
            <h3>Multivariate Configuration</h3>
            <div className="header-actions">
              <Badge color={totalPercentage === 100 ? 'green' : 'orange'}>
                Total: {totalPercentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <div className="variants-list">
            {params.variants?.map((variant, index) => ()
              <div key={index} className={`variant-item ${!variant.enabled ? 'disabled' : ''}`}>}
                <div className="variant-header">
                  <div className="variant-toggle">
                    <input
                      type="checkbox"
                      checked={variant.enabled}
                      onChange={(e) => updateVariant(index, {)
  ...variant,
  enabled: e.target.checked,
})}
                      disabled={readonly}
                    />
                  </div>
                  <div className="variant-key">
                    <input
                      type="text"
                      value={variant.key}
                      onChange={(e) => updateVariant(index, {)
  ...variant,
  key: e.target.value,
})}
                      placeholder="Variant key"
                      disabled={readonly}
                      className="form-control"
                    />
                  </div>
                  <div className="variant-percentage">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={variant.percentage}
                      onChange={(e) => updateVariant(index, {)
  ...variant,
  percentage: parseFloat(e.target.value) || 0,
})}
                      disabled={readonly || !variant.enabled}
                      className="form-control"
                    />
                    <span>%</span>
                  </div>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => removeVariant(index)}
                    disabled={readonly}
                    title="Remove variant"
                  >
                    <Minus size={14} />
                  </button>
                </div>
                <div className="variant-details">
                  <div className="form-group">
                    <label>Value</label>
                    <textarea
                      value={typeof variant.value === 'object' ? JSON.stringify(variant.value, null, 2) : variant.value}
                      onChange={(e) => {
                        let value = e.target.value;
                        try {
                          // Try to parse as JSON
                          value = JSON.parse(e.target.value);
                        } catch {
                          // Keep as string if not valid JSON
                        updateVariant(index, { ...variant, value });
                      }}
                      placeholder="Variant value (JSON or string)"
                      disabled={readonly || !variant.enabled}
                      className="form-control"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <input
                      type="text"
                      value={variant.description || ''}
                      onChange={(e) => updateVariant(index, {)
  ...variant,
  description: e.target.value,
})}
                      placeholder="Variant description"
                      disabled={readonly || !variant.enabled}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            ))}
            {!readonly && ()
              <button
                className="btn btn-secondary add-variant-btn"
                onClick={addVariant}
              >
                <Plus size={16} />
                Add Variant
              </button>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Default Variant</label>
              <select
                value={params.defaultVariant || ''}
                onChange={(e) => handleParametersUpdate({)
  ...params,
  defaultVariant: e.target.value,
})}
                disabled={readonly}
                className="form-control"
              >
                <option value="">No default</option>
                {params.variants?.filter(v => v.enabled).map(variant => ()
                  <option key={variant.key} value={variant.key}>
                    {variant.key}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Traffic Allocation (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={params.trafficAllocation || 100}
                onChange={(e) => handleParametersUpdate({)
  ...params,
  trafficAllocation: parseFloat(e.target.value) || 100,
})}
                disabled={readonly}
                className="form-control"
              />
              <div className="form-help">
                Percentage of traffic to include in this experiment
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderScheduledEditor = () => {
    const params = parameters as ScheduledParams;
    return;
      <div className="parameters-editor scheduled">
        <div className="parameter-section">
          <div className="section-header">
            <Calendar size={18} />
            <h3>Scheduled Activation</h3>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={params.enabled || false}
                onChange={(e) => handleParametersUpdate({)
  ...params,
  enabled: e.target.checked,
})}
                disabled={readonly}
              />
              Enable Scheduled Activation
            </label>
          </div>
          {params.enabled && ()
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={params.startTime || ''}
                    onChange={(e) => handleParametersUpdate({)
  ...params,
  startTime: e.target.value,
})}
                    disabled={readonly}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    value={params.endTime || ''}
                    onChange={(e) => handleParametersUpdate({)
  ...params,
  endTime: e.target.value,
})}
                    disabled={readonly}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={params.timezone || 'UTC'}
                  onChange={(e) => handleParametersUpdate({)
  ...params,
  timezone: e.target.value,
})}
                  disabled={readonly}
                  className="form-control"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                </select>
              </div>
              <div className="recurrence-section">
                <h4>Recurrence Pattern</h4>
                <div className="form-group">
                  <label>Recurrence Type</label>
                  <select
                    value={params.recurrence?.type || 'none'}
                    onChange={(e) => handleParametersUpdate({)
  ...params,
  recurrence: {
  ...params.recurrence,
  type: e.target.value as 'none' | 'daily' | 'weekly' | 'monthly',
  interval: params.recurrence?.interval || 1,
})}
                    disabled={readonly}
                    className="form-control"
                  >
                    <option value="none">No Recurrence</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {params.recurrence?.type !== 'none' && ()
                  <div className="form-group">
                    <label>Interval</label>
                    <input
                      type="number"
                      min="1"
                      value={params.recurrence?.interval || 1}
                      onChange={(e) => handleParametersUpdate({)
  ...params,
  recurrence: {
  ...params.recurrence!,
  interval: parseInt(e.target.value) || 1,
})}
                      disabled={readonly}
                      className="form-control"
                    />
                    <div className="form-help">
                      Every {params.recurrence?.interval || 1} {params.recurrence?.type}(s)
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  const renderSegmentationEditor = () => {
    const params = parameters as SegmentationParams;
    const addRule = () => {
      const newRule: SegmentationRule = {,
  id: `rule_${Date.now()}`}
},
  attribute: '',
        operator: 'equals',
        value: '',
        logicalOperator: 'AND',
        enabled: true;
  };
      handleParametersUpdate({)
  ...params,
  rules: [...(params.rules || []), newRule],
});
    };
    const updateRule = (index: number, updatedRule: SegmentationRule) => {
  const newRules = [...(params.rules || [])];
  newRules[index] = updatedRule;
  handleParametersUpdate({)
  ...params,
  rules: newRules,
});
    };
    const removeRule = (index: number) => {
  const newRules = [...(params.rules || [])];
  newRules.splice(index, 1);
  handleParametersUpdate({)
  ...params,
  rules: newRules,
});
    };
    return;
      <div className="parameters-editor segmentation">
        <div className="parameter-section">
          <div className="section-header">
            <Filter size={18} />
            <h3>Segmentation Rules</h3>
          </div>
          <div className="segmentation-config">
            <div className="form-row">
              <div className="form-group">
                <label>Evaluation Mode</label>
                <select
                  value={params.evaluationMode || 'first_match'}
                  onChange={(e) => handleParametersUpdate({)
  ...params,
  evaluationMode: e.target.value as 'first_match' | 'all_rules' | 'weighted',
})}
                  disabled={readonly}
                  className="form-control"
                >
                  <option value="first_match">First Match</option>
                  <option value="all_rules">All Rules Must Match</option>
                  <option value="weighted">Weighted Rules</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fallback Behavior</label>
                <select
                  value={params.fallbackBehavior || 'default'}
                  onChange={(e) => handleParametersUpdate({)
  ...params,
  fallbackBehavior: e.target.value as 'default' | 'disable' | 'error',
})}
                  disabled={readonly}
                  className="form-control"
                >
                  <option value="default">Use Default Value</option>
                  <option value="disable">Disable Toggle</option>
                  <option value="error">Throw Error</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Default Value</label>
              <input
                type="text"
                value={typeof params.defaultValue === 'object' ? JSON.stringify(params.defaultValue) : params.defaultValue || ''}
                onChange={(e) => {
                  let value = e.target.value;
                  try {
                    value = JSON.parse(e.target.value);
                  } catch {
  // Keep as string
  handleParametersUpdate({)
  ...params,
  defaultValue: value,
});
                }}
                placeholder="Default value when no rules match"
                disabled={readonly}
                className="form-control"
              />
            </div>
          </div>
          <div className="rules-list">
            <h4>Segmentation Rules</h4>
            {params.rules?.map((rule, index) => ()
              <div key={rule.id} className={`rule-item ${!rule.enabled ? 'disabled' : ''}`}>}
                <div className="rule-header">
                  <div className="rule-toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => updateRule(index, {)
  ...rule,
  enabled: e.target.checked,
})}
                      disabled={readonly}
                    />
                  </div>
                  {index > 0 && ()
                    <div className="logical-operator">
                      <select
                        value={rule.logicalOperator}
                        onChange={(e) => updateRule(index, {)
  ...rule,
  logicalOperator: e.target.value as 'AND' | 'OR',
})}
                        disabled={readonly || !rule.enabled}
                        className="form-control small"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    </div>
                  )}
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => removeRule(index)}
                    disabled={readonly}
                    title="Remove rule"
                  >
                    <Minus size={14} />
                  </button>
                </div>
                <div className="rule-definition">
                  <div className="rule-row">
                    <div className="form-group">
                      <label>Attribute</label>
                      <input
                        type="text"
                        value={rule.attribute}
                        onChange={(e) => updateRule(index, {)
  ...rule,
  attribute: e.target.value,
})}
                        placeholder="user.id, organization.plan, etc."
                        disabled={readonly || !rule.enabled}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Operator</label>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(index, {)
  ...rule,
  operator: e.target.value as 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal',
})}
                        disabled={readonly || !rule.enabled}
                        className="form-control"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="in">In</option>
                        <option value="not_in">Not In</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="contains">Contains</option>
                        <option value="starts_with">Starts With</option>
                        <option value="ends_with">Ends With</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Value</label>
                      <input
                        type="text"
                        value={typeof rule.value === 'object' ? JSON.stringify(rule.value) : rule.value}
                        onChange={(e) => {
                          let value = e.target.value;
                          try {
                            value = JSON.parse(e.target.value);
                          } catch {
                            // Keep as string
                          updateRule(index, { ...rule, value });
                        }}
                        placeholder="Comparison value"
                        disabled={readonly || !rule.enabled}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!readonly && ()
              <button
                className="btn btn-secondary add-rule-btn"
                onClick={addRule}
              >
                <Plus size={16} />
                Add Rule
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderParameterEditor = () => {
    switch (toggleType) {
    case ToggleType.PERCENTAGE_ROLLOUT:
      return renderPercentageRolloutEditor();
    case ToggleType.MULTIVARIATE:
      return renderMultivariateEditor();
    case ToggleType.SCHEDULED:
      return renderScheduledEditor();
    case ToggleType.SEGMENTATION:
      return renderSegmentationEditor();,
  default:
      return;
        <div className="parameters-editor boolean">
          <div className="parameter-section">
            <div className="section-header">
              <Settings size={18} />
              <h3>Boolean Toggle</h3>
            </div>
            <p className="help-text">
                Boolean toggles have no additional parameters to configure.
                They are simply enabled or disabled.
            </p>
          </div>
        </div>
      );
  };
  return;
    <div className="toggle-parameters-manager">
      <div className="parameters-header">
        <div className="header-info">
          <h2>Toggle Parameters</h2>
          <Badge color="blue">{toggleType.replace('_', ' ')}</Badge>
        </div>
        <div className="header-actions">
          {!validation.isValid && ()
            <div className="validation-status">
              <AlertTriangle size={16} className="text-danger" />
              <span>{validation.errors.length} error(s)</span>
            </div>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <EyeOff size={16} /> : <Eye size={16} />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setPreviewMode(!previewMode)}
            disabled={!validation.isValid}
          >
            {previewMode ? <Pause size={16} /> : <Play size={16} />}
            {previewMode ? 'Stop' : 'Start'} Preview
          </button>
          {onSave && ()
            <button
              className="btn btn-primary"
              onClick={onSave}
              disabled={!validation.isValid || readonly}
            >
              <Save size={16} />
              Save Parameters
            </button>
          )}
        </div>
      </div>
      {!validation.isValid && ()
        <div className="validation-errors">
          <AlertTriangle size={16} />
          <div className="error-list">
            {validation.errors.map((error, index) => ()
              <div key={index} className="error-item">{error}</div>
            ))}
          </div>
        </div>
      )}
      <div className="parameters-content">
        {renderParameterEditor()}
      </div>
      {previewMode && validation.isValid && ()
        <div className="parameters-preview">
          <div className="preview-header">
            <h3>Configuration Preview</h3>
          </div>
          <pre className="preview-content">
            {JSON.stringify(parameters, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};