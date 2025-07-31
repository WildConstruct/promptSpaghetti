/**
 * AI Model Configuration Manager
 * Epic 35.1.1 - Multi-Model Infrastructure
 * 
 * Flexible configuration management with environment-specific settings and runtime updates
 */
import { ModelConfiguration, AIModelType, AIModelProvider, ModelCapabilities, ModelMetadata } from './BaseAIModel';
import { ModelRegistration } from './AIModelFactory';

}
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
}
};
  };
  features: {
  enableCaching: boolean;
  enableLoadBalancing: boolean;
  enableHealthChecks: boolean;
  enableMetrics: boolean;
};
}
}
export interface ConfigurationSchema {
  version: string;
  environments: Record<string, EnvironmentConfig>;
  modelTemplates: Record<string, Partial<ModelConfiguration>>;
  providerDefaults: Record<AIModelProvider, Partial<ModelConfiguration>>;
  validationRules: ValidationRule;
}
}
}
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate: (config: ModelConfiguration) => ValidationResult;
}
}
}
export interface ValidationResult {
  valid: boolean;
  errors: string;
  warnings: string;
  suggestions: string;
}
}
}
export interface ConfigurationUpdate {
  path: string; // JSONPath to the configuration field,
  value: unknown;
  environment?: string;
  modelId?: string;
  timestamp: Date;
  reason?: string;
}
}
}
export interface ConfigurationHistory {
  updates: ConfigurationUpdate;
  snapshots: Array<{
  timestamp: Date;
  config: ConfigurationSchema;
  version: string;
}
}>;
}
export class ConfigurationValidator {
  private rules: ValidationRule = [];
  constructor() {
  this._initializeDefaultRules();
  addRule(rule: ValidationRule): void {,
  this.rules.push(rule);
  removeRule(ruleId: string): void {,
  this.rules = this.rules.filter(rule => rule.id !== ruleId);
  validate(config: ModelConfiguration): ValidationResult {,
  const result: ValidationResult = {,
  valid: true,
  errors: [],
  warnings: [],
  suggestions: [],
};
    for (const rule of this.rules) {
  const ruleResult = rule.validate(config);
  result.errors.push(...ruleResult.errors);
  result.warnings.push(...ruleResult.warnings);
  result.suggestions.push(...ruleResult.suggestions);
  if (!ruleResult.valid) {
  result.valid = false;
  return result;
  validateEnvironment(envConfig: EnvironmentConfig): ValidationResult {,
  const result: ValidationResult = {,
  valid: true,
  errors: [],
  warnings: [],
  suggestions: [],
};
    // Validate each model in the environment
    for (const modelConfig of envConfig.models) {
      const modelResult = this.validate(modelConfig);
      if (!modelResult.valid) {
        result.valid = false;
        result.errors.push(`Model ${modelConfig.id}: ${modelResult.errors.join(', ')}`);}
      result.warnings.push(...modelResult.warnings.map(w => `Model ${modelConfig.id}: ${w}`));}
      result.suggestions.push(...modelResult.suggestions.map(s => `Model ${modelConfig.id}: ${s}`));}
    // Validate environment-specific settings
    if (envConfig.defaults.timeout < 1000) {
  result.warnings.push('Timeout less than 1 second may cause failures');
  if (envConfig.defaults.rateLimit.requestsPerMinute > 10000) {
  result.warnings.push('Very high rate limit may exceed provider quotas');
  return result;
  private _initializeDefaultRules(): void {,
  // Required fields validation
  this.addRule({)
  id: 'required-fields',
  name: 'Required Fields',
  description: 'Validates that required fields are present',
  validate: (config) => {,
  const errors: string = [];
  if (!config.id) errors.push('Model ID is required');
  if (!config.type) errors.push('Model type is required');
  if (!config.provider) errors.push('Provider is required');
  return {
  valid: errors.length === 0,
  errors,
  warnings: [],
  suggestions: [],
};
    });
    // API key validation
    this.addRule({)
  id: 'api-key-validation',
      name: 'API Key Validation',
      description: 'Validates API key requirements',
      validate: (config) => {,
        const errors: string = [];
        const warnings: string = [];
        if (config.provider === AIModelProvider.OPENAI || config.provider === AIModelProvider.ANTHROPIC) {
          if (!config.apiKey) {
            errors.push(`API key is required for ${config.provider}`);}
          } else if (config.apiKey.length < 10) {
  warnings.push('API key seems too short');
  return {
  valid: errors.length === 0,
  errors,
  warnings,
  suggestions: [],
};
    });
    // Model name validation
    this.addRule({)
  id: 'model-name-validation',
      name: 'Model Name Validation',
      description: 'Validates model names for specific providers',
      validate: (config) => {,
        const warnings: string = [];
        const suggestions: string = [];
        if (config.provider === AIModelProvider.OPENAI && config.modelName) {
          const validModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'dall-e-3'];
          if (!validModels.some(m => config.modelName!.startsWith(m))) {
            warnings.push(`Unknown OpenAI model: ${config.modelName}`);}
            suggestions.push(`Consider using one of: ${validModels.join(', ')}`);}
        return {
  valid: true,
  errors: [],
  warnings,
  suggestions
};
    });
    // Resource limits validation
    this.addRule({)
  id: 'resource-limits',
  name: 'Resource Limits',
  description: 'Validates resource limit settings',
  validate: (config) => {,
  const warnings: string = [];
  const suggestions: string = [];
  if (config.capabilities?.maxInputSize && config.capabilities.maxInputSize > 1000000) {
  warnings.push('Very large input size limit may cause memory issues');
  suggestions.push('Consider implementing input chunking for large requests');
  if (config.capabilities?.maxOutputSize && config.capabilities.maxOutputSize > 100000) {
  warnings.push('Large output size may increase latency');
  return {
  valid: true,
  errors: [],
  warnings,
  suggestions
};
    });

export class ConfigurationManager {
  private schema: ConfigurationSchema;
  private validator: ConfigurationValidator;
  private history: ConfigurationHistory;
  private currentEnvironment: string = 'development';
  private configPath?: string;
  constructor(initialSchema?: ConfigurationSchema, configPath?: string) {
    this.schema = initialSchema || this._createDefaultSchema();
    this.validator = new ConfigurationValidator();
    this.history = { updates: [], snapshots: [] };
    this.configPath = configPath;
    // Create initial snapshot
    this._createSnapshot('Initial configuration');
  // Environment management
  getCurrentEnvironment(): string {
    return this.currentEnvironment;
  setEnvironment(environment: string): void {
    if (!this.schema.environments[environment]) {
      throw new Error(`Environment not found: ${environment}`);}
    this.currentEnvironment = environment;
  getEnvironmentConfig(environment?: string): EnvironmentConfig {
    const env = environment || this.currentEnvironment;
    const config = this.schema.environments[env];
    if (!config) {
      throw new Error(`Environment not found: ${env}`);}
    return config;
  createEnvironment(name: string, config: EnvironmentConfig): void {
    // Validate environment configuration
    const validation = this.validator.validateEnvironment(config);
    if (!validation.valid) {
      throw new Error(`Invalid environment configuration: ${validation.errors.join(', ')}`);}
    this.schema.environments[name] = config;
    this._recordUpdate({)
  path: `environments.${name}`}
},
  value: config,
      timestamp: new Date(),
      reason: `Created new environment: ${name}`}
    });
  deleteEnvironment(name: string): void {
    if (name === this.currentEnvironment) {
      throw new Error('Cannot delete current environment');
    delete this.schema.environments[name];
    this._recordUpdate({)
  path: `environments.${name}`}
},
  value: null,
      timestamp: new Date(),
      reason: `Deleted environment: ${name}`}
    });
  // Model configuration management
  getModelConfig(modelId: string, environment?: string): ModelConfiguration | null {
    const envConfig = this.getEnvironmentConfig(environment);
    return envConfig.models.find(m => m.id === modelId) || null;
  addModelConfig(config: ModelConfiguration, environment?: string): void {
    // Validate configuration
    const validation = this.validator.validate(config);
    if (!validation.valid) {
      throw new Error(`Invalid model configuration: ${validation.errors.join(', ')}`);}
    const env = environment || this.currentEnvironment;
    const envConfig = this.getEnvironmentConfig(env);
    // Check for duplicate IDs
    if (envConfig.models.some(m => m.id === config.id)) {
      throw new Error(`Model with ID ${config.id} already exists in environment ${env}`);}
    envConfig.models.push(config);
    this._recordUpdate({)
  path: `environments.${env}.models`}
},
  value: config,
      environment: env,
      modelId: config.id,
      timestamp: new Date(),
      reason: `Added model: ${config.id}`}
    });
  updateModelConfig(modelId: string, updates: Partial<ModelConfiguration>, environment?: string): void {
    const env = environment || this.currentEnvironment;
    const envConfig = this.getEnvironmentConfig(env);
    const modelIndex = envConfig.models.findIndex(m => m.id === modelId);
    if (modelIndex === -1) {
      throw new Error(`Model not found: ${modelId} in environment ${env}`);}
    // Apply updates
    const updatedConfig = { ...envConfig.models[modelIndex], ...updates };
    // Validate updated configuration
    const validation = this.validator.validate(updatedConfig);
    if (!validation.valid) {
      throw new Error(`Invalid model configuration: ${validation.errors.join(', ')}`);}
    envConfig.models[modelIndex] = updatedConfig;
    this._recordUpdate({)
  path: `environments.${env}.models[${modelIndex}]`}
},
  value: updates,
      environment: env,
      modelId,
      timestamp: new Date(),
      reason: `Updated model: ${modelId}`}
    });
  removeModelConfig(modelId: string, environment?: string): void {
    const env = environment || this.currentEnvironment;
    const envConfig = this.getEnvironmentConfig(env);
    const modelIndex = envConfig.models.findIndex(m => m.id === modelId);
    if (modelIndex === -1) {
      throw new Error(`Model not found: ${modelId} in environment ${env}`);}
    envConfig.models.splice(modelIndex, 1);
    this._recordUpdate({)
  path: `environments.${env}.models[${modelIndex}]`}
},
  value: null,
      environment: env,
      modelId,
      timestamp: new Date(),
      reason: `Removed model: ${modelId}`}
    });
  // Template management
  getTemplate(templateId: string): Partial<ModelConfiguration> | null {
    return this.schema.modelTemplates[templateId] || null;
  createTemplate(templateId: string, template: Partial<ModelConfiguration>): void {
    this.schema.modelTemplates[templateId] = template;
    this._recordUpdate({)
  path: `modelTemplates.${templateId}`}
},
  value: template,
      timestamp: new Date(),
      reason: `Created template: ${templateId}`}
    });
  applyTemplate(modelId: string, templateId: string, overrides: Partial<ModelConfiguration> = {}): ModelConfiguration {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);}
    return {
  id: modelId,
  type: AIModelType.TEXT,
  provider: AIModelProvider.OPENAI,
  ...template,
  ...overrides
};
  // Configuration export/import
  exportConfiguration(environment?: string): string {
    if (environment) {
      return JSON.stringify(this.getEnvironmentConfig(environment), null, 2);
    return JSON.stringify(this.schema, null, 2);
  importConfiguration(configJson: string, environment?: string): void {
    try {
      const config = JSON.parse(configJson);
      if (environment) {
        // Import into specific environment
        const validation = this.validator.validateEnvironment(config);
        if (!validation.valid) {
          throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);}
        this.schema.environments[environment] = config;
      } else {
        // Import entire schema
        this.schema = config;
      this._recordUpdate({)
  path: environment ? `environments.${environment}` : 'root'}
},
  value: config,
        environment,
        timestamp: new Date(),
        reason: `Imported configuration${environment ? ` for ${environment}` : ''}`}
      });
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  // Validation and testing
  validateCurrentConfiguration(): ValidationResult {
    const envConfig = this.getEnvironmentConfig();
    return this.validator.validateEnvironment(envConfig);
  validateAllEnvironments(): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    for (const [envName, envConfig] of Object.entries(this.schema.environments)) {
      results[envName] = this.validator.validateEnvironment(envConfig);
    return results;
  // Configuration history and versioning
  getHistory(): ConfigurationHistory {
    return { ...this.history };
  rollback(snapshotIndex?: number): void {
    const index = snapshotIndex ?? this.history.snapshots.length - 2; // Previous snapshot;
    const snapshot = this.history.snapshots[index];
    if (!snapshot) {
      throw new Error('No snapshot available for rollback');
    this.schema = snapshot.config;
    this._recordUpdate({)
  path: 'root',
      value: snapshot.config,
      timestamp: new Date(),
      reason: `Rolled back to snapshot from ${snapshot.timestamp.toISOString()}`}
    });
  createSnapshot(description: string): void {
  this._createSnapshot(description);
  // Model registration helpers
  generateRegistrations(environment?: string): ModelRegistration {,
  const envConfig = this.getEnvironmentConfig(environment);
  return envConfig.models.map(config => ({)
  id: config.id,
  provider: config.provider,
  modelName: config.modelName || 'default',
  config: {
  apiKey: config.apiKey,
  endpoint: config.endpoint,
  ...config.parameters
},
  metadata: config.metadata,
      capabilities: config.capabilities;
  }));
  // Private methods
  private _createDefaultSchema(): ConfigurationSchema {
  return {
  version: '1.0.0',
  environments: {
  development: {
  name: 'Development',
  description: 'Development environment configuration',
  models: [],
  defaults: {
  timeout: 30000,
  retries: 3,
  rateLimit: {
  requestsPerMinute: 100,
  tokensPerMinute: 10000,
},
  features: {
  enableCaching: true,
  enableLoadBalancing: false,
  enableHealthChecks: true,
  enableMetrics: true,
},
  staging: {
  name: 'Staging',
  description: 'Staging environment configuration',
  models: [],
  defaults: {
  timeout: 30000,
  retries: 3,
  rateLimit: {
  requestsPerMinute: 500,
  tokensPerMinute: 50000,
},
  features: {
  enableCaching: true,
  enableLoadBalancing: true,
  enableHealthChecks: true,
  enableMetrics: true,
},
  production: {
  name: 'Production',
  description: 'Production environment configuration',
  models: [],
  defaults: {
  timeout: 60000,
  retries: 5,
  rateLimit: {
  requestsPerMinute: 1000,
  tokensPerMinute: 100000,
},
  features: {
  enableCaching: true,
  enableLoadBalancing: true,
  enableHealthChecks: true,
  enableMetrics: true,
},
  modelTemplates: {
  'openai-text': {
  provider: AIModelProvider.OPENAI,
  type: AIModelType.TEXT,
  capabilities: {
  inputTypes: ['text', 'json'],
  outputTypes: ['text', 'json'],
  supportsStreaming: true,
  supportsAsync: true,
}
        'anthropic-text': {
  provider: AIModelProvider.ANTHROPIC,
  type: AIModelType.TEXT,
  capabilities: {
  inputTypes: ['text', 'json', 'image'],
  outputTypes: ['text', 'json'],
  supportsStreaming: true,
  supportsAsync: true,
}
        'local-model': {
  provider: AIModelProvider.LOCAL,
  type: AIModelType.TEXT,
  endpoint: 'http://localhost:11434',
  capabilities: {
  inputTypes: ['text', 'json'],
  outputTypes: ['text', 'json'],
  supportsStreaming: true,
},
  providerDefaults: {
        [AIModelProvider.OPENAI]: {
          parameters: { temperature: 1, max_tokens: 1000 }
  }
        [AIModelProvider.ANTHROPIC]: {
          parameters: { temperature: 1, max_tokens: 1000 }
  }
        [AIModelProvider.LOCAL]: {
          parameters: { temperature: 0.8, max_tokens: 1000 }
  }
        [AIModelProvider.CUSTOM]: {
          parameters: {}
  }
        [AIModelProvider.HUGGINGFACE]: {
          parameters: { temperature: 0.8 }
  }
        [AIModelProvider.STABILITY_AI]: {
          parameters: {}
  }
        [AIModelProvider.ELEVENLABS]: {
          parameters: {}
  }
        [AIModelProvider.RUNWAYML]: {
          parameters: {}
  }
        [AIModelProvider.MIDJOURNEY]: {
          parameters: {}
  }
        [AIModelProvider.PIKA_LABS]: {
          parameters: {}
  }
        [AIModelProvider.SORA]: {
          parameters: {}
  },
  validationRules: [];
  };
  private _recordUpdate(update: ConfigurationUpdate): void {
  this.history.updates.push(update);
  // Keep only last 100 updates
  if (this.history.updates.length > 100) {
  this.history.updates = this.history.updates.slice(-100);
  private _createSnapshot(description: string): void {,
  this.history.snapshots.push({)
  timestamp: new Date(),
  config: JSON.parse(JSON.stringify(this.schema)), // Deep copy,
  version: this.schema.version,
});
    // Keep only last 10 snapshots
    if (this.history.snapshots.length > 10) {
      this.history.snapshots = this.history.snapshots.slice(-10);

export default ConfigurationManager;