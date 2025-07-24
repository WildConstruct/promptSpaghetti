import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Bulk Assignment Tools Components
 * Task: E17-1753114396896-4DCBA7 - Create bulk assignment tools
 *
 * Comprehensive React components for bulk assignment operations including
 * API keys, permissions, roles, teams, and usage quotas with multi-step
 * wizard, conflict resolution, and progress tracking.
 */
import { useState, useMemo } from 'react';
import './BulkAssignmentTools.css';
// =============================================================================
// Types and Interfaces
// =============================================================================
export var AssignmentType;
(function (AssignmentType) {
    AssignmentType["API_KEY"] = "api_key";
    AssignmentType["PERMISSION"] = "permission";
    AssignmentType["ROLE"] = "role";
    AssignmentType["TEAM"] = "team";
    AssignmentType["QUOTA"] = "quota";
})(AssignmentType || (AssignmentType = {}));
export var BulkOperationType;
(function (BulkOperationType) {
    BulkOperationType["ASSIGN"] = "assign";
    BulkOperationType["REVOKE"] = "revoke";
    BulkOperationType["UPDATE"] = "update";
    BulkOperationType["TRANSFER"] = "transfer";
})(BulkOperationType || (BulkOperationType = {}));
export const BulkAssignmentTools = ({ assignmentType, operationType, availableTargets, availableResources, availableTemplates, onExecute, onCancel, onTemplateCreate, readonly = false }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [operation, setOperation] = useState({
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
    const handleStepChange = (step) => {
        if (step <= currentStep + 1 && step >= 1) {
            setCurrentStep(step);
        }
    };
    const handleExecute = async () => {
        try {
            setOperation(prev => ({ ...prev, status: 'executing' }));
            const operationId = await onExecute(operation);
            setOperation(prev => ({ ...prev, operationId, status: 'executing' }));
        }
        catch (error) {
            setOperation(prev => ({ ...prev, status: 'failed' }));
            console.error('Failed to execute bulk assignment:', error);
        }
    };
    return (_jsxs("div", { className: "bulk-assignment-tools", children: [_jsx(BulkAssignmentHeader, { assignmentType: assignmentType, operationType: operationType, operation: operation, onTemplateLoad: (template) => {
                    // Load template configuration
                    setOperation(prev => ({
                        ...prev,
                        template,
                        parameters: { ...prev.parameters, ...template.defaultParameters },
                        resources: availableResources.filter(r => template.defaultResources.includes(r.id))
                    }));
                }, availableTemplates: availableTemplates }), _jsx(BulkAssignmentWizard, { steps: steps, currentStep: currentStep, onStepChange: handleStepChange, canProceed: canProceedToNextStep }), _jsxs("div", { className: "bulk-assignment-content", children: [currentStep === 1 && (_jsx(TargetSelectionStep, { targets: availableTargets, selectedTargets: operation.targets, onTargetsChange: (targets) => setOperation(prev => ({ ...prev, targets })), assignmentType: assignmentType, operationType: operationType })), currentStep === 2 && (_jsx(ResourceSelectionStep, { resources: availableResources, selectedResources: operation.resources, onResourcesChange: (resources) => setOperation(prev => ({ ...prev, resources })), assignmentType: assignmentType, operationType: operationType, targets: operation.targets })), currentStep === 3 && (_jsx(ParametersConfigurationStep, { parameters: operation.parameters, onParametersChange: (parameters) => setOperation(prev => ({ ...prev, parameters })), assignmentType: assignmentType, operationType: operationType })), currentStep === 4 && (_jsx(ConflictResolutionStep, { operation: operation, onConflictsResolved: (conflicts) => setOperation(prev => ({ ...prev, conflicts })), onOperationUpdated: setOperation })), currentStep === 5 && (_jsx(ExecutionStep, { operation: operation, onExecute: handleExecute, onCancel: onCancel, readonly: readonly }))] }), _jsx(BulkAssignmentActions, { currentStep: currentStep, totalSteps: steps.length, canProceed: canProceedToNextStep, onPrevious: () => handleStepChange(currentStep - 1), onNext: () => handleStepChange(currentStep + 1), onExecute: handleExecute, onReset: () => {
                    setCurrentStep(1);
                    setOperation(prev => ({
                        ...prev,
                        targets: [],
                        resources: [],
                        status: 'draft',
                        conflicts: [],
                        results: []
                    }));
                }, isExecuting: operation.status === 'executing', readonly: readonly })] }));
};
const BulkAssignmentHeader = ({ assignmentType, operationType, operation, availableTemplates, onTemplateLoad }) => {
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
    const applicableTemplates = availableTemplates.filter(template => template.assignmentType === assignmentType && template.operationType === operationType);
    return (_jsxs("div", { className: "bulk-assignment-header", children: [_jsxs("div", { className: "operation-title", children: [_jsx("span", { className: "operation-icon", children: getOperationIcon() }), _jsxs("div", { children: [_jsx("h2", { children: getOperationTitle() }), _jsxs("p", { children: ["Bulk ", operationType, " operation for ", operation.targets.length, " targets"] })] })] }), _jsxs("div", { className: "template-controls", children: [_jsx("label", { htmlFor: "template-select", children: "Load Template:" }), _jsxs("select", { id: "template-select", onChange: (e) => {
                            const template = applicableTemplates.find(t => t.id === e.target.value);
                            if (template)
                                onTemplateLoad(template);
                        }, value: "", children: [_jsx("option", { value: "", children: "Choose a template..." }), applicableTemplates.map(template => (_jsxs("option", { value: template.id, children: [template.name, " (", template.usage.timesUsed, " uses, ", Math.round(template.usage.successRate), "% success)"] }, template.id)))] })] }), _jsx("div", { className: "operation-status", children: _jsx("span", { className: `status-badge status-${operation.status}`, children: operation.status.toUpperCase() }) })] }));
};
const BulkAssignmentWizard = ({ steps, currentStep, onStepChange, canProceed }) => {
    return (_jsx("div", { className: "bulk-assignment-wizard", children: steps.map((step) => (_jsxs("div", { className: `wizard-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`, onClick: () => onStepChange(step.number), children: [_jsx("div", { className: "step-number", children: step.number }), _jsxs("div", { className: "step-content", children: [_jsx("div", { className: "step-title", children: step.title }), _jsx("div", { className: "step-description", children: step.description })] }), currentStep > step.number && _jsx("div", { className: "step-check", children: "\u2713" })] }, step.number))) }));
};
const TargetSelectionStep = ({ targets, selectedTargets, onTargetsChange, assignmentType, operationType }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('');
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
        return Array.from(depts);
    }, [targets]);
    const handleTargetToggle = (target) => {
        const isSelected = selectedTargets.some(t => t.id === target.id);
        if (isSelected) {
            onTargetsChange(selectedTargets.filter(t => t.id !== target.id));
        }
        else {
            onTargetsChange([...selectedTargets, target]);
        }
    };
    const handleSelectAll = () => {
        if (selectedTargets.length === filteredTargets.length) {
            onTargetsChange([]);
        }
        else {
            onTargetsChange(filteredTargets);
        }
    };
    return (_jsxs("div", { className: "target-selection-step", children: [_jsxs("div", { className: "selection-controls", children: [_jsxs("div", { className: "search-filters", children: [_jsx("input", { type: "text", placeholder: "Search targets...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" }), _jsxs("select", { value: filterType, onChange: (e) => setFilterType(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "user", children: "Users" }), _jsx("option", { value: "team", children: "Teams" }), _jsx("option", { value: "service", children: "Services" }), _jsx("option", { value: "role", children: "Roles" })] }), _jsxs("select", { value: filterDepartment, onChange: (e) => setFilterDepartment(e.target.value), className: "filter-select", children: [_jsx("option", { value: "", children: "All Departments" }), departments.map(dept => (_jsx("option", { value: dept, children: dept }, dept)))] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: showConflicts, onChange: (e) => setShowConflicts(e.target.checked) }), "Show only conflicted targets"] })] }), _jsxs("div", { className: "bulk-actions", children: [_jsx("button", { onClick: handleSelectAll, className: "bulk-select-btn", children: selectedTargets.length === filteredTargets.length ? 'Deselect All' : 'Select All' }), _jsxs("span", { className: "selection-count", children: [selectedTargets.length, " of ", filteredTargets.length, " selected"] })] })] }), _jsx("div", { className: "targets-list", children: filteredTargets.map(target => (_jsx(TargetCard, { target: target, selected: selectedTargets.some(t => t.id === target.id), onToggle: () => handleTargetToggle(target), assignmentType: assignmentType, operationType: operationType }, target.id))) }), filteredTargets.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx("p", { children: "No targets match your current filters." }), _jsx("button", { onClick: () => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterDepartment('');
                            setShowConflicts(false);
                        }, children: "Clear Filters" })] }))] }));
};
const TargetCard = ({ target, selected, onToggle, assignmentType, operationType }) => {
    const [showDetails, setShowDetails] = useState(false);
    const getTypeIcon = (type) => {
        const icons = {
            'user': '👤',
            'team': '👥',
            'service': '⚙️',
            'role': '🎭'
        };
        return icons[type] || '📄';
    };
    const currentAssignments = target.currentAssignments?.filter(assignment => assignment.assignmentType === assignmentType) || [];
    const conflicts = target.conflicts || [];
    return (_jsxs("div", { className: `target-card ${selected ? 'selected' : ''}`, children: [_jsxs("div", { className: "target-header", children: [_jsx("input", { type: "checkbox", checked: selected, onChange: onToggle, className: "target-checkbox" }), _jsxs("div", { className: "target-info", children: [_jsxs("div", { className: "target-primary", children: [_jsx("span", { className: "target-icon", children: getTypeIcon(target.type) }), _jsx("span", { className: "target-name", children: target.name }), _jsx("span", { className: "target-type", children: target.type })] }), _jsxs("div", { className: "target-secondary", children: [target.email && _jsx("span", { className: "target-email", children: target.email }), target.department && _jsx("span", { className: "target-department", children: target.department })] })] }), _jsxs("div", { className: "target-indicators", children: [currentAssignments.length > 0 && (_jsxs("span", { className: "assignment-count", children: [currentAssignments.length, " current"] })), conflicts.length > 0 && (_jsxs("span", { className: "conflict-indicator", children: ["\u26A0\uFE0F ", conflicts.length, " conflicts"] })), _jsx("button", { className: "details-toggle", onClick: () => setShowDetails(!showDetails), children: showDetails ? '▼' : '▶' })] })] }), showDetails && (_jsxs("div", { className: "target-details", children: [currentAssignments.length > 0 && (_jsxs("div", { className: "current-assignments", children: [_jsx("h4", { children: "Current Assignments:" }), currentAssignments.map(assignment => (_jsxs("div", { className: "assignment-item", children: [_jsx("span", { children: assignment.resourceName }), _jsx("span", { className: `status status-${assignment.status}`, children: assignment.status }), assignment.expiresAt && (_jsxs("span", { className: "expiry", children: ["Expires: ", assignment.expiresAt.toLocaleDateString()] }))] }, assignment.id)))] })), conflicts.length > 0 && (_jsxs("div", { className: "conflicts", children: [_jsx("h4", { children: "Conflicts:" }), conflicts.map((conflict, index) => (_jsxs("div", { className: `conflict-item severity-${conflict.severity}`, children: [_jsx("span", { className: "conflict-type", children: conflict.type }), _jsx("span", { className: "conflict-description", children: conflict.description })] }, index)))] }))] }))] }));
};
const BulkAssignmentActions = ({ currentStep, totalSteps, canProceed, onPrevious, onNext, onExecute, onReset, isExecuting, readonly }) => {
    return (_jsxs("div", { className: "bulk-assignment-actions", children: [_jsxs("div", { className: "primary-actions", children: [currentStep > 1 && (_jsx("button", { onClick: onPrevious, disabled: readonly || isExecuting, className: "btn btn-secondary", children: "Previous" })), currentStep < totalSteps && (_jsx("button", { onClick: onNext, disabled: !canProceed || readonly || isExecuting, className: "btn btn-primary", children: "Next" })), currentStep === totalSteps && (_jsx("button", { onClick: onExecute, disabled: !canProceed || readonly || isExecuting, className: "btn btn-success", children: isExecuting ? 'Executing...' : 'Execute Assignment' }))] }), _jsx("div", { className: "secondary-actions", children: _jsx("button", { onClick: onReset, disabled: readonly || isExecuting, className: "btn btn-outline", children: "Reset" }) })] }));
};
// Placeholder components for remaining steps
const ResourceSelectionStep = () => _jsx("div", { children: "Resource Selection Step - To be implemented" });
const ParametersConfigurationStep = () => _jsx("div", { children: "Parameters Configuration Step - To be implemented" });
const ConflictResolutionStep = () => _jsx("div", { children: "Conflict Resolution Step - To be implemented" });
const ExecutionStep = () => _jsx("div", { children: "Execution Step - To be implemented" });
export default BulkAssignmentTools;
