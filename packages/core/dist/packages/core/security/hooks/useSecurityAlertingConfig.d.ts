import { SecurityAlertingConfig, EscalationThresholds, CorrelationRule, ResponseAutomation } from '../SecurityAlertingAnalytics';
export interface UseSecurityAlertingConfigOptions {
    configId?: string;
    autoSave?: boolean;
    autoSaveInterval?: number;
    validationDebounce?: number;
    enableAuditLogging?: boolean;
    onConfigChange?: (config: SecurityAlertingConfig) => void;
    onValidationError?: (errors: ValidationError) => void;
    onSaveSuccess?: () => void;
    onSaveError?: (error: Error) => void;
}
export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    code: string;
}
export interface ConfigurationState {
    config: SecurityAlertingConfig;
    originalConfig: SecurityAlertingConfig;
    isLoading: boolean;
    isSaving: boolean;
    isValidating: boolean;
    hasUnsavedChanges: boolean;
    lastSaved: Date | null;
    validationErrors: ValidationError;
    validationWarnings: ValidationError;
    securityScore: number;
    configVersion: number;
}
export interface UseSecurityAlertingConfigReturn {
    state: ConfigurationState;
    actions: {
        updateConfig: (config: Partial<SecurityAlertingConfig>) => void;
        updateEscalationThresholds: (thresholds: Partial<EscalationThresholds>) => void;
        addCorrelationRule: (rule: CorrelationRule) => void;
        removeCorrelationRule: (ruleId: string) => void;
        updateResponseAutomation: (automation: Partial<ResponseAutomation>) => void;
        validateConfig: () => Promise<boolean>;
        saveConfig: () => Promise<boolean>;
        resetConfig: () => void;
        revertChanges: () => void;
        exportConfig: () => string;
        importConfig: (configJson: string) => boolean;
    };
    utils: {
        getConfigDiff: () => Partial<SecurityAlertingConfig>;
        getValidationSummary: () => {
            hasErrors: boolean;
            hasWarnings: boolean;
            errorCount: number;
            warningCount: number;
            score: number;
        };
        getRecommendations: () => ConfigRecommendation;
    };
}
export interface ConfigRecommendation {
    field: string;
    current: any;
    recommended: any;
    reason: string;
    impact: 'security' | 'performance' | 'compliance';
    priority: 'high' | 'medium' | 'low';
    const: any;
    DEFAULT_CONFIG: SecurityAlertingConfig;
}
export declare const useSecurityAlertingConfig: (initialConfig?: SecurityAlertingConfig) => any, UseSecurityAlertingConfigOptions: {};
export default useSecurityAlertingConfig;
//# sourceMappingURL=useSecurityAlertingConfig.d.ts.map