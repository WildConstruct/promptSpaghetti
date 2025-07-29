/**
 * Funnel Configuration System - Story 30.2 Task 5
 * 
 * Advanced funnel configuration interface with drag-and-drop step management,
 * conditional logic setup, success criteria definition, and real-time validation.
 * 
 * Features:
 * - Visual funnel step builder with drag-and-drop
 * - Conditional path configuration
 * - Advanced event criteria matching
 * - Success metrics definition
 * - Real-time funnel validation
 * - Template-based funnel creation
 * - Import/export capabilities
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ConversionFunnelDefinition, 
  ConversionStep, 
  StepType,
  FunnelCategory,
  EventCriteria,
  PropertyMatcher,
  ValueConstraint,
  ContextRequirement,
  StepCondition,
  ConditionalPath,
  SuccessCriteria,
  SegmentationRule,
  BenchmarkData
} from '../../analytics/ConversionDataModel';

// Configuration interfaces

export interface FunnelConfigurationProps {
  initialFunnel?: Partial<ConversionFunnelDefinition>;
  templates?: FunnelTemplate;
  availableEvents?: EventDefinition;
  availableProperties?: PropertyDefinition;
  onSave?: (funnel: ConversionFunnelDefinition) => void;
  onCancel?: () => void;
  onValidation?: (isValid: boolean, errors: ValidationError) => void;
}
export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  category: FunnelCategory;
  steps: Partial<ConversionStep>[];
  defaultConfiguration: Partial<ConversionFunnelDefinition>;
  tags: string;
}
export interface EventDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  properties: PropertyDefinition;
  examples: unknown;
}
export interface PropertyDefinition {
  path: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description: string;
  possibleValues?: unknown;
  validation?: PropertyValidation;
}
export interface PropertyValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
}
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}
export interface DragItem {
  type: 'step' | 'condition' | 'path';
  id: string;
  data: Record<string, unknown>;
  /**
  * Main Funnel Configuration Component
  */
}
export const FunnelConfiguration: React.FC<FunnelConfigurationProps> = ({)
  initialFunnel,
  templates = [],
  availableEvents = [],
  availableProperties = [],
  onSave,
  onCancel,
  onValidation
}) => {
  const [funnel, setFunnel] = useState<Partial<ConversionFunnelDefinition>>({)
  id: '',
  name: '',
  description: '',
  category: 'acquisition',
  version: '1.0.0',
  configuration: {
  timeWindow: 86400000, // 24 hours,
  allowBacktracking: false,
  requireSequentialSteps: true,
  enableParallelPaths: false,
  dropOffGracePeriod: 300000 // 5 minutes,
},
  steps: [],
    conditionalPaths: [],
    successCriteria: {
  primary: {;
  stepId: '',
        requirements: { operator: 'AND', conditions: [] },
        weight: 1.0;
  },
  secondary: [],
      scoreCalculation: { method: 'weighted' }
  },
  analytics: {
  enableRealTimeTracking: true,
  retentionPeriod: 90,
  cohortTrackingEnabled: true,
  segmentationRules: [],
},
  metadata: {
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'current-user',
  tags: [],
  businessContext: '',
  expectedConversionRate: 0,
}
    ...initialFunnel
  });
  const [activeTab, setActiveTab] = useState<'basic' | 'steps' | 'conditions' | 'success' | 'analytics'>('basic');
  const [validationErrors, setValidationErrors] = useState<ValidationError>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  // Validation
  const validateFunnel = useCallback((funnelData: Partial<ConversionFunnelDefinition>): ValidationError => {
  const errors: ValidationError = [];
  // Basic validation
  if (!funnelData.name?.trim()) {
  errors.push({)
  field: 'name',
  message: 'Funnel name is required',
  severity: 'error',
});
    if (!funnelData.description?.trim()) {
  errors.push({)
  field: 'description',
  message: 'Funnel description is required',
  severity: 'error',
});
    // Steps validation
    if (!funnelData.steps || funnelData.steps.length < 2) {
  errors.push({)
  field: 'steps',
  message: 'Funnel must have at least 2 steps',
  severity: 'error',
});
    if (funnelData.steps) {
      // Check for duplicate step orders
      const orders = funnelData.steps.map(s => s.order);
      const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
      if (duplicateOrders.length > 0) {
        errors.push({)
  field: 'steps',
          message: `Duplicate step orders found: ${duplicateOrders.join(', ')}`}
},
  severity: 'error'
  });
      // Validate each step
      funnelData.steps.forEach((step, index) => {
        if (!step.name?.trim()) {
          errors.push({)
  field: `steps[${index}].name`}
},
  message: `Step ${index + 1} name is required`}
},
  severity: 'error'
  });
        if (!step.eventCriteria?.eventType) {
          errors.push({)
  field: `steps[${index}].eventCriteria`}
},
  message: `Step ${index + 1} must have event criteria`}
},
  severity: 'error'
  });
        // Validate time constraints
        if (step.timeConstraints?.minTimeFromPrevious && step.timeConstraints?.maxTimeFromPrevious) {
          if (step.timeConstraints.minTimeFromPrevious > step.timeConstraints.maxTimeFromPrevious) {
            errors.push({)
  field: `steps[${index}].timeConstraints`}
},
  message: `Step ${index + 1}: Min time cannot be greater than max time`}
},
  severity: 'error'
  });
      });
    // Success criteria validation
    if (funnelData.successCriteria?.primary && !funnelData.successCriteria.primary.stepId) {
  errors.push({)
  field: 'successCriteria.primary.stepId',
  message: 'Primary success criteria must specify a step',
  severity: 'error',
});
    return errors;
  }, []);
  // Real-time validation
  useEffect(() => {
    const errors = validateFunnel(funnel);
    setValidationErrors(errors);
    onValidation?.(errors.filter(e => e.severity === 'error').length === 0, errors);
  }, [funnel, validateFunnel, onValidation]);
  // Handlers
  const handleBasicInfoChange = useCallback((field: string, value: Error) => {
  setFunnel(prev => ({)
  ...prev,
  [field]: value,
  metadata: {
  ...prev.metadata!,
  updatedAt: Date.now(),
}));
  }, []);
  const handleConfigurationChange = useCallback((field: string, value: Error) => {
  setFunnel(prev => ({)
  ...prev,
  configuration: {
  ...prev.configuration!,
  [field]: value,
},
  metadata: {
  ...prev.metadata!,
  updatedAt: Date.now(),
}));
  }, []);
  const handleStepAdd = useCallback(() => {
    const newStep: ConversionStep = {,
  id: `step-${Date.now()}`}
},
  name: `Step ${(funnel.steps?.length || 0) + 1}`}
},
  description: '',
      order: (funnel.steps?.length || 0) + 1,
      type: 'engagement',
      isRequired: true,
      isTerminal: false,
      eventCriteria: {
  eventType: '',
  propertyMatchers: [],
},
  conditions: [],
      timeConstraints: {},
      successMetrics: {
  expectedCompletionRate: 50,
  averageTimeToComplete: 60000,
  criticalSuccessFactors: [],
},
  branches: [],
      metadata: {
  businessValue: 1,
  complexity: 'medium',
  dependencies: [],
  optimizationOpportunities: [],
};
    setFunnel(prev => ({)
  ...prev,
  steps: [...(prev.steps || []), newStep],
}));
  }, [funnel.steps]);
  const handleStepUpdate = useCallback((stepId: string, updates: Partial<ConversionStep>) => {
    setFunnel(prev => ({)
  ...prev,
      steps: prev.steps?.map(step => ),
        step.id === stepId ? { ...step, ...updates } : step
    }));
  }, []);
  const handleStepDelete = useCallback((stepId: string) => {
  setFunnel(prev => ({)
  ...prev,
  steps: prev.steps?.filter(step => step.id !== stepId),
}));
  }, []);
  const handleStepReorder = useCallback((fromIndex: number, toIndex: number) => {
  setFunnel(prev => {)
  const steps = [...(prev.steps || [])];
  const [movedStep] = steps.splice(fromIndex, 1);
  steps.splice(toIndex, 0, movedStep);
  // Update order values
  const reorderedSteps = steps.map((step, index) => ({)
  ...step,
  order: index + 1,
}));
      return {
  ...prev,
  steps: reorderedSteps,
};
    });
  }, []);
  const handleTemplateApply = useCallback((template: FunnelTemplate) => {
    setFunnel(prev => ({)
  ...prev,
      ...template.defaultConfiguration,
      name: template.name,
      description: template.description,
      category: template.category,
      steps: template.steps.map((stepTemplate, index) => ({)
  id: `step-${Date.now()}-${index}`}
},
  name: stepTemplate.name || `Step ${index + 1}`}
},
  description: stepTemplate.description || '',
        order: index + 1,
        type: stepTemplate.type || 'engagement',
        isRequired: stepTemplate.isRequired ?? true,
        isTerminal: stepTemplate.isTerminal ?? false,
        eventCriteria: stepTemplate.eventCriteria || {,
  eventType: '',
  propertyMatchers: [],
},
  conditions: stepTemplate.conditions || [],
        timeConstraints: stepTemplate.timeConstraints || {},
        successMetrics: stepTemplate.successMetrics || {,
  expectedCompletionRate: 50,
  averageTimeToComplete: 60000,
  criticalSuccessFactors: [],
},
  branches: stepTemplate.branches || [],
        metadata: stepTemplate.metadata || {,
  businessValue: 1,
  complexity: 'medium',
  dependencies: [],
  optimizationOpportunities: [],
})),
      metadata: {
  ...prev.metadata!,
  tags: template.tags,
  updatedAt: Date.now(),
}));
    setShowTemplateModal(false);
  }, []);
  const handleSave = useCallback(() => {
    const errors = validateFunnel(funnel);
    const criticalErrors = errors.filter(e => e.severity === 'error');
    if (criticalErrors.length === 0 && funnel.id && funnel.name) {
      onSave?.(funnel as ConversionFunnelDefinition);
  }, [funnel, validateFunnel, onSave]);
  const isValid = validationErrors.filter(e => e.severity === 'error').length === 0;
  return;
    <div className="funnel-configuration">
      <div className="configuration-header">
        <h2>Funnel Configuration</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="template-button"
          >
            Use Template
          </button>
          <button 
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!isValid}
            className="save-button"
          >
            Save Funnel
          </button>
        </div>
      </div>
      <div className="configuration-tabs">
        {(['basic', 'steps', 'conditions', 'success', 'analytics'] as const).map(tab => ()
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="configuration-content">
        {validationErrors.length > 0 && ()
          <ValidationPanel errors={validationErrors} />
        )}
        {activeTab === 'basic' && ()
          <BasicConfiguration
            funnel={funnel}
            onChange={handleBasicInfoChange}
            onConfigChange={handleConfigurationChange}
          />
        )}
        {activeTab === 'steps' && ()
          <StepsConfiguration
            steps={funnel.steps || []}
            availableEvents={availableEvents}
            availableProperties={availableProperties}
            onStepAdd={handleStepAdd}
            onStepUpdate={handleStepUpdate}
            onStepDelete={handleStepDelete}
            onStepReorder={handleStepReorder}
            draggedItem={draggedItem}
            onDragStart={setDraggedItem}
            onDragEnd={() => setDraggedItem(null)}
          />
        )}
        {activeTab === 'conditions' && ()
          <ConditionalPathsConfiguration
            paths={funnel.conditionalPaths || []}
            steps={funnel.steps || []}
            onChange={(paths) => setFunnel(prev => ({ ...prev, conditionalPaths: paths }))}
          />
        )}
        {activeTab === 'success' && ()
          <SuccessCriteriaConfiguration
            criteria={funnel.successCriteria}
            steps={funnel.steps || []}
            onChange={(criteria) => setFunnel(prev => ({ ...prev, successCriteria: criteria }))}
          />
        )}
        {activeTab === 'analytics' && ()
          <AnalyticsConfiguration
            analytics={funnel.analytics}
            onChange={(analytics) => setFunnel(prev => ({ ...prev, analytics }))}
          />
        )}
      </div>
      {showTemplateModal && ()
        <TemplateSelectionModal
          templates={templates}
          onSelect={handleTemplateApply}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
};
/**
 * Validation Panel Component
 */
