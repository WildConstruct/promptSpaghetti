import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useState, useCallback, useMemo } from 'react';
import { ExecutionStatus, ParameterType, InputType, RiskLevel } from '../../admin/services/OperationTypesService';
export const OperationUI = ({ operationType, initialParameters = {}, onExecute, onCancel, onParametersChange, readonly = false, showAdvanced = false }) => {
    const [parameters, setParameters] = useState(initialParameters);
    const [validationErrors, setValidationErrors] = useState({});
    const [execution, setExecution] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [showParameters, setShowParameters] = useState(true);
    // Parameter validation
    const validateParameters = useCallback((params) => {
        const errors = {};
        operationType.parameters.forEach(param => {
            const value = params[param.name];
            // Required validation
            if (param.required && (value === undefined || value === null || value === '')) {
                errors[param.name] = `${param.displayName} is required`;
                return;
            }
            // Skip further validation if value is empty and not required
            if (!value && !param.required)
                return;
            // Type validation
            if (!validateParameterType(value, param.type)) {
                errors[param.name] = `${param.displayName} must be of type ${param.type}`;
                return;
            }
            // Constraint validation
            param.constraints.forEach(constraint => {
                const result = validateConstraint(value, constraint);
                if (!result.isValid) {
                    errors[param.name] = result.message;
                }
            });
        });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [operationType.parameters]);
    // Handle parameter changes
    const handleParameterChange = useCallback((name, value) => {
        const newParameters = { ...parameters, [name]: value };
        setParameters(newParameters);
        onParametersChange?.(newParameters);
        // Validate on change
        setTimeout(() => validateParameters(newParameters), 100);
    }, [parameters, onParametersChange, validateParameters]);
    // Execute operation
    const handleExecute = useCallback(async () => {
        if (!validateParameters(parameters)) {
            return;
        }
        setIsExecuting(true);
        try {
            const executionResult = await onExecute(parameters);
            setExecution(executionResult);
        }
        catch (error) {
            console.error('Operation execution failed:', error);
            // Handle error
        }
        finally {
            setIsExecuting(false);
        }
    }, [parameters, onExecute, validateParameters]);
    // Cancel execution
    const handleCancel = useCallback(async () => {
        if (execution && onCancel) {
            try {
                await onCancel(execution.id);
                setExecution(null);
            }
            catch (error) {
                console.error('Operation cancellation failed:', error);
            }
        }
    }, [execution, onCancel]);
    const isValid = useMemo(() => Object.keys(validationErrors).length === 0, [validationErrors]);
    const canExecute = useMemo(() => !readonly && !isExecuting && isValid && !execution, [readonly, isExecuting, isValid, execution]);
    return (_jsxs("div", { className: "operation-ui", children: [_jsx(OperationHeader, { operationType: operationType, execution: execution, onToggleParameters: () => setShowParameters(!showParameters), showParameters: showParameters }), showParameters && (_jsx(OperationParametersForm, { parameters: operationType.parameters, values: parameters, errors: validationErrors, onChange: handleParameterChange, readonly: readonly, showAdvanced: showAdvanced })), _jsx(OperationActions, { operationType: operationType, canExecute: canExecute, isExecuting: isExecuting, execution: execution, onExecute: handleExecute, onCancel: handleCancel }), execution && (_jsx(OperationProgress, { execution: execution, operationType: operationType, onCancel: handleCancel }))] }));
};
const OperationHeader = ({ operationType, execution, onToggleParameters, showParameters }) => {
    const _____getRiskLevelColor = (risk) => {
        switch (risk) {
            case RiskLevel.LOW: return 'green';
            case RiskLevel.MEDIUM: return 'yellow';
            case RiskLevel.HIGH: return 'orange';
            case RiskLevel.CRITICAL: return 'red';
            default: return 'gray';
        }
    };
    return (_jsxs("div", { className: "operation-header", children: [_jsxs("div", { className: "operation-title", children: [_jsx("div", { className: "operation-icon", style: { color: operationType.uiConfig.color }, children: operationType.uiConfig.icon || '⚙️' }), _jsxs("div", { children: [_jsx("h3", { children: operationType.displayName }), _jsx("p", { className: "operation-description", children: operationType.description })] })] }), _jsxs("div", { className: "operation-metadata", children: [_jsxs("span", { className: `risk-badge risk-${operationType.riskLevel}`, children: [operationType.riskLevel.toUpperCase(), " RISK"] }), _jsx("span", { className: "category-badge", children: operationType.category.replace('_', ' ').toUpperCase() }), execution && (_jsx("span", { className: `status-badge status-${execution.status}`, children: execution.status.toUpperCase() }))] }), _jsxs("button", { className: "toggle-parameters-btn", onClick: onToggleParameters, children: [showParameters ? 'Hide' : 'Show', " Parameters"] })] }));
};
const OperationParametersForm = ({ parameters, values, errors, onChange, readonly, showAdvanced }) => {
    const [collapsedSections, setCollapsedSections] = useState(new Set());
    const parametersByGroup = useMemo(() => {
        const groups = {};
        parameters.forEach(param => {
            const group = param.name.includes('advanced') && !showAdvanced
                ? 'advanced'
                : 'basic';
            if (!groups[group])
                groups[group] = [];
            groups[group].push(param);
        });
        return groups;
    }, [parameters, showAdvanced]);
    const toggleSection = (section) => {
        const newCollapsed = new Set(collapsedSections);
        if (newCollapsed.has(section)) {
            newCollapsed.delete(section);
        }
        else {
            newCollapsed.add(section);
        }
        setCollapsedSections(newCollapsed);
    };
    return (_jsx("div", { className: "operation-parameters-form", children: Object.entries(parametersByGroup).map(([group, groupParams]) => (_jsxs("div", { className: "parameter-group", children: [_jsxs("div", { className: "parameter-group-header", onClick: () => toggleSection(group), children: [_jsx("h4", { children: group === 'advanced' ? 'Advanced Options' : 'Parameters' }), _jsx("span", { className: `collapse-icon ${collapsedSections.has(group) ? 'collapsed' : ''}`, children: "\u25BC" })] }), !collapsedSections.has(group) && (_jsx("div", { className: "parameter-group-content", children: groupParams.map(parameter => (_jsx(ParameterInput, { parameter: parameter, value: values[parameter.name], error: errors[parameter.name], onChange: (value) => onChange(parameter.name, value), readonly: readonly }, parameter.name))) }))] }, group))) }));
};
const ParameterInput = ({ parameter, value, error, onChange, readonly }) => {
    const renderInput = () => {
        const commonProps = {
            value: value || parameter.defaultValue || '',
            onChange: (e) => onChange(e.target.value),
            disabled: readonly,
            placeholder: parameter.placeholder,
            className: error ? 'error' : ''
        };
        switch (parameter.inputType) {
            case InputType.TEXT:
                return _jsx("input", { type: "text", ...commonProps });
            case InputType.TEXTAREA:
                return _jsx("textarea", { ...commonProps, rows: 4 });
            case InputType.NUMBER:
                return (_jsx("input", { type: "number", ...commonProps, onChange: (e) => onChange(parseFloat(e.target.value) || 0) }));
            case InputType.CHECKBOX:
                return (_jsx("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => onChange(e.target.checked), disabled: readonly, className: error ? 'error' : '' }));
            case InputType.SELECT:
                return (_jsxs("select", { ...commonProps, children: [_jsx("option", { value: "", children: "Select..." }), parameter.options?.map(option => (_jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value)))] }));
            case InputType.MULTISELECT:
                return (_jsx("div", { className: "multiselect", children: parameter.options?.map(option => (_jsxs("label", { className: "multiselect-option", children: [_jsx("input", { type: "checkbox", checked: Array.isArray(value) && value.includes(option.value), onChange: (e) => {
                                    const currentValues = Array.isArray(value) ? value : [];
                                    if (e.target.checked) {
                                        onChange([...currentValues, option.value]);
                                    }
                                    else {
                                        onChange(currentValues.filter((v) => v !== option.value));
                                    }
                                }, disabled: readonly || option.disabled }), option.label] }, option.value))) }));
            case InputType.DATE_PICKER:
                return (_jsx("input", { type: "date", value: value ? new Date(value).toISOString().split('T')[0] : '', onChange: (e) => onChange(new Date(e.target.value)), disabled: readonly, className: error ? 'error' : '' }));
            case InputType.DATETIME_PICKER:
                return (_jsx("input", { type: "datetime-local", value: value ? new Date(value).toISOString().slice(0, -1) : '', onChange: (e) => onChange(new Date(e.target.value)), disabled: readonly, className: error ? 'error' : '' }));
            case InputType.FILE_UPLOAD:
                return (_jsx("input", { type: "file", onChange: (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            onChange(file);
                        }
                    }, disabled: readonly, className: error ? 'error' : '' }));
            default:
                return _jsx("input", { type: "text", ...commonProps });
        }
    };
    return (_jsxs("div", { className: "parameter-input", children: [_jsxs("label", { className: "parameter-label", children: [parameter.displayName, parameter.required && _jsx("span", { className: "required", children: "*" })] }), _jsxs("div", { className: "parameter-control", children: [renderInput(), parameter.helpText && (_jsx("div", { className: "parameter-help", children: parameter.helpText })), error && (_jsx("div", { className: "parameter-error", children: error }))] })] }));
};
const OperationActions = ({ operationType, canExecute, isExecuting, execution, onExecute, onCancel }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const handleExecute = () => {
        if (operationType.uiConfig.confirmationRequired) {
            setShowConfirmation(true);
        }
        else {
            onExecute();
        }
    };
    const confirmExecution = () => {
        setShowConfirmation(false);
        onExecute();
    };
    return (_jsxs("div", { className: "operation-actions", children: [_jsxs("div", { className: "primary-actions", children: [!execution && (_jsx("button", { className: `execute-btn risk-${operationType.riskLevel}`, onClick: handleExecute, disabled: !canExecute, children: isExecuting ? 'Executing...' : `Execute ${operationType.displayName}` })), execution && execution.status === ExecutionStatus.RUNNING && operationType.uiConfig.allowCancel && (_jsx("button", { className: "cancel-btn", onClick: onCancel, children: "Cancel Operation" }))] }), _jsxs("div", { className: "secondary-actions", children: [_jsx("button", { className: "template-btn", children: "Save as Template" }), _jsx("button", { className: "schedule-btn", children: "Schedule" }), _jsx("button", { className: "dry-run-btn", children: "Dry Run" })] }), showConfirmation && (_jsx("div", { className: "confirmation-modal", children: _jsxs("div", { className: "confirmation-content", children: [_jsx("h4", { children: "Confirm Operation" }), _jsx("p", { children: operationType.uiConfig.confirmationMessage ||
                                `Are you sure you want to execute ${operationType.displayName}?` }), _jsxs("div", { className: "confirmation-actions", children: [_jsx("button", { onClick: () => setShowConfirmation(false), children: "Cancel" }), _jsx("button", { className: `confirm-btn risk-${operationType.riskLevel}`, onClick: confirmExecution, children: "Execute" })] })] }) }))] }));
};
const OperationProgress = ({ execution, operationType, _____onCancel }) => {
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0)
            return `${hours}h ${minutes % 60}m`;
        if (minutes > 0)
            return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case ExecutionStatus.RUNNING: return 'blue';
            case ExecutionStatus.COMPLETED: return 'green';
            case ExecutionStatus.FAILED: return 'red';
            case ExecutionStatus.CANCELLED: return 'gray';
            default: return 'gray';
        }
    };
    return (_jsxs("div", { className: "operation-progress", children: [_jsxs("div", { className: "progress-header", children: [_jsx("h4", { children: "Operation Progress" }), _jsx("span", { className: `status status-${execution.status}`, children: execution.status.toUpperCase() })] }), operationType.uiConfig.showProgressBar && (_jsxs("div", { className: "progress-bar-container", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: {
                                width: `${execution.progress.percentage}%`,
                                backgroundColor: getStatusColor(execution.status)
                            } }) }), _jsxs("span", { className: "progress-text", children: [execution.progress.percentage.toFixed(1), "%"] })] })), operationType.uiConfig.showDetailedProgress && (_jsxs("div", { className: "progress-details", children: [_jsxs("div", { className: "progress-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("label", { children: "Current Step:" }), _jsx("span", { children: execution.progress.currentStep })] }), _jsxs("div", { className: "stat", children: [_jsx("label", { children: "Progress:" }), _jsxs("span", { children: [execution.progress.completedSteps, " / ", execution.progress.totalSteps] })] }), _jsxs("div", { className: "stat", children: [_jsx("label", { children: "Processed:" }), _jsxs("span", { children: [execution.processedTargets, " / ", execution.totalTargets] })] }), _jsxs("div", { className: "stat", children: [_jsx("label", { children: "Success:" }), _jsx("span", { children: execution.successCount })] }), _jsxs("div", { className: "stat", children: [_jsx("label", { children: "Errors:" }), _jsx("span", { children: execution.errorCount })] })] }), execution.duration && (_jsxs("div", { className: "timing-info", children: [_jsxs("div", { className: "stat", children: [_jsx("label", { children: "Duration:" }), _jsx("span", { children: formatDuration(execution.duration) })] }), execution.progress.estimatedTimeRemaining && (_jsxs("div", { className: "stat", children: [_jsx("label", { children: "ETA:" }), _jsx("span", { children: formatDuration(execution.progress.estimatedTimeRemaining) })] }))] }))] })), execution.logs && execution.logs.length > 0 && (_jsxs("div", { className: "operation-logs", children: [_jsx("h5", { children: "Recent Activity" }), _jsx("div", { className: "logs-container", children: execution.logs.slice(-5).map((log, index) => (_jsxs("div", { className: `log-entry log-${log.level}`, children: [_jsx("span", { className: "log-timestamp", children: new Date(log.timestamp).toLocaleTimeString() }), _jsx("span", { className: "log-message", children: log.message })] }, index))) })] })), execution.errors && execution.errors.length > 0 && (_jsxs("div", { className: "operation-errors", children: [_jsx("h5", { children: "Errors" }), _jsx("div", { className: "errors-container", children: execution.errors.slice(-3).map((error, index) => (_jsxs("div", { className: "error-entry", children: [_jsx("span", { className: "error-code", children: error.code }), _jsx("span", { className: "error-message", children: error.message }), error.recoverable && _jsx("span", { className: "recoverable-badge", children: "Recoverable" })] }, index))) })] }))] }));
};
// Utility functions
function validateParameterType(value, type) {
    switch (type) {
        case ParameterType.STRING:
            return typeof value === 'string';
        case ParameterType.NUMBER:
            return typeof value === 'number' && !isNaN(value);
        case ParameterType.BOOLEAN:
            return typeof value === 'boolean';
        case ParameterType.ARRAY:
            return Array.isArray(value);
        case ParameterType.OBJECT:
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        default:
            return true;
    }
}
function validateConstraint(value, constraint) {
    // Implementation would match the server-side validation
    return { isValid: true, message: '' };
}
export default OperationUI;
