import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useState, useCallback, useEffect, useMemo } from 'react';
export const FunnelConfiguration = ({
    initialFunnel,
    templates = [],
    availableEvents = [],
    availableProperties = [],
    onSave,
    onCancel,
    onValidation
});
{
    const [funnel, setFunnel] = useState({});
    id: '',
        name;
    '',
        description;
    '',
        category;
    'acquisition',
        version;
    '1.0.0',
        configuration;
    {
        timeWindow: 86400000, // 24 hours,
            allowBacktracking;
        false,
            requireSequentialSteps;
        true,
            enableParallelPaths;
        false,
            dropOffGracePeriod;
        300000; // 5 minutes,
    }
    steps: [],
        conditionalPaths;
    [],
        successCriteria;
    {
        primary: {
            ;
            stepId: '',
                requirements;
            {
                operator: 'AND', conditions;
                [];
            }
            weight: 1.0;
        }
        secondary: [],
            scoreCalculation;
        {
            method: 'weighted';
        }
    }
    analytics: {
        enableRealTimeTracking: true,
            retentionPeriod;
        90,
            cohortTrackingEnabled;
        true,
            segmentationRules;
        [],
        ;
    }
    metadata: {
        createdAt: Date.now(),
            updatedAt;
        Date.now(),
            createdBy;
        'current-user',
            tags;
        [],
            businessContext;
        '',
            expectedConversionRate;
        0,
        ;
    }
    initialFunnel;
}
;
const [activeTab, setActiveTab] = useState('basic');
const [validationErrors, setValidationErrors] = useState([]);
const [draggedItem, setDraggedItem] = useState(null);
const [showTemplateModal, setShowTemplateModal] = useState(false);
// Validation
const validateFunnel = useCallback((funnelData) => {
    const errors = [];
    // Basic validation
    if (!funnelData.name?.trim()) {
        errors.push({});
        field: 'name',
            message;
        'Funnel name is required',
            severity;
        'error',
        ;
    }
});
if (!funnelData.description?.trim()) {
    errors.push({});
    field: 'description',
        message;
    'Funnel description is required',
        severity;
    'error',
    ;
}
;
// Steps validation
if (!funnelData.steps || funnelData.steps.length < 2) {
    errors.push({});
    field: 'steps',
        message;
    'Funnel must have at least 2 steps',
        severity;
    'error',
    ;
}
;
if (funnelData.steps) {
    // Check for duplicate step orders
    const orders = funnelData.steps.map(s => s.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
        errors.push({});
        field: 'steps',
            message;
        `Duplicate step orders found: ${duplicateOrders.join(', ')}`;
    }
}
severity: 'error';
;
// Validate each step
funnelData.steps.forEach((step, index) => {
    if (!step.name?.trim()) {
        errors.push({});
        field: `steps[${index}].name`;
    }
}, message, `Step ${index + 1} name is required`, severity, 'error');
if (!step.eventCriteria?.eventType) {
    errors.push({});
    field: `steps[${index}].eventCriteria`;
}
message: `Step ${index + 1} must have event criteria`;
severity: 'error';
;
// Validate time constraints
if (step.timeConstraints?.minTimeFromPrevious && step.timeConstraints?.maxTimeFromPrevious) {
    if (step.timeConstraints.minTimeFromPrevious > step.timeConstraints.maxTimeFromPrevious) {
        errors.push({});
        field: `steps[${index}].timeConstraints`;
    }
}
message: `Step ${index + 1}: Min time cannot be greater than max time`;
severity: 'error';
;
;
// Success criteria validation
if (funnelData.successCriteria?.primary && !funnelData.successCriteria.primary.stepId) {
    errors.push({});
    field: 'successCriteria.primary.stepId',
        message;
    'Primary success criteria must specify a step',
        severity;
    'error',
    ;
}
;
return errors;
[];
;
// Real-time validation
useEffect(() => {
    const errors = validateFunnel(funnel);
    setValidationErrors(errors);
    onValidation?.(errors.filter(e => e.severity === 'error').length === 0, errors);
}, [funnel, validateFunnel, onValidation]);
// Handlers
const handleBasicInfoChange = useCallback((field, value) => {
    setFunnel(prev => ({}), ...prev, [field], value, metadata, {
        ...prev.metadata,
        updatedAt: Date.now(),
    });
});
[];
;
const handleConfigurationChange = useCallback((field, value) => {
    setFunnel(prev => ({}), ...prev, configuration, {
        ...prev.configuration,
        [field]: value,
    }, metadata, {
        ...prev.metadata,
        updatedAt: Date.now(),
    });
});
[];
;
const handleStepAdd = useCallback(() => {
    const newStep = {
        id: `step-${Date.now()}` };
}, name, `Step ${(funnel.steps?.length || 0) + 1}`);
description: '',
    order;