interface ValidationPanelProps {
  errors: ValidationError;
const ValidationPanel: React.FC<ValidationPanelProps> = ({ errors }) => {
  const errorsByField = useMemo(() => {
    return errors.reduce((acc, error) => {
      if (!acc[error.field]) acc[error.field] = [];
      acc[error.field].push(error);
      return acc;
    }, {} as Record<string, ValidationError>);
  }, [errors]);
  return;
    <div className="validation-panel">
      <h4>Validation Results</h4>
      {Object.entries(errorsByField).map(([field, fieldErrors]) => ()
        <div key={field} className="validation-field">
          <strong>{field}:</strong>
          {fieldErrors.map((error, index) => ()
            <div key={index} className={`validation-error ${error.severity}`}>}
              <span className="error-message">{error.message}</span>
              {error.suggestion && ()
                <span className="error-suggestion">{error.suggestion}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
/**
 * Basic Configuration Component
 */
interface BasicConfigurationProps {
  funnel: Partial<ConversionFunnelDefinition>;
  onChange: (field: string, value: Error) => void;
  onConfigChange: (field: string, value: Error) => void;
  const BasicConfiguration: React.FC<BasicConfigurationProps> = ({,)
  funnel,
  onChange,
  onConfigChange
}) => {
  return;
    <div className="basic-configuration">
      <div className="form-section">
        <h3>Funnel Information</h3>
        <div className="form-group">
          <label htmlFor="funnel-name">Name *</label>
          <input
            id="funnel-name"
            type="text"
            value={funnel.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Enter funnel name..."
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="funnel-description">Description *</label>
          <textarea
            id="funnel-description"
            value={funnel.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Describe the purpose and goals of this funnel..."
            className="form-textarea"
            rows={3}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="funnel-category">Category</label>
            <select
              id="funnel-category"
              value={funnel.category || 'acquisition'}
              onChange={(e) => onChange('category', e.target.value)}
              className="form-select"
            >
              <option value="acquisition">Acquisition</option>
              <option value="activation">Activation</option>
              <option value="engagement">Engagement</option>
              <option value="monetization">Monetization</option>
              <option value="retention">Retention</option>
              <option value="referral">Referral</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="funnel-version">Version</label>
            <input
              id="funnel-version"
              type="text"
              value={funnel.version || '1.0.0'}
              onChange={(e) => onChange('version', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="business-context">Business Context</label>
          <textarea
            id="business-context"
            value={funnel.metadata?.businessContext || ''}
            onChange={(e) => onChange('metadata', { ...funnel.metadata, businessContext: e.target.value })}
            placeholder="Provide business context and goals for this funnel..."
            className="form-textarea"
            rows={2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="expected-conversion">Expected Conversion Rate (%)</label>
          <input
            id="expected-conversion"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={funnel.metadata?.expectedConversionRate || 0}
            onChange={(e) => onChange('metadata', { )
              ...funnel.metadata, 
              expectedConversionRate: parseFloat(e.target.value) || 0 ;
  })}
            className="form-input"
          />
        </div>
      </div>
      <div className="form-section">
        <h3>Configuration</h3>
        <div className="form-group">
          <label htmlFor="time-window">Time Window (hours)</label>
          <input
            id="time-window"
            type="number"
            min="1"
            value={(funnel.configuration?.timeWindow || 86400000) / 3600000}
            onChange={(e) => onConfigChange('timeWindow', parseInt(e.target.value) * 3600000)}
            className="form-input"
          />
          <small className="form-help">Maximum time allowed for users to complete the funnel</small>
        </div>
        <div className="form-group">
          <label htmlFor="grace-period">Drop-off Grace Period (minutes)</label>
          <input
            id="grace-period"
            type="number"
            min="0"
            value={(funnel.configuration?.dropOffGracePeriod || 300000) / 60000}
            onChange={(e) => onConfigChange('dropOffGracePeriod', parseInt(e.target.value) * 60000)}
            className="form-input"
          />
          <small className="form-help">Grace period before considering a user as dropped off</small>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={funnel.configuration?.allowBacktracking || false}
              onChange={(e) => onConfigChange('allowBacktracking', e.target.checked)}
            />
            Allow Backtracking
          </label>
          <small className="form-help">Allow users to go back to previous steps</small>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={funnel.configuration?.requireSequentialSteps || true}
              onChange={(e) => onConfigChange('requireSequentialSteps', e.target.checked)}
            />
            Require Sequential Steps
          </label>
          <small className="form-help">Users must complete steps in order</small>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={funnel.configuration?.enableParallelPaths || false}
              onChange={(e) => onConfigChange('enableParallelPaths', e.target.checked)}
            />
            Enable Parallel Paths
          </label>
          <small className="form-help">Allow multiple paths through the funnel</small>
        </div>
      </div>
    </div>
  );
};
/**
 * Steps Configuration Component
 */
interface StepsConfigurationProps {
  steps: ConversionStep;
  availableEvents: EventDefinition;
  availableProperties: PropertyDefinition;
  onStepAdd: () => void;
  onStepUpdate: (stepId: string, updates: Partial<ConversionStep>) => void;
  onStepDelete: (stepId: string) => void;
  onStepReorder: (fromIndex: number, toIndex: number) => void;
  draggedItem: DragItem | null;
  onDragStart: (item: DragItem) => void;
  onDragEnd: () => void;
  const StepsConfiguration: React.FC<StepsConfigurationProps> = ({,)
  steps,
  availableEvents,
  availableProperties,
  onStepAdd,
  onStepUpdate,
  onStepDelete,
  onStepReorder,
  draggedItem,
  onDragStart,
  onDragEnd
}) => {
  return;
    <div className="steps-configuration">
      <div className="steps-header">
        <h3>Funnel Steps</h3>
        <button onClick={onStepAdd} className="add-step-button">
          Add Step
        </button>
      </div>
      <div className="steps-list">
        {steps.map((step, index) => ()
          <StepEditor
            key={step.id}
            step={step}
            index={index}
            availableEvents={availableEvents}
            availableProperties={availableProperties}
            onUpdate={(updates) => onStepUpdate(step.id, updates)}
            onDelete={() => onStepDelete(step.id)}
            onReorder={onStepReorder}
            draggedItem={draggedItem}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
      {steps.length === 0 && ()
        <div className="empty-state">
          <p>No steps configured yet. Add your first step to get started.</p>
          <button onClick={onStepAdd} className="add-first-step-button">
            Add First Step
          </button>
        </div>
      )}
    </div>
  );
};
/**
 * Step Editor Component
 */
interface StepEditorProps {
  step: ConversionStep;
  index: number;
  availableEvents: EventDefinition;
  availableProperties: PropertyDefinition;
  onUpdate: (updates: Partial<ConversionStep>) => void;
  onDelete: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  draggedItem: DragItem | null;
  onDragStart: (item: DragItem) => void;
  onDragEnd: () => void;
  const StepEditor: React.FC<StepEditorProps> = ({,)
  step,
  index,
  availableEvents,
  availableProperties,
  onUpdate,
  onDelete,
  onReorder,
  draggedItem,
  onDragStart,
  onDragEnd
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart({)
  type: 'step',
      id: step.id,
      data: { step, index }
    });
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem?.type === 'step' && draggedItem.data.index !== index) {
      onReorder(draggedItem.data.index, index);
    onDragEnd();
  };
  return;
    <div 
      className="step-editor"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="step-header">
        <div className="step-handle">⋮⋮</div>
        <div className="step-info">
          <div className="step-name">{step.name}</div>
          <div className="step-type">{step.type}</div>
        </div>
        <div className="step-actions">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-button"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button onClick={onDelete} className="delete-button">
            ×
          </button>
        </div>
      </div>
      {isExpanded && ()
        <div className="step-content">
          <div className="form-row">
            <div className="form-group">
              <label>Step Name</label>
              <input
                type="text"
                value={step.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Step Type</label>
              <select
                value={step.type}
                onChange={(e) => onUpdate({ type: e.target.value as StepType })}
                className="form-select"
              >
                <option value="entry_point">Entry Point</option>
                <option value="engagement">Engagement</option>
                <option value="decision_point">Decision Point</option>
                <option value="action">Action</option>
                <option value="validation">Validation</option>
                <option value="conversion">Conversion</option>
                <option value="exit_point">Exit Point</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={step.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="form-textarea"
              rows={2}
            />
          </div>
          <EventCriteriaEditor
            criteria={step.eventCriteria}
            availableEvents={availableEvents}
            availableProperties={availableProperties}
            onChange={(eventCriteria) => onUpdate({ eventCriteria })}
          />
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={step.isRequired}
                  onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                />
                Required Step
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={step.isTerminal}
                  onChange={(e) => onUpdate({ isTerminal: e.target.checked })}
                />
                Terminal Step
              </label>
            </div>
          </div>
          <TimeConstraintsEditor
            constraints={step.timeConstraints}
            onChange={(timeConstraints) => onUpdate({ timeConstraints })}
          />
        </div>
      )}
    </div>
  );
};
/**
 * Event Criteria Editor Component
 */
interface EventCriteriaEditorProps {
  criteria: EventCriteria;
  availableEvents: EventDefinition;
  availableProperties: PropertyDefinition;
  onChange: (criteria: EventCriteria) => void;
  const EventCriteriaEditor: React.FC<EventCriteriaEditorProps> = ({,)
  criteria,
  availableEvents,
  availableProperties,
  onChange
}) => {
  const selectedEvent = availableEvents.find(e => e.type === criteria.eventType);
  return;
    <div className="event-criteria-editor">
      <h4>Event Criteria</h4>
      <div className="form-group">
        <label>Event Type</label>
        <select
          value={criteria.eventType}
          onChange={(e) => onChange({ ...criteria, eventType: e.target.value })}
          className="form-select"
        >
          <option value="">Select event type...</option>
          {availableEvents.map(event => ()
            <option key={event.type} value={event.type}>
              {event.name} ({event.type})
            </option>
          ))}
        </select>
      </div>
      {selectedEvent && ()
        <div className="event-description">
          <p>{selectedEvent.description}</p>
        </div>
      )}
      <div className="form-group">
        <label>Event Pattern (Optional)</label>
        <input
          type="text"
          value={criteria.eventPattern || ''}
          onChange={(e) => onChange({ ...criteria, eventPattern: e.target.value })}
          placeholder="Regular expression pattern..."
          className="form-input"
        />
        <small className="form-help">Use regex pattern for flexible event matching</small>
      </div>
      <PropertyMatchersEditor
        matchers={criteria.propertyMatchers}
        availableProperties={selectedEvent?.properties || availableProperties}
        onChange={(propertyMatchers) => onChange({ ...criteria, propertyMatchers })}
      />
    </div>
  );
};
/**
 * Property Matchers Editor Component
 */
interface PropertyMatchersEditorProps {
  matchers: PropertyMatcher;
  availableProperties: PropertyDefinition;
  onChange: (matchers: PropertyMatcher) => void;
  const PropertyMatchersEditor: React.FC<PropertyMatchersEditorProps> = ({,)
  matchers,
  availableProperties,
  onChange
}) => {
  const addMatcher = () => {
  const newMatcher: PropertyMatcher = {,
  propertyPath: '',
  operator: 'equals',
  value: '',
  caseSensitive: false,
  required: false,
};
    onChange([...matchers, newMatcher]);
  };
  const updateMatcher = (index: number, updates: Partial<PropertyMatcher>) => {
    const newMatchers = matchers.map((matcher, i) => ;
      i === index ? { ...matcher, ...updates } : matcher
    );
    onChange(newMatchers);
  };
  const removeMatcher = (index: number) => {
    onChange(matchers.filter((_, i) => i !== index));
  };
  return;
    <div className="property-matchers-editor">
      <div className="matchers-header">
        <h5>Property Matchers</h5>
        <button onClick={addMatcher} className="add-matcher-button">
          Add Matcher
        </button>
      </div>
      {matchers.map((matcher, index) => ()
        <div key={index} className="property-matcher">
          <div className="form-row">
            <div className="form-group">
              <label>Property</label>
              <select
                value={matcher.propertyPath}
                onChange={(e) => updateMatcher(index, { propertyPath: e.target.value })}
                className="form-select"
              >
                <option value="">Select property...</option>
                {availableProperties.map(prop => ()
                  <option key={prop.path} value={prop.path}>
                    {prop.name} ({prop.path})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Operator</label>
              <select
                value={matcher.operator}
                onChange={(e) => updateMatcher(index, { operator: e.target.value as any })}
                className="form-select"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="startsWith">Starts With</option>
                <option value="endsWith">Ends With</option>
                <option value="matches">Matches Regex</option>
                <option value="exists">Exists</option>
                <option value="in">In List</option>
                <option value="between">Between</option>
              </select>
            </div>
            <div className="form-group">
              <label>Value</label>
              <input
                type="text"
                value={matcher.value}
                onChange={(e) => updateMatcher(index, { value: e.target.value })}
                className="form-input"
              />
            </div>
            <button 
              onClick={() => removeMatcher(index)}
              className="remove-matcher-button"
            >
              ×
            </button>
          </div>
          <div className="matcher-options">
            <label>
              <input
                type="checkbox"
                checked={matcher.caseSensitive || false}
                onChange={(e) => updateMatcher(index, { caseSensitive: e.target.checked })}
              />
              Case Sensitive
            </label>
            <label>
              <input
                type="checkbox"
                checked={matcher.required || false}
                onChange={(e) => updateMatcher(index, { required: e.target.checked })}
              />
              Required
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};
/**
 * Time Constraints Editor Component
 */
interface TimeConstraintsEditorProps {
  constraints: ConversionStep['timeConstraints'];
  onChange: (constraints: ConversionStep['timeConstraints']) => void;
  const TimeConstraintsEditor: React.FC<TimeConstraintsEditorProps> = ({,)
  constraints,
  onChange
}) => {
  return;
    <div className="time-constraints-editor">
      <h5>Time Constraints</h5>
      <div className="form-row">
        <div className="form-group">
          <label>Min Time from Previous (seconds)</label>
          <input
            type="number"
            min="0"
            value={constraints.minTimeFromPrevious ? constraints.minTimeFromPrevious / 1000 : ''}
            onChange={(e) => onChange({)
  ...constraints,
  minTimeFromPrevious: e.target.value ? parseInt(e.target.value) * 1000 : undefined,
})}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Max Time from Previous (seconds)</label>
          <input
            type="number"
            min="0"
            value={constraints.maxTimeFromPrevious ? constraints.maxTimeFromPrevious / 1000 : ''}
            onChange={(e) => onChange({)
  ...constraints,
  maxTimeFromPrevious: e.target.value ? parseInt(e.target.value) * 1000 : undefined,
})}
            className="form-input"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Max Time from Start (seconds)</label>
        <input
          type="number"
          min="0"
          value={constraints.maxTimeFromStart ? constraints.maxTimeFromStart / 1000 : ''}
          onChange={(e) => onChange({)
  ...constraints,
  maxTimeFromStart: e.target.value ? parseInt(e.target.value) * 1000 : undefined,
})}
          className="form-input"
        />
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const ConditionalPathsConfiguration: React.FC<unknown> = () => ()
  <div>Conditional Paths Configuration (TODO: Implement)</div>
);
const SuccessCriteriaConfiguration: React.FC<unknown> = () => ()
  <div>Success Criteria Configuration (TODO: Implement)</div>
);
const AnalyticsConfiguration: React.FC<unknown> = () => ()
  <div>Analytics Configuration (TODO: Implement)</div>
);
/**
 * Template Selection Modal
 */
interface TemplateSelectionModalProps {
  templates: FunnelTemplate;
  onSelect: (template: FunnelTemplate) => void;
  onClose: () => void;
  const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({,)
  templates,
  onSelect,
  onClose
}) => {
  return;
    <div className="modal-overlay">
      <div className="template-modal">
        <div className="modal-header">
          <h3>Choose Funnel Template</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="template-grid">
          {templates.map(template => ()
            <div key={template.id} className="template-card">
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <div className="template-meta">
                  <span className="category">{template.category}</span>
                  <span className="steps-count">{template.steps.length} steps</span>
                </div>
                <div className="template-tags">
                  {template.tags.map(tag => ()
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => onSelect(template)}
                className="use-template-button"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
        {templates.length === 0 && ()
          <div className="empty-templates">
            <p>No templates available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelConfiguration;