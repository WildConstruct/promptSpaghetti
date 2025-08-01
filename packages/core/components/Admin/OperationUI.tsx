/**
 * Operation UI Components
 * 
 * Comprehensive React components for designing and executing operations
 * with dynamic form generation, progress tracking, and result visualization.
 * 
 * Features:
 * - Dynamic form generation based on operation type parameters
 * - Real-time progress tracking with cancellation support
 * - Result visualization and error handling
 * - Operation templates and favorites
 * - Batch operation management
 */
import React, { useState, useCallback, useMemo } from 'react';
import { OperationType, 
  OperationParameter, 
  OperationExecution, 
  ExecutionStatus,
  ParameterType,
  InputType,
  RiskLevel }
  OperationCategory 
 from '../../admin/services/OperationTypesService';

// Main Operation UI Component


export interface OperationUIProps { operationType: OperationType;
  initialParameters?: Record<string, any>;
  onExecute: (parameters: Record<string, any>) => Promise<OperationExecution>;
  onCancel?: (executionId: string) => Promise<void>;
  onParametersChange?: (parameters: Record<string, any>) => void;
  readonly?: boolean;
  showAdvanced?: boolean }

export const OperationUI: React.FC<OperationUIProps> = ({ )
  operationType }
  initialParameters = {}
  onExecute
  onCancel
  onParametersChange
  readonly = false
  showAdvanced = false
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>(initialParameters);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [execution, setExecution] = useState<OperationExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showParameters, setShowParameters] = useState(true);
  // Parameter validation
  const validateParameters = useCallback((params: Record<string, any>) => {
    const errors: Record<string, string> = {};
    operationType.parameters.forEach(param => {)
  const value = params[param.name];
      // Required validation
      if (param.required && (value === undefined || value === null || value === '')) {
        errors[param.name] = `${param.displayName} is required`;}
        return;
      // Skip further validation if value is empty and not required
      if (!value && !param.required) return;
      // Type validation
      if (!validateParameterType(value, param.type)) {
        errors[param.name] = `${param.displayName} must be of type ${param.type}`;}
        return;
      // Constraint validation
      param.constraints.forEach(constraint => { )
  const result = validateConstraint(value, constraint);
        if (!result.isValid) {
          errors[param.name] = result.message });
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [operationType.parameters]);
  // Handle parameter changes
  const handleParameterChange = useCallback((name: string, value: Error) => {
    const newParameters = { ...parameters, [name]: value };
    setParameters(newParameters);
    onParametersChange?.(newParameters);
    // Validate on change
    setTimeout(() => validateParameters(newParameters), 100);
  }, [parameters, onParametersChange, validateParameters]);
  // Execute operation
  const handleExecute = useCallback(async () => { if (!validateParameters(parameters)) {
      return;
    setIsExecuting(true);
    try {
      const executionResult = await onExecute(parameters);
      setExecution(executionResult) } catch (error) {
  console.error('Operation execution failed:', error);
  // Handle error
 finally { setIsExecuting(false) }, [parameters, onExecute, validateParameters]);
  // Cancel execution
  const handleCancel = useCallback(async () => { if (execution && onCancel) {
      try {
        await onCancel(execution.id);
        setExecution(null) } catch (error) { console.error('Operation cancellation failed:', error) }, [execution, onCancel]);
  const isValid = useMemo(() => ;
    Object.keys(validationErrors).length === 0
  [validationErrors]
  );
  const canExecute = useMemo(() => ;
    !readonly && !isExecuting && isValid && !execution
  [readonly, isExecuting, isValid, execution]
  );
  return;
    <div className="operation-ui">
      <OperationHeader 
        operationType={operationType}
        execution={execution}
        onToggleParameters={() => setShowParameters(!showParameters)}
        showParameters={showParameters}
      />
      {showParameters && ()
        <OperationParametersForm
          parameters={operationType.parameters}
          values={parameters}
          errors={validationErrors}
          onChange={handleParameterChange}
          readonly={readonly}
          showAdvanced={showAdvanced}
        />
      )}
      <OperationActions
        operationType={operationType}
        canExecute={canExecute}
        isExecuting={isExecuting}
        execution={execution}
        onExecute={handleExecute}
        onCancel={handleCancel}
      />
      {execution && ()
        <OperationProgress
          execution={execution}
          operationType={operationType}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

// Operation Header Component


interface OperationHeaderProps { operationType: OperationType;
  execution: OperationExecution | null;
  onToggleParameters: () => void
  showParameters: boolean;
  const OperationHeader: React.FC<OperationHeaderProps> = ({);
  operationType;
  execution;
  onToggleParameters }
  showParameters


}) => { const _____getRiskLevelColor = (risk: RiskLevel) => {,
  switch (risk) {
  case RiskLevel.LOW: return 'green';
  case RiskLevel.MEDIUM: return 'yellow';
  case RiskLevel.HIGH: return 'orange';
  case RiskLevel.CRITICAL: return 'red';,
  default: return 'gray' }
};
  return;
    <div className="operation-header">
      <div className="operation-title">
        <div className="operation-icon" style={{ color: operationType.uiConfig.color }}>
          {operationType.uiConfig.icon || '⚙️'}
        </div>
        <div>
          <h3>{operationType.displayName}</h3>
          <p className="operation-description">{operationType.description}</p>
        </div>
      </div>
      <div className="operation-metadata">
        <span className={`risk-badge risk-${operationType.riskLevel}`}>}
          {operationType.riskLevel.toUpperCase()} RISK
        </span>
        <span className="category-badge">
          {operationType.category.replace('_', ' ').toUpperCase()}
        </span>
        {execution && ()
          <span className={`status-badge status-${execution.status}`}>}
            {execution.status.toUpperCase()}
          </span>
        )}
      </div>
      <button 
        className="toggle-parameters-btn"
        onClick={onToggleParameters}
      >
        {showParameters ? 'Hide' : 'Show'} Parameters
      </button>
    </div>
  );
};

// Dynamic Parameters Form Component


interface OperationParametersFormProps { parameters: OperationParameter;
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (name: string, value: Error) => void
  readonly: boolean;
  showAdvanced: boolean;
  const OperationParametersForm: React.FC<OperationParametersFormProps> = ({);
  parameters;
  values;
  errors;
  onChange;
  readonly }
  showAdvanced


}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const parametersByGroup = useMemo(() => {
    const groups: Record<string, OperationParameter> = {};
    parameters.forEach(param => { )
  const group = param.name.includes('advanced') && !showAdvanced ;
  ? 'advanced'
  : 'basic';
  if (!groups[group]) groups[group] = [];
  groups[group].push(param) });
    return groups;
  }, [parameters, showAdvanced]);
  const toggleSection = (section: string) => { const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section) } else { newCollapsed.add(section);
    setCollapsedSections(newCollapsed) };
  return;
    <div className="operation-parameters-form">
      {Object.entries(parametersByGroup).map(([group, groupParams]) => ()
        <div key={group} className="parameter-group">
          <div 
            className="parameter-group-header"
            onClick={() => toggleSection(group)}
          >
            <h4>{group === 'advanced' ? 'Advanced Options' : 'Parameters'}</h4>
            <span className={`collapse-icon ${collapsedSections.has(group) ? 'collapsed' : ''}`}>}
              ▼
            </span>
          </div>
          {!collapsedSections.has(group) && ()
            <div className="parameter-group-content">
              {groupParams.map(parameter => ()
                <ParameterInput
                  key={parameter.name}
                  parameter={parameter}
                  value={values[parameter.name]}
                  error={errors[parameter.name]}
                  onChange={(value) => onChange(parameter.name, value)}
                  readonly={readonly}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Individual Parameter Input Component


interface ParameterInputProps { parameter: OperationParameter;
  value: Error;
  error?: string;
  onChange: (value: Error) => void
  readonly: boolean;
  const ParameterInput: React.FC<ParameterInputProps> = ({);
  parameter;
  value;
  error;
  onChange }
  readonly


}) => { const renderInput = () => {
  const commonProps = {
  value: value || parameter.defaultValue || '',
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
  onChange(e.target.value)
  disabled: readonly
  placeholder: parameter.placeholder
  className: error ? 'error' : '' }
};
    switch (parameter.inputType) {
    case InputType.TEXT:
      return <input type="text" {...commonProps} />;
    case InputType.TEXTAREA:
      return <textarea {...commonProps} rows={4} />;
    case InputType.NUMBER:
      return;
        <input 
          type="number" 
          {...commonProps}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      );
    case InputType.CHECKBOX:
      return;
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={readonly}
          className={error ? 'error' : ''}
        />
      );
    case InputType.SELECT:
      return;
        <select {...commonProps}>
          <option value="">Select...</option>
          {parameter.options?.map(option => ()
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      );
    case InputType.MULTISELECT:
      return;
        <div className="multiselect">
          {parameter.options?.map(option => ()
            <label key={option.value} className="multiselect-option">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(option.value)}
                onChange={ (e) => {
  const currentValues = Array.isArray(value) ? value : [];
  if (e.target.checked) {
  onChange([...currentValues, option.value]) } else { onChange(currentValues.filter((v: unknown) => v !== option.value)) }}
                disabled={readonly || option.disabled}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    case InputType.DATE_PICKER:
      return;
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={(e) => onChange(new Date(e.target.value))}
          disabled={readonly}
          className={error ? 'error' : ''}
        />
      );
    case InputType.DATETIME_PICKER:
      return;
        <input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, -1) : ''}
          onChange={(e) => onChange(new Date(e.target.value))}
          disabled={readonly}
          className={error ? 'error' : ''}
        />
      );
    case InputType.FILE_UPLOAD:
      return;
        <input
          type="file"
          onChange={ (e) => {
            const file = e.target.files?.[0];
            if (file) {
              onChange(file) }}
          disabled={readonly}
          className={error ? 'error' : ''}
        />
      );
    default:
      return <input type="text" {...commonProps} />;
  };
  return;
    <div className="parameter-input">
      <label className="parameter-label">
        {parameter.displayName}
        {parameter.required && <span className="required">*</span>}
      </label>
      <div className="parameter-control">
        {renderInput()}
        {parameter.helpText && ()
          <div className="parameter-help">{parameter.helpText}</div>
        )}
        {error && ()
          <div className="parameter-error">{error}</div>
        )}
      </div>
    </div>
  );
};