(funnel.steps?.length || 0) + 1,
    type;
'engagement',
    isRequired;
true,
    isTerminal;
false,
    eventCriteria;
{
    eventType: '',
        propertyMatchers;
    [],
    ;
}
conditions: [],
    timeConstraints;
{ }
successMetrics: {
    expectedCompletionRate: 50,
        averageTimeToComplete;
    60000,
        criticalSuccessFactors;
    [],
    ;
}
branches: [],
    metadata;
{
    businessValue: 1,
        complexity;
    'medium',
        dependencies;
    [],
        optimizationOpportunities;
    [],
    ;
}
;
setFunnel(prev => ({}), ...prev, steps, [...(prev.steps || []), newStep]);
;
[funnel.steps];
;
const handleStepUpdate = useCallback((stepId, updates) => {
    setFunnel(prev => ({}), ...prev, steps, prev.steps?.map(step => ), step.id === stepId ? { ...step, ...updates } : step);
});
[];
;
const handleStepDelete = useCallback((stepId) => {
    setFunnel(prev => ({}), ...prev, steps, prev.steps?.filter(step => step.id !== stepId));
});
[];
;
const handleStepReorder = useCallback((fromIndex, toIndex) => {
    setFunnel(prev => { });
    const steps = [...(prev.steps || [])];
    const [movedStep] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, movedStep);
    // Update order values
    const reorderedSteps = steps.map((step, index) => ({}), ...step, order, index + 1);
});
return {
    ...prev,
    steps: reorderedSteps,
};
;
[];
;
const handleTemplateApply = useCallback((template) => {
    setFunnel(prev => ({}), ...prev, ...template.defaultConfiguration, name, template.name, description, template.description, category, template.category, steps, template.steps.map((stepTemplate, index) => ({}), id, `step-${Date.now()}-${index}`));
});
name: stepTemplate.name || `Step ${index + 1}`;
description: stepTemplate.description || '',
    order;
index + 1,
    type;
stepTemplate.type || 'engagement',
    isRequired;
stepTemplate.isRequired ?? true,
    isTerminal;
stepTemplate.isTerminal ?? false,
    eventCriteria;
stepTemplate.eventCriteria || {
    eventType: '',
    propertyMatchers: [],
},
    conditions;
stepTemplate.conditions || [],
    timeConstraints;
stepTemplate.timeConstraints || {},
    successMetrics;
stepTemplate.successMetrics || {
    expectedCompletionRate: 50,
    averageTimeToComplete: 60000,
    criticalSuccessFactors: [],
},
    branches;
stepTemplate.branches || [],
    metadata;
