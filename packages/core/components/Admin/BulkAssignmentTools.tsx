/**
 * Bulk Assignment Tools Components
 * Task: E17-1753114396896-4DCBA7 - Create bulk assignment tools
 * 
 * Comprehensive React components for bulk assignment operations including
 * API keys, permissions, roles, teams, and usage quotas with multi-step
 * wizard, conflict resolution, and progress tracking.
 */

import React, { useState, useMemo } from 'react';
import './BulkAssignmentTools.css';

// =============================================================================
// Types and Interfaces
// =============================================================================

export enum AssignmentType {
  API_KEY = 'api_key',
  PERMISSION = 'permission',
  ROLE = 'role',
  TEAM = 'team',
  QUOTA = 'quota'
}

export enum BulkOperationType {
  ASSIGN = 'assign',
  REVOKE = 'revoke',
  UPDATE = 'update',
  TRANSFER = 'transfer'
}

export interface BulkAssignmentTarget {
  id: string;
  type: 'user' | 'team' | 'service' | 'role';
  name: string;
  email?: string;
  department?: string;
  currentAssignments?: Assignment[];
  conflicts?: AssignmentConflict[];
  metadata?: Record<string, any>;
}

export interface Assignment {
  id: string;
  assignmentType: AssignmentType;
  resourceId: string;
  resourceName: string;
  assignedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'suspended';
  assignedBy: string;
  metadata?: Record<string, any>;
}

export interface AssignmentConflict {
  type: 'duplicate' | 'incompatible' | 'quota_exceeded' | 'permission_denied';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedAssignments: string[];
  resolution?: 'skip' | 'override' | 'merge' | 'escalate';
}

export interface BulkAssignmentOperation {
  operationId: string;
  operationType: BulkOperationType;
  assignmentType: AssignmentType;
  targets: BulkAssignmentTarget[];
  resources: AssignmentResource[];
  parameters: BulkAssignmentParameters;
  template?: AssignmentTemplate;
  status: 'draft' | 'validating' | 'pending_approval' | 'executing' | 'completed' | 'failed' | 'cancelled';
  progress?: BulkAssignmentProgress;
  conflicts?: AssignmentConflict[];
  results?: BulkAssignmentResult[];
}

