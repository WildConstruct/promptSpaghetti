/**
 * AI Model Configuration Manager
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Flexible configuration management with environment-specific settings and runtime updates
 */
import { ModelConfiguration, AIModelProvider } from './BaseAIModel';
export interface EnvironmentConfig {
    name: string;
    description: string;
    models: ModelConfiguration;
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
    validationRules: ValidationRule;
}
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    validate: (config: ModelConfiguration) => ValidationResult;
}
export interface ValidationResult {
    valid: boolean;
    errors: string;
    warnings: string;
    suggestions: string;
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
    updates: ConfigurationUpdate;
    snapshots: Array<{}, timestamp>;
    Date: any;
    config: ConfigurationSchema;
    version: string;
}
export declare class ConfigurationValidator {
    private rules;
    constructor();
    updateModelConfig(modelId: string, updates: Partial<ModelConfiguration>, environment?: string): void;
}
//# sourceMappingURL=ConfigurationManager.d.ts.map