stepTemplate.metadata || {
    businessValue: 1,
    complexity: 'medium',
    dependencies: [],
    optimizationOpportunities: [],
};
metadata: {
    prev.metadata,
        tags;
    template.tags,
        updatedAt;
    Date.now(),
    ;
}
;
setShowTemplateModal(false);
[];
;
const handleSave = useCallback(() => {
    const errors = validateFunnel(funnel);
    const criticalErrors = errors.filter(e => e.severity === 'error');
    if (criticalErrors.length === 0 && funnel.id && funnel.name) {
        onSave?.(funnel);
    }
    [funnel, validateFunnel, onSave];
});
const isValid = validationErrors.filter(e => e.severity === 'error').length === 0;
return;
_jsxs("div", { className: "funnel-configuration", children: [_jsxs("div", { className: "configuration-header", children: [_jsx("h2", { children: "Funnel Configuration" }), _jsxs("div", { className: "header-actions", children: [_jsx("button", { onClick: () => setShowTemplateModal(true), className: "template-button", children: "Use Template" }), _jsx("button", { onClick: onCancel, className: "cancel-button", children: "Cancel" }), _jsx("button", { onClick: handleSave, disabled: !isValid, className: "save-button", children: "Save Funnel" })] })] }), _jsxs("div", { className: "configuration-tabs", children: [['basic', 'steps', 'conditions', 'success', 'analytics'].map(tab => ()
                    < button, key = { tab }, onClick = {}()), " => setActiveTab(tab)} className=", `tab-button ${activeTab === tab ? 'active' : ''}`, ">", tab.charAt(0).toUpperCase() + tab.slice(1)] }), "))}"] })
    ,
        _jsxs("div", { className: "configuration-content", children: [validationErrors.length > 0 && ()
                    < ValidationPanel, " errors=", validationErrors, " /> )}", activeTab === 'basic' && ()
                    < BasicConfiguration, "funnel=", funnel, "onChange=", handleBasicInfoChange, "onConfigChange=", handleConfigurationChange, "/> )}", activeTab === 'steps' && ()
                    < StepsConfiguration, "steps=", funnel.steps || [], "availableEvents=", availableEvents, "availableProperties=", availableProperties, "onStepAdd=", handleStepAdd, "onStepUpdate=", handleStepUpdate, "onStepDelete=", handleStepDelete, "onStepReorder=", handleStepReorder, "draggedItem=", draggedItem, "onDragStart=", setDraggedItem, "onDragEnd=", () => setDraggedItem(null), "/> )}", activeTab === 'conditions' && ()
                    < ConditionalPathsConfiguration, "paths=", funnel.conditionalPaths || [], "steps=", funnel.steps || [], "onChange=", (paths) => setFunnel(prev => ({ ...prev, conditionalPaths: paths })), "/> )}", activeTab === 'success' && ()
                    < SuccessCriteriaConfiguration, "criteria=", funnel.successCriteria, "steps=", funnel.steps || [], "onChange=", (criteria) => setFunnel(prev => ({ ...prev, successCriteria: criteria })), "/> )}", activeTab === 'analytics' && ()
                    < AnalyticsConfiguration, "analytics=", funnel.analytics, "onChange=", (analytics) => setFunnel(prev => ({ ...prev, analytics })), "/> )}"] });
{
    showTemplateModal && ()
        < TemplateSelectionModal;
    templates = { templates };
    onSelect = { handleTemplateApply };
    onClose = {}();
    setShowTemplateModal(false);
}
/>;
div >
;
;
;
const ValidationPanel = ({ errors }) => {
    const errorsByField = useMemo(() => {
        return errors.reduce((acc, error) => {
            if (!acc[error.field])
                acc[error.field] = [];
            acc[error.field].push(error);
            return acc;
        }, {});
    }, [errors]);
    return;
    _jsxs("div", { className: "validation-panel", children: [_jsx("h4", { children: "Validation Results" }), Object.entries(errorsByField).map(([field, fieldErrors]) => ()
                < div, key = { field }, className = "validation-field" >
                _jsxs("strong", { children: [field, ":"] }), { fieldErrors, : .map((error, index) => ()
                    < div, key = { index }, className = {} `validation-error ${error.severity}`) } > ), _jsx("span", { className: "error-message", children: error.message }), error.suggestion && ()
                < span, " className=\"error-suggestion\">", error.suggestion] });
};
div >
;
div >
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "basic-configuration", children: [_jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Funnel Information" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "funnel-name", children: "Name *" }), _jsx("input", { id: "funnel-name", type: "text", value: funnel.name || '', onChange: (e) => onChange('name', e.target.value), placeholder: "Enter funnel name...", className: "form-input" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "funnel-description", children: "Description *" }), _jsx("textarea", { id: "funnel-description", value: funnel.description || '', onChange: (e) => onChange('description', e.target.value), placeholder: "Describe the purpose and goals of this funnel...", className: "form-textarea", rows: 3 })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "funnel-category", children: "Category" }), _jsxs("select", { id: "funnel-category", value: funnel.category || 'acquisition', onChange: (e) => onChange('category', e.target.value), className: "form-select", children: [_jsx("option", { value: "acquisition", children: "Acquisition" }), _jsx("option", { value: "activation", children: "Activation" }), _jsx("option", { value: "engagement", children: "Engagement" }), _jsx("option", { value: "monetization", children: "Monetization" }), _jsx("option", { value: "retention", children: "Retention" }), _jsx("option", { value: "referral", children: "Referral" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "funnel-version", children: "Version" }), _jsx("input", { id: "funnel-version", type: "text", value: funnel.version || '1.0.0', onChange: (e) => onChange('version', e.target.value), className: "form-input" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "business-context", children: "Business Context" }), _jsx("textarea", { id: "business-context", value: funnel.metadata?.businessContext || '', onChange: (e) => onChange('metadata', { ...funnel.metadata, businessContext: e.target.value }), placeholder: "Provide business context and goals for this funnel...", className: "form-textarea", rows: 2 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "expected-conversion", children: "Expected Conversion Rate (%)" }), _jsx("input", { id: "expected-conversion", type: "number", min: "0", max: "100", step: "0.1", value: funnel.metadata?.expectedConversionRate || 0, onChange: (e) => onChange('metadata', {}) }), "...funnel.metadata, expectedConversionRate: parseFloat(e.target.value) || 0 ; })} className=\"form-input\" />"] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Configuration" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "time-window", children: "Time Window (hours)" }), _jsx("input", { id: "time-window", type: "number", min: "1", value: (funnel.configuration?.timeWindow || 86400000) / 3600000, onChange: (e) => onConfigChange('timeWindow', parseInt(e.target.value) * 3600000), className: "form-input" }), _jsx("small", { className: "form-help", children: "Maximum time allowed for users to complete the funnel" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "grace-period", children: "Drop-off Grace Period (minutes)" }), _jsx("input", { id: "grace-period", type: "number", min: "0", value: (funnel.configuration?.dropOffGracePeriod || 300000) / 60000, onChange: (e) => onConfigChange('dropOffGracePeriod', parseInt(e.target.value) * 60000), className: "form-input" }), _jsx("small", { className: "form-help", children: "Grace period before considering a user as dropped off" })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: funnel.configuration?.allowBacktracking || false, onChange: (e) => onConfigChange('allowBacktracking', e.target.checked) }), "Allow Backtracking"] }), _jsx("small", { className: "form-help", children: "Allow users to go back to previous steps" })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: funnel.configuration?.requireSequentialSteps || true, onChange: (e) => onConfigChange('requireSequentialSteps', e.target.checked) }), "Require Sequential Steps"] }), _jsx("small", { className: "form-help", children: "Users must complete steps in order" })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: funnel.configuration?.enableParallelPaths || false, onChange: (e) => onConfigChange('enableParallelPaths', e.target.checked) }), "Enable Parallel Paths"] }), _jsx("small", { className: "form-help", children: "Allow multiple paths through the funnel" })] })] })] });
    ;
}
;
{
    return;
    _jsxs("div", { className: "steps-configuration", children: [_jsxs("div", { className: "steps-header", children: [_jsx("h3", { children: "Funnel Steps" }), _jsx("button", { onClick: onStepAdd, className: "add-step-button", children: "Add Step" })] }), _jsxs("div", { className: "steps-list", children: [steps.map((step, index) => ()
                        < StepEditor, key = { step, : .id }, step = { step }, index = { index }, availableEvents = { availableEvents }, availableProperties = { availableProperties }, onUpdate = {}(updates)), " => onStepUpdate(step.id, updates)} onDelete=", () => onStepDelete(step.id), "onReorder=", onStepReorder, "draggedItem=", draggedItem, "onDragStart=", onDragStart, "onDragEnd=", onDragEnd, "/> ))}"] }), steps.length === 0 && ()
                < div, " className=\"empty-state\">", _jsx("p", { children: "No steps configured yet. Add your first step to get started." }), _jsx("button", { onClick: onStepAdd, className: "add-first-step-button", children: "Add First Step" })] });
}
div >
;
;
;
{
    const [isExpanded, setIsExpanded] = useState(false);
    const handleDragStart = (e) => {
        onDragStart({});
        type: 'step',
            id;
        step.id,
            data;
        {
            step, index;
        }
    };
}
;
const handleDragOver = (e) => {
    e.preventDefault();
};
const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem?.type === 'step' && draggedItem.data.index !== index) {
        onReorder(draggedItem.data.index, index);
        onDragEnd();
    }
    ;
    return;
    _jsxs("div", { className: "step-editor", draggable: true, onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop, children: [_jsxs("div", { className: "step-header", children: [_jsx("div", { className: "step-handle", children: "\u22EE\u22EE" }), _jsxs("div", { className: "step-info", children: [_jsx("div", { className: "step-name", children: step.name }), _jsx("div", { className: "step-type", children: step.type })] }), _jsxs("div", { className: "step-actions", children: [_jsx("button", { onClick: () => setIsExpanded(!isExpanded), className: "expand-button", children: isExpanded ? '▼' : '▶' }), _jsx("button", { onClick: onDelete, className: "delete-button", children: "\u00D7" })] })] }), isExpanded && ()
                < div, " className=\"step-content\">", _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Step Name" }), _jsx("input", { type: "text", value: step.name, onChange: (e) => onUpdate({ name: e.target.value }), className: "form-input" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Step Type" }), _jsxs("select", { value: step.type, onChange: (e) => onUpdate({ type: e.target.value }), className: "form-select", children: [_jsx("option", { value: "entry_point", children: "Entry Point" }), _jsx("option", { value: "engagement", children: "Engagement" }), _jsx("option", { value: "decision_point", children: "Decision Point" }), _jsx("option", { value: "action", children: "Action" }), _jsx("option", { value: "validation", children: "Validation" }), _jsx("option", { value: "conversion", children: "Conversion" }), _jsx("option", { value: "exit_point", children: "Exit Point" })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description" }), _jsx("textarea", { value: step.description, onChange: (e) => onUpdate({ description: e.target.value }), className: "form-textarea", rows: 2 })] }), _jsx(EventCriteriaEditor, { criteria: step.eventCriteria, availableEvents: availableEvents, availableProperties: availableProperties, onChange: (eventCriteria) => onUpdate({ eventCriteria }) }), _jsxs("div", { className: "form-row", children: [_jsx("div", { className: "form-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: step.isRequired, onChange: (e) => onUpdate({ isRequired: e.target.checked }) }), "Required Step"] }) }), _jsx("div", { className: "form-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: step.isTerminal, onChange: (e) => onUpdate({ isTerminal: e.target.checked }) }), "Terminal Step"] }) })] }), _jsx(TimeConstraintsEditor, { constraints: step.timeConstraints, onChange: (timeConstraints) => onUpdate({ timeConstraints }) })] });
};
div >
;
;
;
{
    const selectedEvent = availableEvents.find(e => e.type === criteria.eventType);
    return;
    _jsxs("div", { className: "event-criteria-editor", children: [_jsx("h4", { children: "Event Criteria" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Event Type" }), _jsxs("select", { value: criteria.eventType, onChange: (e) => onChange({ ...criteria, eventType: e.target.value }), className: "form-select", children: [_jsx("option", { value: "", children: "Select event type..." }), availableEvents.map(event => ()
                                < option, key = { event, : .type }, value = { event, : .type } >
                                { event, : .name }({ event, : .type }))] }), "))}"] })] });
    {
        selectedEvent && ()
            < div;
        className = "event-description" >
            _jsx("p", { children: selectedEvent.description });
        div >
        ;
    }
    _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Event Pattern (Optional)" }), _jsx("input", { type: "text", value: criteria.eventPattern || '', onChange: (e) => onChange({ ...criteria, eventPattern: e.target.value }), placeholder: "Regular expression pattern...", className: "form-input" }), _jsx("small", { className: "form-help", children: "Use regex pattern for flexible event matching" })] })
        ,
            _jsx(PropertyMatchersEditor, { matchers: criteria.propertyMatchers, availableProperties: selectedEvent?.properties || availableProperties, onChange: (propertyMatchers) => onChange({ ...criteria, propertyMatchers }) });
    div >
    ;
    ;
}
;
{
    const addMatcher = () => {
        const newMatcher = {
            propertyPath: '',
            operator: 'equals',
            value: '',
            caseSensitive: false,
            required: false,
        };
        onChange([...matchers, newMatcher]);
    };
    const updateMatcher = (index, updates) => {
        const newMatchers = matchers.map((matcher, i) => );
        i === index ? { ...matcher, ...updates } : matcher;
    };
    ;
    onChange(newMatchers);
}
;
const removeMatcher = (index) => {
    onChange(matchers.filter((_, i) => i !== index));
};
return;
_jsxs("div", { className: "property-matchers-editor", children: [_jsxs("div", { className: "matchers-header", children: [_jsx("h5", { children: "Property Matchers" }), _jsx("button", { onClick: addMatcher, className: "add-matcher-button", children: "Add Matcher" })] }), matchers.map((matcher, index) => ()
            < div, key = { index }, className = "property-matcher" >
            (_jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Property" }), _jsxs("select", { value: matcher.propertyPath, onChange: (e) => updateMatcher(index, { propertyPath: e.target.value }), className: "form-select", children: [_jsx("option", { value: "", children: "Select property..." }), availableProperties.map(prop => ()
                                    < option, key = { prop, : .path }, value = { prop, : .path } >
                                    { prop, : .name }({ prop, : .path }))] }), "))}"] }) })
                ,
                    _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Operator" }), _jsxs("select", { value: matcher.operator, onChange: (e) => updateMatcher(index, { operator: e.target.value }), className: "form-select", children: [_jsx("option", { value: "equals", children: "Equals" }), _jsx("option", { value: "contains", children: "Contains" }), _jsx("option", { value: "startsWith", children: "Starts With" }), _jsx("option", { value: "endsWith", children: "Ends With" }), _jsx("option", { value: "matches", children: "Matches Regex" }), _jsx("option", { value: "exists", children: "Exists" }), _jsx("option", { value: "in", children: "In List" }), _jsx("option", { value: "between", children: "Between" })] })] })
                        ,
                            _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Value" }), _jsx("input", { type: "text", value: matcher.value, onChange: (e) => updateMatcher(index, { value: e.target.value }), className: "form-input" })] })
                                ,
                                    _jsx("button", { onClick: () => removeMatcher(index), className: "remove-matcher-button", children: "\u00D7" })))] })
    ,
        _jsxs("div", { className: "matcher-options", children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: matcher.caseSensitive || false, onChange: (e) => updateMatcher(index, { caseSensitive: e.target.checked }) }), "Case Sensitive"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: matcher.required || false, onChange: (e) => updateMatcher(index, { required: e.target.checked }) }), "Required"] })] });
