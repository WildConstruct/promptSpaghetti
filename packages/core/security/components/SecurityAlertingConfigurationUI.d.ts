/**
 * Security Alerting Configuration UI
 * Task T-1752989143998-161: Build security alerting configuration UI
 *
 * Comprehensive configuration interface for security alerting system,
 * providing administrators with fine-grained control over threat detection,
 * response automation, and notification management.
 *
 * Features:
 * - Real-time alerting threshold configuration
 * - Response automation rule management
 * - Notification channel configuration
 * - Escalation policy management
 * - Threat intelligence integration settings
 * - Compliance framework alignment
 * - Performance monitoring configuration
 * - Risk-based alerting policies
 *
 * Security Controls:
 * - Role-based access control for configuration changes
 * - Configuration validation and safety checks
 * - Audit logging for all configuration modifications
 * - Secure defaults and recommended settings
 * - Change approval workflow integration
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React from 'react';
import { SecurityAlertingConfig } from '../SecurityAlertingAnalytics';
import { ComplianceFramework } from '../SecurityLogger';

export interface SecurityAlertingConfigurationUIProps {
    currentConfig: SecurityAlertingConfig;
    onConfigChange: (config: SecurityAlertingConfig) => Promise<void>;
    onValidateConfig: (config: SecurityAlertingConfig) => Promise<ValidationResult>;
    userRole: 'admin' | 'security_admin' | 'security_analyst';
    complianceFrameworks: ComplianceFramework[];
    theme?: 'light' | 'dark' | 'cinema';
    readOnly?: boolean;
    allowAdvancedSettings?: boolean;


export interface ValidationResult {
    isValid: boolean;
    errors: ConfigValidationError[];
    warnings: ConfigValidationWarning[];
    securityScore: number;


export interface ConfigValidationError {
    field: string;
    message: string;
    severity: 'error' | 'critical';


export interface ConfigValidationWarning {
    field: string;
    message: string;
    impact: 'low' | 'medium' | 'high';


/**
 * Advanced security alerting configuration interface
 */
export declare const SecurityAlertingConfigurationUI: React.FC<SecurityAlertingConfigurationUIProps>;
export default SecurityAlertingConfigurationUI;
//# sourceMappingURL=SecurityAlertingConfigurationUI.d.ts.map