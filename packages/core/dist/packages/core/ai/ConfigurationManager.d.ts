/**
 * AI Model Configuration Manager
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Flexible configuration management with environment-specific settings and runtime updates
 */
import { ModelConfiguration, AIModelProvider } from './BaseAIModel';
import { ModelRegistration } from './AIModelFactory';
export interface EnvironmentConfig {
    name: string;
    description: string;
    models: ModelConfiguration[];
    defaults: {
        timeout: number;
        retries: number;
        rateLimit: {
            requestsPerMinute: number;
            tokensPerMinute: number;
        };
    };
    features: {
        enableCaching: boolean;
        enableLoadBalancing: boolean;
        enableHealthChecks: boolean;
        enableMetrics: boolean;
    };
}
export interface ConfigurationSchema {
    version: string;
    environments: Record<string, EnvironmentConfig>;
    modelTemplates: Record<string, Partial<ModelConfiguration>>;
    providerDefaults: Record<AIModelProvider, Partial<ModelConfiguration>>;
    validationRules: ValidationRule[];
}
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    validate: (config: ModelConfiguration) => ValidationResult;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}
export interface ConfigurationUpdate {
    path: string;
    value: unknown;
    environment?: string;
    modelId?: string;
    timestamp: Date;
    reason?: string;
}
export interface ConfigurationHistory {
    updates: ConfigurationUpdate[];
    snapshots: Array<{
        timestamp: Date;
        config: ConfigurationSchema;
        version: string;
    }>;
}
export declare class ConfigurationValidator {
    private rules;
    constructor();
    addRule(rule: ValidationRule): void;
    removeRule(ruleId: string): void;
    validate(config: ModelConfiguration): ValidationResult;
    validateEnvironment(envConfig: EnvironmentConfig): ValidationResult;
    private _initializeDefaultRules;
}
export declare class ConfigurationManager {
    private schema;
    private validator;
    private history;
    private currentEnvironment;
    private configPath?;
    constructor(initialSchema?: ConfigurationSchema, configPath?: string);
    getCurrentEnvironment(): string;
    setEnvironment(environment: string): void;
    getEnvironmentConfig(environment?: string): EnvironmentConfig;
    createEnvironment(name: string, config: EnvironmentConfig): void;
    deleteEnvironment(name: string): void;
    getModelConfig(modelId: string, environment?: string): ModelConfiguration | null;
    addModelConfig(config: ModelConfiguration, environment?: string): void;
    updateModelConfig(modelId: string, updates: Partial<ModelConfiguration>, environment?: string): void;
    removeModelConfig(modelId: string, environment?: string): void;
    getTemplate(templateId: string): Partial<ModelConfiguration> | null;
    createTemplate(templateId: string, template: Partial<ModelConfiguration>): void;
    applyTemplate(modelId: string, templateId: string, overrides?: Partial<ModelConfiguration>): ModelConfiguration;
    exportConfiguration(environment?: string): string;
    importConfiguration(configJson: string, environment?: string): void;
    validateCurrentConfiguration(): ValidationResult;
    validateAllEnvironments(): Record<string, ValidationResult>;
    getHistory(): ConfigurationHistory;
    rollback(snapshotIndex?: number): void;
    createSnapshot(description: string): void;
    generateRegistrations(environment?: string): ModelRegistration[];
    private _createDefaultSchema;
    private _recordUpdate;
    private _createSnapshot;
}
export default ConfigurationManager;
//# sourceMappingURL=ConfigurationManager.d.ts.map