div >
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "time-constraints-editor", children: [_jsx("h5", { children: "Time Constraints" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Min Time from Previous (seconds)" }), _jsx("input", { type: "number", min: "0", value: constraints.minTimeFromPrevious ? constraints.minTimeFromPrevious / 1000 : '', onChange: (e) => onChange({}) }), "...constraints, minTimeFromPrevious: e.target.value ? parseInt(e.target.value) * 1000 : undefined, })} className=\"form-input\" />"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Max Time from Previous (seconds)" }), _jsx("input", { type: "number", min: "0", value: constraints.maxTimeFromPrevious ? constraints.maxTimeFromPrevious / 1000 : '', onChange: (e) => onChange({}) }), "...constraints, maxTimeFromPrevious: e.target.value ? parseInt(e.target.value) * 1000 : undefined, })} className=\"form-input\" />"] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Max Time from Start (seconds)" }), _jsx("input", { type: "number", min: "0", value: constraints.maxTimeFromStart ? constraints.maxTimeFromStart / 1000 : '', onChange: (e) => onChange({}) }), "...constraints, maxTimeFromStart: e.target.value ? parseInt(e.target.value) * 1000 : undefined, })} className=\"form-input\" />"] })] });
    ;
}
;
// Placeholder components for other tabs
const ConditionalPathsConfiguration = () => ()
    < div > Conditional, Paths, Configuration;
