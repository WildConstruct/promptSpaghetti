/**
 * Security Alerting Configuration Service
 * Task T-1752989143998-161: Build security alerting configuration UI
 *
 * Backend service for managing security alerting configurations,
 * providing persistence, validation, and integration with the
 * broader security monitoring infrastructure.
 *
 * Features:
 * - Configuration persistence and retrieval
 * - Multi-tenant configuration support
 * - Configuration validation and sanitization
 * - Change tracking and audit logging
 * - Real-time configuration updates
 * - Backup and recovery capabilities
 * - Integration with alerting engine
 * - Performance monitoring
 *
 * Security Controls:
 * - Input validation and sanitization
 * - Role-based access control
 * - Configuration approval workflows
 * - Audit logging for all changes
 * - Secure configuration storage
 * - Change rollback capabilities
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { EventEmitter } from 'events';
import { SecurityAlertingConfig } from './SecurityAlertingAnalytics';
import { DataClassificationLevel } from './DataClassificationAccessControl';
export interface SecurityAlertingConfigurationServiceOptions {
    storageBackend: 'filesystem' | 'database' | 'redis' | 'memory';
    enableCaching: boolean;
    cacheTimeout: number;
    enableValidation: boolean;
    enableAuditLogging: boolean;
    enableBackups: boolean;
    backupInterval: number;
    maxBackups: number;
    encryptStorage: boolean;
    requireApproval: boolean;
}
export interface ConfigurationMetadata {
    id: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    status: 'draft' | 'pending_approval' | 'approved' | 'deprecated';
    checksum: string;
    size: number;
    tags: string[];
    classification: DataClassificationLevel;
}
export interface ConfigurationChangeRequest {
    configId: string;
    changes: Partial<SecurityAlertingConfig>;
    requestedBy: string;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    scheduledAt?: Date;
    approvers?: string[];
}
export interface ConfigurationValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    securityScore: number;
    complianceIssues: ComplianceIssue[];
    performanceImpact: PerformanceImpact;
}
export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'critical';
    code: string;
    suggestion?: string;
}
export interface ValidationWarning {
    field: string;
    message: string;
    impact: 'low' | 'medium' | 'high';
    code: string;
    suggestion?: string;
}
export interface ComplianceIssue {
    framework: string;
    requirement: string;
    impact: 'minor' | 'major' | 'critical';
    description: string;
}
export interface PerformanceImpact {
    cpuImpact: 'low' | 'medium' | 'high';
    memoryImpact: 'low' | 'medium' | 'high';
    storageImpact: 'low' | 'medium' | 'high';
    networkImpact: 'low' | 'medium' | 'high';
    estimatedCost: number;
}
/**
 * Service for managing security alerting configurations
 */
export declare class SecurityAlertingConfigurationService extends EventEmitter {
    private configs;
    private metadata;
    private cache;
    private securityLogger;
    private options;
    private backupTimer;
    constructor(options?: Partial<SecurityAlertingConfigurationServiceOptions>);
    /**
     * Initialize the configuration service
     */
    private initializeService;
    /**
     * Get configuration by ID
     */
    getConfiguration(configId: string): Promise<SecurityAlertingConfig | null>;
    /**
     * Save configuration
     */
    saveConfiguration();
      configId: string,
      config: SecurityAlertingConfig,
      metadata?: Partial<ConfigurationMetadata>
    ): Promise<boolean>;
    /**
     * Validate configuration
     */
    validateConfiguration(config: SecurityAlertingConfig): Promise<ConfigurationValidationResult>;
    /**
     * List all configurations
     */
    listConfigurations(): Promise<ConfigurationMetadata[]>;
    /**
     * Delete configuration
     */
    deleteConfiguration(configId: string, deletedBy: string): Promise<boolean>;
    /**
     * Create backup of all configurations
     */
    createBackup(): Promise<string>;
    /**
     * Private helper methods
     */
    private loadConfigurations;
    private loadConfiguration;
    private storeConfiguration;
    private sanitizeConfiguration;
    private calculateChecksum;
    private calculateEstimatedCost;
    private startBackupTimer;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export default SecurityAlertingConfigurationService;
//# sourceMappingURL=SecurityAlertingConfigurationService.d.ts.map