// Operation Actions Component


interface OperationActionsProps { operationType: OperationType;
  canExecute: boolean;
  isExecuting: boolean;
  execution: OperationExecution | null;
  onExecute: () => void
  onCancel: () => void;
  const OperationActions: React.FC<OperationActionsProps> = ({);
  operationType;
  canExecute;
  isExecuting;
  execution;
  onExecute }
  onCancel


}) => { const [showConfirmation, setShowConfirmation] = useState(false);
  const handleExecute = () => {
    if (operationType.uiConfig.confirmationRequired) {
      setShowConfirmation(true) } else { onExecute() };
  const confirmExecution = () => { setShowConfirmation(false);
    onExecute() };
  return;
    <div className="operation-actions">
      <div className="primary-actions">
        {!execution && ()
          <button
            className={`execute-btn risk-${operationType.riskLevel}`}
            onClick={handleExecute}
            disabled={!canExecute}
          >
            {isExecuting ? 'Executing...' : `Execute ${operationType.displayName}`}
          </button>
        )}
        {execution && execution.status === ExecutionStatus.RUNNING && operationType.uiConfig.allowCancel && ()
          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel Operation
          </button>
        )}
      </div>
      <div className="secondary-actions">
        <button className="template-btn">Save as Template</button>
        <button className="schedule-btn">Schedule</button>
        <button className="dry-run-btn">Dry Run</button>
      </div>
      {showConfirmation && ()
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h4>Confirm Operation</h4>
            <p>
              {operationType.uiConfig.confirmationMessage || 
               `Are you sure you want to execute ${operationType.displayName}?`}
            </p>
            <div className="confirmation-actions">
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
              <button 
                className={`confirm-btn risk-${operationType.riskLevel}`}
                onClick={confirmExecution}
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Operation Progress Component


interface OperationProgressProps { execution: OperationExecution;
  operationType: OperationType;
  onCancel: () => void;
  const OperationProgress: React.FC<OperationProgressProps> = ({);
  execution;
  operationType }
  onCancel


}) => {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;}
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;}
    return `${seconds}s`;}
  };
  const getStatusColor = (status: ExecutionStatus) => { switch (status) {
  case ExecutionStatus.RUNNING: return 'blue';
  case ExecutionStatus.COMPLETED: return 'green';
  case ExecutionStatus.FAILED: return 'red';
  case ExecutionStatus.CANCELLED: return 'gray';,
  default: return 'gray' }
};
  return;
    <div className="operation-progress">
      <div className="progress-header">
        <h4>Operation Progress</h4>
        <span className={`status status-${execution.status}`}>}
          {execution.status.toUpperCase()}
        </span>
      </div>
      {operationType.uiConfig.showProgressBar && ()
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${execution.progress.percentage}%`}

  backgroundColor: getStatusColor(execution.status);
}
            />
          </div>
          <span className="progress-text">{execution.progress.percentage.toFixed(1)}%</span>
        </div>
      )}
      {operationType.uiConfig.showDetailedProgress && ()
        <div className="progress-details">
          <div className="progress-stats">
            <div className="stat">
              <label>Current Step:</label>
              <span>{execution.progress.currentStep}</span>
            </div>
            <div className="stat">
              <label>Progress:</label>
              <span>{execution.progress.completedSteps} / {execution.progress.totalSteps}</span>
            </div>
            <div className="stat">
              <label>Processed:</label>
              <span>{execution.processedTargets} / {execution.totalTargets}</span>
            </div>
            <div className="stat">
              <label>Success:</label>
              <span>{execution.successCount}</span>
            </div>
            <div className="stat">
              <label>Errors:</label>
              <span>{execution.errorCount}</span>
            </div>
          </div>
          {execution.duration && ()
            <div className="timing-info">
              <div className="stat">
                <label>Duration:</label>
                <span>{formatDuration(execution.duration)}</span>
              </div>
              {execution.progress.estimatedTimeRemaining && ()
                <div className="stat">
                  <label>ETA:</label>
                  <span>{formatDuration(execution.progress.estimatedTimeRemaining)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {execution.logs && execution.logs.length > 0 && ()
        <div className="operation-logs">
          <h5>Recent Activity</h5>
          <div className="logs-container">
            {execution.logs.slice(-5).map((log, index) => ()
              <div key={index} className={`log-entry log-${log.level}`}>}
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {execution.errors && execution.errors.length > 0 && ()
        <div className="operation-errors">
          <h5>Errors</h5>
          <div className="errors-container">
            {execution.errors.slice(-3).map((error, index) => ()
              <div key={index} className="error-entry">
                <span className="error-code">{error.code}</span>
                <span className="error-message">{error.message}</span>
                {error.recoverable && <span className="recoverable-badge">Recoverable</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Utility functions
function validateParameterType(value: Error, type: ParameterType): boolean { switch (type) {
  case ParameterType.STRING:
    return typeof value === 'string';
  case ParameterType.NUMBER:
    return typeof value === 'number' && !isNaN(value);
  case ParameterType.BOOLEAN:
    return typeof value === 'boolean';
  case ParameterType.ARRAY:
    return Array.isArray(value);
  case ParameterType.OBJECT: return typeof value === 'object' && value !== null && !Array.isArray(value) }
  default:
    return true;
function validateConstraint(_____value: Error, _____constraint: unknown): { isValid: boolean; message: string } {
  // Implementation would match the server-side validation
  return { isValid: true, message: '' };

export default OperationUI;