(TODO) => ;
div >
;
;
const SuccessCriteriaConfiguration = () => ()
    < div > Success, Criteria, Configuration;
(TODO) => ;
div >
;
;
const AnalyticsConfiguration = () => ()
    < div > Analytics, Configuration;
(TODO) => ;
div >
;
;
{
    return;
    _jsxs("div", { className: "modal-overlay", children: [_jsxs("div", { className: "template-modal", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { children: "Choose Funnel Template" }), _jsx("button", { onClick: onClose, className: "close-button", children: "\u00D7" })] }), _jsx("div", { className: "template-grid", children: templates.map(template => ()
                            < div, key = { template, : .id }, className = "template-card" >
                            _jsxs("div", { className: "template-info", children: [_jsx("h4", { children: template.name }), _jsx("p", { children: template.description }), _jsxs("div", { className: "template-meta", children: [_jsx("span", { className: "category", children: template.category }), _jsxs("span", { className: "steps-count", children: [template.steps.length, " steps"] })] }), _jsx("div", { className: "template-tags", children: template.tags.map(tag => ()
                                            < span, key = { tag }, className = "tag" > { tag }) }), "))}"] })) }), _jsx("button", { onClick: () => onSelect(template), className: "use-template-button", children: "Use Template" })] }), "))}"] });
    {
        templates.length === 0 && ()
            < div;
        className = "empty-templates" >
            _jsx("p", { children: "No templates available." });
        div >
        ;
    }
    div >
    ;
    div >
    ;
    ;
}
;
export default FunnelConfiguration;
