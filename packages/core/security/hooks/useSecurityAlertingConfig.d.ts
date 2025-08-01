/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

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
import { SecurityAlertingConfig,
  EscalationThresholds,
  CorrelationRule }
  ResponseAutomation
} from '../SecurityAlertingAnalytics';

}
}
export interface UseSecurityAlertingConfigOptions { configId?: string;
    autoSave?: boolean;
    autoSaveInterval?: number;
    validationDebounce?: number;
    enableAuditLogging?: boolean;
    onConfigChange?: (config: SecurityAlertingConfig) => void;
    onValidationError?: (errors: ValidationError[]) => void;
    onSaveSuccess?: () => void;
    onSaveError?: (error: Error) => void }
}
}
export interface ValidationError { field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    code: string }
}
}
export interface ConfigurationState { config: SecurityAlertingConfig;
    originalConfig: SecurityAlertingConfig;
    isLoading: boolean;
    isSaving: boolean;
    isValidating: boolean;
    hasUnsavedChanges: boolean;
    lastSaved: Date | null;
    validationErrors: ValidationError[];
    validationWarnings: ValidationError[];
    securityScore: number;
    configVersion: number }
}
}
export interface UseSecurityAlertingConfigReturn { state: ConfigurationState;
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
        importConfig: (configJson: string) => boolean }
}
    };
    utils: { getConfigDiff: () => Partial<SecurityAlertingConfig>;
        getValidationSummary: () => { }
            hasErrors: boolean;
            hasWarnings: boolean;
            errorCount: number;
            warningCount: number;
            score: number;
        };
        getRecommendations: () => ConfigRecommendation[];
    };

}
}
export interface ConfigRecommendation { field: string;
    current: any;
    recommended: any;
    reason: string;
    impact: 'security' | 'performance' | 'compliance';
    priority: 'high' | 'medium' | 'low';
/**
 * Hook for managing security alerting configuration
 */
export declare const useSecurityAlertingConfig: ()
  initialConfig?: SecurityAlertingConfig }
  options?: UseSecurityAlertingConfigOptions
) => UseSecurityAlertingConfigReturn;
export default useSecurityAlertingConfig;
//# sourceMappingURL=useSecurityAlertingConfig.d.ts.map
}
}