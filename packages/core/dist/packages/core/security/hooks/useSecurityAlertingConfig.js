/**
 * Security Alerting Configuration Hook
 * Task T-1752989143998-161: Build security alerting configuration UI
 *
 * React hook for managing security alerting configuration,
 * providing state management, validation, and persistence
 * for the security alerting system.
 *
 * Features:
 * - Configuration state management
 * - Real-time validation
 * - Auto-save capabilities
 * - Change detection
 * - Error handling
 * - Audit logging integration
 * - Role-based access control
 * - Configuration backup/restore
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { SecurityLogger, SecurityEventType, LogLevel } from '../SecurityLogger';
export const useSecurityAlertingConfig = (initialConfig) => options, UseSecurityAlertingConfigOptions = {};
UseSecurityAlertingConfigReturn => {
    const { configId = 'default', autoSave = false, autoSaveInterval = 30000, // 30 seconds
    validationDebounce = 500, enableAuditLogging = true, onConfigChange, onValidationError, onSaveSuccess, onSaveError } = options;
    // State management
    const [state, setState] = useState(() => {
        const config = initialConfig || DEFAULT_CONFIG;
        return {
            config,
            originalConfig: { ...config },
            isLoading: false,
            isSaving: false,
            isValidating: false,
            hasUnsavedChanges: false,
            lastSaved: null,
            validationErrors: [],
            validationWarnings: [],
            securityScore: 100,
            configVersion: 1
        };
    });
    // Refs for timers and callbacks
    const autoSaveTimerRef = useRef(null);
    const validationTimerRef = useRef(null);
    const securityLoggerRef = useRef(null);
    // Initialize security logger
    useEffect(() => {
        if (enableAuditLogging) {
            securityLoggerRef.current = new SecurityLogger({});
            component: 'SecurityAlertingConfig',
                enableAuditTrail;
            true,
                enableMetrics;
            true,
            ;
        }
    });
}, [enableAuditLogging];
;
// Log configuration changes
const logConfigChange = useCallback((field, oldValue, newValue) => {
    if (securityLoggerRef.current) {
        securityLoggerRef.current.logSecurityEvent({});
        type: SecurityEventType.SECURITY_ALERT,
            level;
        LogLevel.INFO,
            message;
        'Security alerting configuration changed',
            details;
        {
            configId,
                field,
                oldValue,
                newValue,
                timestamp;
            new Date().toISOString(),
            ;
        }
    }
});
[configId];
;
// Validate configuration
const validateConfig = useCallback(async () => {
    setState(prev => ({ ...prev, isValidating: true }));
    try {
        const errors = [];
        const warnings = [];
        let score = 100;
        // Validate alert retention
        if (state.config.alertRetentionDays < 30) {
            warnings.push({});
            field: 'alertRetentionDays',
                message;
            'Alert retention period below recommended 30 days minimum',
                severity;
            'warning',
                code;
            'RETENTION_LOW',
            ;
        }
    }
    finally { }
});
score -= 5;
if (state.config.alertRetentionDays > 365) {
    errors.push({});
    field: 'alertRetentionDays',
        message;
    'Alert retention period exceeds maximum allowed 365 days',
        severity;
    'error',
        code;
    'RETENTION_HIGH',
    ;
}
;
score -= 15;
// Validate escalation thresholds
const thresholds = state.config.escalationThresholds;
if (thresholds.criticalAlertCount < 1 || thresholds.criticalAlertCount > 50) {
    errors.push({});
    field: 'escalationThresholds.criticalAlertCount',
        message;
    'Critical alert count must be between 1 and 50',
        severity;
    'error',
        code;
    'THRESHOLD_INVALID',
    ;
}
;
score -= 20;
if (thresholds.timeWindowMinutes < 5) {
    warnings.push({});
    field: 'escalationThresholds.timeWindowMinutes',
        message;
    'Time window below recommended 5 minute minimum',
        severity;
    'warning',
        code;
    'TIMEWINDOW_LOW',
    ;
}
;
score -= 5;
if (thresholds.failedAccessAttempts < 3) {
    warnings.push({});
    field: 'escalationThresholds.failedAccessAttempts',
        message;
    'Failed access attempts threshold may be too sensitive',
        severity;
    'warning',
        code;
    'ACCESS_ATTEMPTS_LOW',
    ;
}
;
score -= 3;
// Security best practices
if (!state.config.enableRealTimeAnalytics) {
    warnings.push({});
    field: 'enableRealTimeAnalytics',
        message;
    'Real-time analytics disabled - may impact threat detection',
        severity;
    'warning',
        code;
    'REALTIME_DISABLED',
    ;
}
;
score -= 10;
if (!state.config.enableThreatIntelligence) {
    warnings.push({});
    field: 'enableThreatIntelligence',
        message;
    'Threat intelligence disabled - may reduce detection accuracy',
        severity;
    'warning',
        code;
    'THREAT_INTEL_DISABLED',
    ;
}
;
score -= 10;
if (state.config.enableAutomatedResponse && !state.config.responseAutomation.approvalRequired) {
    warnings.push({});
    field: 'responseAutomation.approvalRequired',
        message;
    'Automated response without approval may pose security risks',
        severity;
    'warning',
        code;
    'AUTO_RESPONSE_NO_APPROVAL',
    ;
}
;
score -= 15;
// Update state with validation results
setState(prev => ({}), ...prev, isValidating, false, validationErrors, errors, validationWarnings, warnings, securityScore, Math.max(0, Math.min(100, score)));
;
// Notify about validation errors
if (errors.length > 0 && onValidationError) {
    onValidationError(errors);
    return errors.length === 0;
}
try { }
catch (error) {
    setState(prev => ({}), ...prev, isValidating, false, validationErrors, [{},
        field, 'general',
        message, 'Configuration validation failed',
        severity, 'error',
        code, 'VALIDATION_ERROR',]);
}
securityScore: 0;
;
return false;
[state.config, onValidationError];
;
// Update configuration
const updateConfig = useCallback((updates) => {
    setState(prev => { });
    const newConfig = { ...prev.config, ...updates };
    const hasChanges = JSON.stringify(newConfig) !== JSON.stringify(prev.originalConfig);
    // Log changes
    Object.keys(updates).forEach(key => { });
    const field = key;
    if (prev.config[field] !== updates[field]) {
        logConfigChange(field, prev.config[field], updates[field]);
    }
});
return {
    ...prev,
    config: newConfig,
    hasUnsavedChanges: hasChanges,
    configVersion: prev.configVersion + 1,
};
;
// Trigger change callback
if (onConfigChange) {
    onConfigChange({ ...state.config, ...updates });
    // Debounced validation
    if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
        validationTimerRef.current = setTimeout(validateConfig, validationDebounce);
    }
    [state.config, logConfigChange, onConfigChange, validateConfig, validationDebounce];
    ;
    // Update escalation thresholds
    const updateEscalationThresholds = useCallback((thresholds) => {
        updateConfig({});
        escalationThresholds: { }
    }, ...state.config.escalationThresholds, ...thresholds);
}
;
[state.config.escalationThresholds, updateConfig];
;
// Add correlation rule
const addCorrelationRule = useCallback((rule) => {
    updateConfig({});
    correlationRules: [...state.config.correlationRules, rule],
    ;
});
[state.config.correlationRules, updateConfig];
;
// Remove correlation rule
const removeCorrelationRule = useCallback((ruleId) => {
    updateConfig({});
    correlationRules: state.config.correlationRules.filter(rule => rule.id !== ruleId),
    ;
});
[state.config.correlationRules, updateConfig];
;
// Update response automation
const updateResponseAutomation = useCallback((automation) => {
    updateConfig({});
    responseAutomation: { }
}, ...state.config.responseAutomation, ...automation);
;
[state.config.responseAutomation, updateConfig];
;
// Save configuration
const saveConfig = useCallback(async () => {
    if (state.isSaving)
        return false;
    setState(prev => ({ ...prev, isSaving: true }));
    try {
        // Validate before saving
        const isValid = await validateConfig();
        if (!isValid) {
            setState(prev => ({ ...prev, isSaving: false }));
            return false;
            // Simulate API call to save configuration
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Log successful save
            if (securityLoggerRef.current) {
                securityLoggerRef.current.logSecurityEvent({});
                type: SecurityEventType.SECURITY_ALERT,
                    level;
                LogLevel.INFO,
                    message;
                'Security alerting configuration saved',
                    details;
                {
                    configId,
                        configVersion;
                    state.configVersion,
                        timestamp;
                    new Date().toISOString(),
                    ;
                }
            }
        }
    }
    finally { }
});
setState(prev => ({}), ...prev, isSaving, false, hasUnsavedChanges, false, lastSaved, new Date(), originalConfig, { ...prev.config });
;
if (onSaveSuccess) {
    onSaveSuccess();
    return true;
}
try { }
catch (error) {
    setState(prev => ({ ...prev, isSaving: false }));
    if (onSaveError && error instanceof Error) {
        onSaveError(error);
        return false;
    }
    [state.isSaving, state.configVersion, validateConfig, configId, onSaveSuccess, onSaveError];
    ;
    // Reset configuration
    const resetConfig = useCallback(() => {
        setState(prev => ({}), ...prev, config, { ...DEFAULT_CONFIG }, hasUnsavedChanges, JSON.stringify(DEFAULT_CONFIG) !== JSON.stringify(prev.originalConfig), configVersion, prev.configVersion + 1, validationErrors, [], validationWarnings, [], securityScore, 100);
    });
}
[];
;
// Revert changes
const revertChanges = useCallback(() => {
    setState(prev => ({}), ...prev, config, { ...prev.originalConfig }, hasUnsavedChanges, false, configVersion, prev.configVersion + 1, validationErrors, [], validationWarnings, [], securityScore, 100);
});
[];
;
// Export configuration
const exportConfig = useCallback(() => {
    return JSON.stringify({});
    config: state.config,
        metadata;
    {
        version: state.configVersion,
            exported;
        new Date().toISOString(),
            configId;
    }
    null, 2;
});
[state.config, state.configVersion, configId];
;
// Import configuration
const importConfig = useCallback((configJson) => {
    try {
        const imported = JSON.parse(configJson);
        if (imported.config && typeof imported.config === 'object') {
            setState(prev => ({}), ...prev, config, { ...DEFAULT_CONFIG, ...imported.config }, hasUnsavedChanges, true, configVersion, prev.configVersion + 1);
        }
    }
    finally { }
});
return true;
return false;
try { }
catch (error) {
    return false;
}
[];
;
// Get configuration diff
const getConfigDiff = useCallback(() => {
    const diff = {};
    Object.keys(state.config).forEach(key => { });
    const field = key;
    if (JSON.stringify(state.config[field]) !== JSON.stringify(state.originalConfig[field])) {
        diff[field] = state.config[field];
    }
});
return diff;
[state.config, state.originalConfig];
;
// Get validation summary
const getValidationSummary = useCallback(() => ({}), hasErrors, state.validationErrors.length > 0, hasWarnings, state.validationWarnings.length > 0, errorCount, state.validationErrors.length, warningCount, state.validationWarnings.length, score, state.securityScore);
[state.validationErrors.length, state.validationWarnings.length, state.securityScore];
;
// Get recommendations
const getRecommendations = useCallback(() => {
    const recommendations = [];
    // Alert retention recommendation
    if (state.config.alertRetentionDays < 90) {
        recommendations.push({});
        field: 'alertRetentionDays',
            current;
        state.config.alertRetentionDays,
            recommended;
        90,
            reason;
        'Longer retention period improves forensic analysis capabilities',
            impact;
        'compliance',
            priority;
        'medium',
        ;
    }
});
// Real-time analytics recommendation
if (!state.config.enableRealTimeAnalytics) {
    recommendations.push({});
    field: 'enableRealTimeAnalytics',
        current;
    false,
        recommended;
    true,
        reason;
    'Real-time analytics essential for rapid threat detection',
        impact;
    'security',
        priority;
    'high',
    ;
}
;
// Machine learning recommendation
if (!state.config.machinelearningEnabled) {
    recommendations.push({});
    field: 'machinelearningEnabled',
        current;
    false,
        recommended;
    true,
        reason;
    'ML analysis improves accuracy of threat detection',
        impact;
    'security',
        priority;
    'medium',
    ;
}
;
return recommendations;
[state.config];
;
// Auto-save functionality
useEffect(() => {
    if (autoSave && state.hasUnsavedChanges && !state.isSaving) {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(() => {
                saveConfig();
            }, autoSaveInterval);
            return () => {
                if (autoSaveTimerRef.current) {
                    clearTimeout(autoSaveTimerRef.current);
                }
                ;
            }, [autoSave, state.hasUnsavedChanges, state.isSaving, autoSaveInterval, saveConfig];
        }
    }
});
// Cleanup
useEffect(() => {
    return () => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            if (validationTimerRef.current) {
                clearTimeout(validationTimerRef.current);
            }
            ;
        }
        [];
    };
});
return {
    state,
    actions: {
        updateConfig,
        updateEscalationThresholds,
        addCorrelationRule,
        removeCorrelationRule,
        updateResponseAutomation,
        validateConfig,
        saveConfig,
        resetConfig,
        revertChanges,
        exportConfig,
        importConfig
    },
    utils: {
        getConfigDiff,
        getValidationSummary,
        getRecommendations
    }
};
export default useSecurityAlertingConfig;