export interface AssignmentResource {
  id: string;
  type: AssignmentType;
  name: string;
  description?: string;
  tier?: 'basic' | 'standard' | 'premium' | 'enterprise';
  permissions?: string[];
  restrictions?: string[];
  quotaLimits?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface BulkAssignmentParameters {
  executionMode: 'immediate' | 'scheduled' | 'staged';
  batchSize: number;
  maxConcurrency: number;
  continueOnError: boolean;
  notifyTargets: boolean;
  scheduledAt?: Date;
  expirationDate?: Date;
  gracePeriod?: number; // hours
  rollbackOnFailure: boolean;
  requireApproval: boolean;
  autoResolveConflicts: boolean;
  customProperties: Record<string, any>;
}

export interface AssignmentTemplate {
  id: string;
  name: string;
  description: string;
  assignmentType: AssignmentType;
  operationType: BulkOperationType;
  defaultParameters: Partial<BulkAssignmentParameters>;
  defaultResources: string[];
  targetFilters: TargetFilter[];
  usage: {
    timesUsed: number;
    lastUsed?: Date;
    successRate: number;
  };
  createdBy: string;
  createdAt: Date;
  isSystemTemplate: boolean;
}

export interface TargetFilter {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'not_in' | 'contains' | 'starts_with';
  value: Error;
  logicalOperator?: 'AND' | 'OR';
}

export interface BulkAssignmentProgress {
  totalTargets: number;
  processedTargets: number;
  successfulAssignments: number;
  failedAssignments: number;
  skippedAssignments: number;
  conflictsResolved: number;
  currentBatch: number;
  totalBatches: number;
  percentComplete: number;
  estimatedTimeRemaining?: number; // minutes
  currentStep: string;
}

export interface BulkAssignmentResult {
  targetId: string;
  targetName: string;
  status: 'success' | 'failed' | 'skipped' | 'partial';
  assignedResources: string[];
  errors?: string[];
  warnings?: string[];
  conflictsEncountered?: AssignmentConflict[];
  processingTime: number; // milliseconds
  metadata?: Record<string, any>;
}

// =============================================================================
// Main Bulk Assignment Tools Component
// =============================================================================

export interface BulkAssignmentToolsProps {
  assignmentType: AssignmentType;
  operationType: BulkOperationType;
  availableTargets: BulkAssignmentTarget[];
  availableResources: AssignmentResource[];
  availableTemplates: AssignmentTemplate[];
  onExecute: (operation: BulkAssignmentOperation) => Promise<string>;
  onCancel?: (operationId: string) => Promise<void>;
  onTemplateCreate?: (template: Omit<AssignmentTemplate, 'id' | 'createdAt' | 'usage'>) => Promise<string>;
  readonly?: boolean;
}

export const BulkAssignmentTools: React.FC<BulkAssignmentToolsProps> = ({
  assignmentType,
  operationType,
  availableTargets,
  availableResources,
  availableTemplates,
  onExecute,
  onCancel,
  onTemplateCreate,
  readonly = false
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [operation, setOperation] = useState<BulkAssignmentOperation>({
    operationId: '',
    operationType,
    assignmentType,
    targets: [],
    resources: [],
    parameters: {
      executionMode: 'immediate',
      batchSize: 50,
      maxConcurrency: 5,
      continueOnError: true,
      notifyTargets: false,
      rollbackOnFailure: false,
      requireApproval: false,
      autoResolveConflicts: false,
      customProperties: {}
    },
    status: 'draft'
  });

  const steps = [
    { number: 1, title: 'Select Targets', description: 'Choose users, teams, or services' },
    { number: 2, title: 'Choose Resources', description: 'Select what to assign' },
    { number: 3, title: 'Configure Options', description: 'Set execution parameters' },
    { number: 4, title: 'Review & Resolve', description: 'Review conflicts and validate' },
    { number: 5, title: 'Execute', description: 'Run the bulk assignment' }
  ];

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
    case 1: return operation.targets.length > 0;
    case 2: return operation.resources.length > 0;
    case 3: return true; // Parameters have defaults
    case 4: return operation.conflicts?.every(c => c.resolution) ?? true;
    case 5: return operation.status === 'draft';
    default: return false;
    }
  }, [currentStep, operation]);

  const handleStepChange = (step: number) => {
    if (step <= currentStep + 1 && step >= 1) {
      setCurrentStep(step);
    }
  };

  const handleExecute = async () => {
    try {
      setOperation(prev => ({ ...prev, status: 'executing' }));
      const operationId = await onExecute(operation);
      setOperation(prev => ({ ...prev, operationId, status: 'executing' }));
    } catch (error) {
      setOperation(prev => ({ ...prev, status: 'failed' }));
      console.error('Failed to execute bulk assignment:', error);
    }
  };

  return (
    <div className="bulk-assignment-tools">
      <BulkAssignmentHeader
        assignmentType={assignmentType}
        operationType={operationType}
        operation={operation}
        onTemplateLoad={(template) => {
          // Load template configuration
          setOperation(prev => ({
            ...prev,
            template,
            parameters: { ...prev.parameters, ...template.defaultParameters },
            resources: availableResources.filter(r => template.defaultResources.includes(r.id))
          }));
        }}
        availableTemplates={availableTemplates}
      />

      <BulkAssignmentWizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        canProceed={canProceedToNextStep}
      />

      <div className="bulk-assignment-content">
        {currentStep === 1 && (
          <TargetSelectionStep
            targets={availableTargets}
            selectedTargets={operation.targets}
            onTargetsChange={(targets) => setOperation(prev => ({ ...prev, targets }))}
            assignmentType={assignmentType}
            operationType={operationType}
          />
        )}

        {currentStep === 2 && (
          <ResourceSelectionStep
            resources={availableResources}
            selectedResources={operation.resources}
            onResourcesChange={(resources) => setOperation(prev => ({ ...prev, resources }))}
            assignmentType={assignmentType}
            operationType={operationType}
            targets={operation.targets}
          />
        )}

        {currentStep === 3 && (
          <ParametersConfigurationStep
            parameters={operation.parameters}
            onParametersChange={(parameters) => setOperation(prev => ({ ...prev, parameters }))}
            assignmentType={assignmentType}
            operationType={operationType}
          />
        )}

        {currentStep === 4 && (
          <ConflictResolutionStep
            operation={operation}
            onConflictsResolved={(conflicts) => setOperation(prev => ({ ...prev, conflicts }))}
            onOperationUpdated={setOperation}
          />
        )}

        {currentStep === 5 && (
          <ExecutionStep
            operation={operation}
            onExecute={handleExecute}
            onCancel={onCancel}
            readonly={readonly}
          />
        )}
      </div>

      <BulkAssignmentActions
        currentStep={currentStep}
        totalSteps={steps.length}
        canProceed={canProceedToNextStep}
        onPrevious={() => handleStepChange(currentStep - 1)}
        onNext={() => handleStepChange(currentStep + 1)}
        onExecute={handleExecute}
        onReset={() => {
          setCurrentStep(1);
          setOperation(prev => ({
            ...prev,
            targets: [],
            resources: [],
            status: 'draft',
            conflicts: [],
            results: []
          }));
        }}
        isExecuting={operation.status === 'executing'}
        readonly={readonly}
      />
    </div>
  );
};

// =============================================================================
// Bulk Assignment Header Component
// =============================================================================

interface BulkAssignmentHeaderProps {
  assignmentType: AssignmentType;
  operationType: BulkOperationType;
  operation: BulkAssignmentOperation;
  availableTemplates: AssignmentTemplate[];
  onTemplateLoad: (template: AssignmentTemplate) => void;
}

const BulkAssignmentHeader: React.FC<BulkAssignmentHeaderProps> = ({
  assignmentType,
  operationType,
  operation,
  availableTemplates,
  onTemplateLoad
}) => {
  const getOperationTitle = () => {
    const typeNames = {
      [AssignmentType.API_KEY]: 'API Keys',
      [AssignmentType.PERMISSION]: 'Permissions',
      [AssignmentType.ROLE]: 'Roles',
      [AssignmentType.TEAM]: 'Team Memberships',
      [AssignmentType.QUOTA]: 'Usage Quotas'
    };

    const operationNames = {
      [BulkOperationType.ASSIGN]: 'Assign',
      [BulkOperationType.REVOKE]: 'Revoke',
      [BulkOperationType.UPDATE]: 'Update',
      [BulkOperationType.TRANSFER]: 'Transfer'
    };

    return `${operationNames[operationType]} ${typeNames[assignmentType]}`;
  };

  const getOperationIcon = () => {
    const icons = {
      [AssignmentType.API_KEY]: '🔑',
      [AssignmentType.PERMISSION]: '🔐',
      [AssignmentType.ROLE]: '👤',
      [AssignmentType.TEAM]: '👥',
      [AssignmentType.QUOTA]: '📊'
    };
    return icons[assignmentType];
  };

  const applicableTemplates = availableTemplates.filter(
    template => template.assignmentType === assignmentType && template.operationType === operationType
  );

  return (
    <div className="bulk-assignment-header">
      <div className="operation-title">
        <span className="operation-icon">{getOperationIcon()}</span>
        <div>
          <h2>{getOperationTitle()}</h2>
          <p>Bulk {operationType} operation for {operation.targets.length} targets</p>
        </div>
      </div>

      <div className="template-controls">
        <label htmlFor="template-select">Load Template:</label>
        <select 
          id="template-select"
          onChange={(e) => {
            const template = applicableTemplates.find(t => t.id === e.target.value);
            if (template) onTemplateLoad(template);
          }}
          value=""
        >
          <option value="">Choose a template...</option>
          {applicableTemplates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.usage.timesUsed} uses, {Math.round(template.usage.successRate)}% success)
            </option>
          ))}
        </select>
      </div>

      <div className="operation-status">
        <span className={`status-badge status-${operation.status}`}>
          {operation.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// Wizard Navigation Component
// =============================================================================

interface BulkAssignmentWizardProps {
  steps: Array<{ number: number; title: string; description: string }>;
  currentStep: number;
  onStepChange: (step: number) => void;
  canProceed: boolean;
}

const BulkAssignmentWizard: React.FC<BulkAssignmentWizardProps> = ({
  steps,
  currentStep,
  onStepChange,
  canProceed
}) => {
  return (
    <div className="bulk-assignment-wizard">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`wizard-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
          onClick={() => onStepChange(step.number)}
        >
          <div className="step-number">{step.number}</div>
          <div className="step-content">
            <div className="step-title">{step.title}</div>
            <div className="step-description">{step.description}</div>
          </div>
          {currentStep > step.number && <div className="step-check">✓</div>}
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// Target Selection Step Component
// =============================================================================

interface TargetSelectionStepProps {
  targets: BulkAssignmentTarget[];
  selectedTargets: BulkAssignmentTarget[];
  onTargetsChange: (targets: BulkAssignmentTarget[]) => void;
  assignmentType: AssignmentType;
  operationType: BulkOperationType;
}

const TargetSelectionStep: React.FC<TargetSelectionStepProps> = ({
  targets,
  selectedTargets,
  onTargetsChange,
  assignmentType,
  operationType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'team' | 'service' | 'role'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [showConflicts, setShowConflicts] = useState(false);

  const filteredTargets = useMemo(() => {
    return targets.filter(target => {
      const matchesSearch = target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           target.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || target.type === filterType;
      const matchesDepartment = !filterDepartment || target.department === filterDepartment;
      const hasConflicts = target.conflicts && target.conflicts.length > 0;
      const matchesConflictFilter = !showConflicts || hasConflicts;

      return matchesSearch && matchesType && matchesDepartment && matchesConflictFilter;
    });
  }, [targets, searchTerm, filterType, filterDepartment, showConflicts]);

  const departments = useMemo(() => {
    const depts = new Set(targets.map(t => t.department).filter(Boolean));
    return Array.from(depts) as string[];
  }, [targets]);

  const handleTargetToggle = (target: BulkAssignmentTarget) => {
    const isSelected = selectedTargets.some(t => t.id === target.id);
    if (isSelected) {
      onTargetsChange(selectedTargets.filter(t => t.id !== target.id));
    } else {
      onTargetsChange([...selectedTargets, target]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTargets.length === filteredTargets.length) {
      onTargetsChange([]);
    } else {
      onTargetsChange(filteredTargets);
    }
  };

  return (
    <div className="target-selection-step">
      <div className="selection-controls">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="user">Users</option>
            <option value="team">Teams</option>
            <option value="service">Services</option>
            <option value="role">Roles</option>
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showConflicts}
              onChange={(e) => setShowConflicts(e.target.checked)}
            />
            Show only conflicted targets
          </label>
        </div>

        <div className="bulk-actions">
          <button
            onClick={handleSelectAll}
            className="bulk-select-btn"
          >
            {selectedTargets.length === filteredTargets.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="selection-count">
            {selectedTargets.length} of {filteredTargets.length} selected
          </span>
        </div>
      </div>

      <div className="targets-list">
        {filteredTargets.map(target => (
          <TargetCard
            key={target.id}
            target={target}
            selected={selectedTargets.some(t => t.id === target.id)}
            onToggle={() => handleTargetToggle(target)}
            assignmentType={assignmentType}
            operationType={operationType}
          />
        ))}
      </div>

      {filteredTargets.length === 0 && (
        <div className="empty-state">
          <p>No targets match your current filters.</p>
          <button onClick={() => {
            setSearchTerm('');
            setFilterType('all');
            setFilterDepartment('');
            setShowConflicts(false);
          }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Target Card Component
// =============================================================================

interface TargetCardProps {
  target: BulkAssignmentTarget;
  selected: boolean;
  onToggle: () => void;
  assignmentType: AssignmentType;
  operationType: BulkOperationType;
}

const TargetCard: React.FC<TargetCardProps> = ({
  target,
  selected,
  onToggle,
  assignmentType,
  operationType
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTypeIcon = (type: string) => {
    const icons = {
      'user': '👤',
      'team': '👥',
      'service': '⚙️',
      'role': '🎭'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const currentAssignments = target.currentAssignments?.filter(
    assignment => assignment.assignmentType === assignmentType
  ) || [];

  const conflicts = target.conflicts || [];

  return (
    <div className={`target-card ${selected ? 'selected' : ''}`}>
      <div className="target-header">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="target-checkbox"
        />
        
        <div className="target-info">
          <div className="target-primary">
            <span className="target-icon">{getTypeIcon(target.type)}</span>
            <span className="target-name">{target.name}</span>
            <span className="target-type">{target.type}</span>
          </div>
          
          <div className="target-secondary">
            {target.email && <span className="target-email">{target.email}</span>}
            {target.department && <span className="target-department">{target.department}</span>}
          </div>
        </div>

        <div className="target-indicators">
          {currentAssignments.length > 0 && (
            <span className="assignment-count">
              {currentAssignments.length} current
            </span>
          )}
          
          {conflicts.length > 0 && (
            <span className="conflict-indicator">
              ⚠️ {conflicts.length} conflicts
            </span>
          )}
          
          <button
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="target-details">
          {currentAssignments.length > 0 && (
            <div className="current-assignments">
              <h4>Current Assignments:</h4>
              {currentAssignments.map(assignment => (
                <div key={assignment.id} className="assignment-item">
                  <span>{assignment.resourceName}</span>
                  <span className={`status status-${assignment.status}`}>
                    {assignment.status}
                  </span>
                  {assignment.expiresAt && (
                    <span className="expiry">
                      Expires: {assignment.expiresAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="conflicts">
              <h4>Conflicts:</h4>
              {conflicts.map((conflict, index) => (
                <div key={index} className={`conflict-item severity-${conflict.severity}`}>
                  <span className="conflict-type">{conflict.type}</span>
                  <span className="conflict-description">{conflict.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Action Buttons Component
// =============================================================================

interface BulkAssignmentActionsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onExecute: () => void;
  onReset: () => void;
  isExecuting: boolean;
  readonly: boolean;
}

const BulkAssignmentActions: React.FC<BulkAssignmentActionsProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  onPrevious,
  onNext,
  onExecute,
  onReset,
  isExecuting,
  readonly
}) => {
  return (
    <div className="bulk-assignment-actions">
      <div className="primary-actions">
        {currentStep > 1 && (
          <button
            onClick={onPrevious}
            disabled={readonly || isExecuting}
            className="btn btn-secondary"
          >
            Previous
          </button>
        )}

        {currentStep < totalSteps && (
          <button
            onClick={onNext}
            disabled={!canProceed || readonly || isExecuting}
            className="btn btn-primary"
          >
            Next
          </button>
        )}

        {currentStep === totalSteps && (
          <button
            onClick={onExecute}
            disabled={!canProceed || readonly || isExecuting}
            className="btn btn-success"
          >
            {isExecuting ? 'Executing...' : 'Execute Assignment'}
          </button>
        )}
      </div>

      <div className="secondary-actions">
        <button
          onClick={onReset}
          disabled={readonly || isExecuting}
          className="btn btn-outline"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Placeholder components for remaining steps
const ResourceSelectionStep: React.FC<unknown> = () => <div>Resource Selection Step - To be implemented</div>;
const ParametersConfigurationStep: React.FC<unknown> = () => <div>Parameters Configuration Step - To be implemented</div>;
const ConflictResolutionStep: React.FC<unknown> = () => <div>Conflict Resolution Step - To be implemented</div>;
const ExecutionStep: React.FC<unknown> = () => <div>Execution Step - To be implemented</div>;

export default BulkAssignmentTools;