import { z } from 'zod';
import { Platform, ParameterSpec } from '../types/index.js';

/**
 * Comprehensive configuration management system for adaptors
 */
export class ConfigurationManager {
  private configurations = new Map<string, AdaptorConfiguration>();
  private presets = new Map<string, ConfigurationPreset>();
  private schemas = new Map<string, z.ZodSchema>();
  private changeListeners = new Set<ConfigurationChangeListener>();

  constructor(
    private logger: any,
    private cache: any
  ) {
    this.setupDefaultSchemas();
  }

  /**
   * Register configuration schema for an adaptor
   */
  registerSchema(adaptorId: string, schema: z.ZodSchema, metadata?: SchemaMetadata): void {
    this.schemas.set(adaptorId, schema);

    this.logger.info('Configuration schema registered', {
      adaptorId,
      hasMetadata: !!metadata,
    });
  }

  /**
   * Set configuration for an adaptor with validation
   */
  async setConfiguration(
    adaptorId: string,
    config: Record<string, any>,
    options: SetConfigurationOptions = {}
  ): Promise<void> {
    // Validate configuration
    const schema = this.schemas.get(adaptorId);
    if (schema) {
      try {
        const validatedConfig = schema.parse(config);
        config = validatedConfig;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = error instanceof Error && 'errors' in error ? (error as any).errors : undefined;
        throw new ConfigurationError(`Invalid configuration for ${adaptorId}: ${errorMessage}`, 'VALIDATION_ERROR', {
          adaptorId,
          validationErrors: errorDetails,
        });
      }
    }

    // Apply inheritance and overrides
    const finalConfig = await this.applyInheritanceAndOverrides(adaptorId, config, options);

    // Store configuration
    const configuration: AdaptorConfiguration = {
      adaptorId,
      config: finalConfig,
      metadata: {
        version: options.version || '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        source: options.source || 'manual',
        environment: options.environment || 'default',
      },
      inheritance: options.inherit
        ? {
            parentId: options.inherit.parentId,
            overrides: options.inherit.overrides || {},
          }
        : undefined,
    };

    const oldConfig = this.configurations.get(adaptorId);
    this.configurations.set(adaptorId, configuration);

    // Cache configuration
    await this.cacheConfiguration(adaptorId, configuration);

    // Notify listeners
    await this.notifyConfigurationChange(adaptorId, oldConfig, configuration);

    this.logger.info('Configuration updated', {
      adaptorId,
      hasInheritance: !!configuration.inheritance,
      environment: configuration.metadata.environment,
    });
  }

  /**
   * Get configuration for an adaptor
   */
  getConfiguration(adaptorId: string, environment?: string): AdaptorConfiguration | undefined {
    const config = this.configurations.get(adaptorId);

    if (!config) {
      return undefined;
    }

    // Filter by environment if specified
    if (environment && config.metadata.environment !== environment) {
      return undefined;
    }

    return config;
  }

  /**
   * Get configuration value with type safety
   */
  getConfigurationValue<T = any>(adaptorId: string, path: string, defaultValue?: T): T | undefined {
    const config = this.getConfiguration(adaptorId);
    if (!config) {
      return defaultValue;
    }

    return this.getNestedValue(config.config, path) ?? defaultValue;
  }

  /**
   * Update specific configuration values
   */
  async updateConfiguration(
    adaptorId: string,
    updates: Record<string, any>,
    options: UpdateConfigurationOptions = {}
  ): Promise<void> {
    const existingConfig = this.getConfiguration(adaptorId);
    if (!existingConfig) {
      throw new ConfigurationError(`No configuration found for adaptor: ${adaptorId}`, 'NOT_FOUND', { adaptorId });
    }

    const updatedConfig = this.mergeConfiguration(existingConfig.config, updates, options.mergeStrategy || 'deep');

    await this.setConfiguration(adaptorId, updatedConfig, {
      version: this.incrementVersion(existingConfig.metadata.version),
      environment: existingConfig.metadata.environment,
      source: options.source || 'update',
    });
  }

  /**
   * Create configuration preset
   */
  createPreset(preset: ConfigurationPreset): void {
    this.validatePreset(preset);
    this.presets.set(preset.id, preset);

    this.logger.info('Configuration preset created', {
      presetId: preset.id,
      platforms: preset.platforms,
    });
  }

  /**
   * Apply configuration preset to an adaptor
   */
  async applyPreset(adaptorId: string, presetId: string, overrides?: Record<string, any>): Promise<void> {
    const preset = this.presets.get(presetId);
    if (!preset) {
      throw new ConfigurationError(`Preset not found: ${presetId}`, 'PRESET_NOT_FOUND', { presetId });
    }

    let config = { ...preset.configuration };

    // Apply overrides if provided
    if (overrides) {
      config = this.mergeConfiguration(config, overrides, 'deep');
    }

    await this.setConfiguration(adaptorId, config, {
      version: preset.version,
      source: `preset:${presetId}`,
      environment: preset.environment || 'default',
    });
  }

  /**
   * Import configuration from various formats
   */
  async importConfiguration(
    data: string | object,
    format: ConfigurationFormat,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    let parsedData: any;

    try {
      // Parse data based on format
      switch (format) {
        case 'json':
          parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          break;
        case 'yaml':
          // Note: Would need yaml library in real implementation
          throw new Error('YAML import not implemented yet');
        case 'env':
          parsedData = this.parseEnvironmentVariables(data as string);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const result: ImportResult = {
        success: true,
        imported: 0,
        failed: 0,
        errors: [],
      };

      // Import configurations
      if (Array.isArray(parsedData)) {
        // Multiple configurations
        for (const configData of parsedData) {
          try {
            await this.importSingleConfiguration(configData, options);
            result.imported++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              adaptorId: configData.adaptorId || 'unknown',
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      } else if (parsedData.adaptorId) {
        // Single configuration
        try {
          await this.importSingleConfiguration(parsedData, options);
          result.imported++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            adaptorId: parsedData.adaptorId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        // Bulk configurations by adaptor ID
        for (const [adaptorId, config] of Object.entries(parsedData)) {
          try {
            await this.setConfiguration(adaptorId, config as Record<string, any>, {
              source: 'import',
              environment: options.environment,
            });
            result.imported++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              adaptorId,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      this.logger.info('Configuration import completed', {
        imported: result.imported,
        failed: result.failed,
        format,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Configuration import failed', {
        error: errorMessage,
        format,
      });

      return {
        success: false,
        imported: 0,
        failed: 1,
        errors: [{ adaptorId: 'unknown', error: errorMessage }],
      };
    }
  }

  /**
   * Export configurations in various formats
   */
  exportConfiguration(
    adaptorIds?: string[],
    format: ConfigurationFormat = 'json',
    options: ExportOptions = {}
  ): string {
    const configs = this.getConfigurationsForExport(adaptorIds, options);

    switch (format) {
      case 'json':
        return JSON.stringify(configs, null, options.pretty ? 2 : 0);
      case 'yaml':
        // Note: Would need yaml library in real implementation
        throw new Error('YAML export not implemented yet');
      case 'env':
        return this.exportAsEnvironmentVariables(configs);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Validate configuration against schema
   */
  validateConfiguration(adaptorId: string, config: Record<string, any>): ValidationResult {
    const schema = this.schemas.get(adaptorId);

    if (!schema) {
      return {
        valid: true,
        errors: [],
        warnings: [`No schema registered for adaptor: ${adaptorId}`],
      };
    }

    try {
      schema.parse(config);
      return {
        valid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error && 'errors' in error ? (error as any).errors : undefined;
      return {
        valid: false,
        errors: errorDetails || [errorMessage],
        warnings: [],
      };
    }
  }

  /**
   * Get configuration differences between environments
   */
  getConfigurationDiff(adaptorId: string, fromEnvironment: string, toEnvironment: string): ConfigurationDiff {
    const fromConfig = this.getConfiguration(adaptorId);
    const toConfig = this.getConfiguration(adaptorId);

    // Note: This is simplified - real implementation would maintain separate configs per environment
    return {
      adaptorId,
      fromEnvironment,
      toEnvironment,
      differences: [],
      summary: 'No differences found (single environment implementation)',
    };
  }

  /**
   * Add configuration change listener
   */
  addChangeListener(listener: ConfigurationChangeListener): void {
    this.changeListeners.add(listener);
  }

  /**
   * Remove configuration change listener
   */
  removeChangeListener(listener: ConfigurationChangeListener): void {
    this.changeListeners.delete(listener);
  }

  /**
   * Get available presets
   */
  getPresets(platform?: Platform): ConfigurationPreset[] {
    const allPresets = Array.from(this.presets.values());

    if (platform) {
      return allPresets.filter(preset => preset.platforms.includes(platform));
    }

    return allPresets;
  }

  /**
   * Get configuration history (simplified implementation)
   */
  getConfigurationHistory(adaptorId: string): ConfigurationHistoryEntry[] {
    // Note: Real implementation would maintain history in persistent storage
    const config = this.getConfiguration(adaptorId);

    if (!config) {
      return [];
    }

    return [
      {
        version: config.metadata.version,
        timestamp: config.metadata.updatedAt,
        changes: ['Configuration loaded'],
        author: 'system',
      },
    ];
  }

  // Private helper methods

  private setupDefaultSchemas(): void {
    // Setup common configuration schemas
    const baseConfigSchema = z.object({
      enabled: z.boolean().default(true),
      timeout: z.number().min(0).default(30000),
      retries: z.number().min(0).max(10).default(3),
      cacheTTL: z.number().min(0).default(3600),
    });

    // Register base schema for all adaptors
    this.schemas.set('base', baseConfigSchema);
  }

  private async applyInheritanceAndOverrides(
    adaptorId: string,
    config: Record<string, any>,
    options: SetConfigurationOptions
  ): Promise<Record<string, any>> {
    let finalConfig = { ...config };

    // Apply inheritance
    if (options.inherit?.parentId) {
      const parentConfig = this.getConfiguration(options.inherit.parentId);
      if (parentConfig) {
        finalConfig = this.mergeConfiguration(parentConfig.config, finalConfig, 'deep');
      }
    }

    // Apply environment-specific overrides
    if (options.environment && options.environment !== 'default') {
      const envOverrides = await this.getEnvironmentOverrides(adaptorId, options.environment);
      if (envOverrides) {
        finalConfig = this.mergeConfiguration(finalConfig, envOverrides, 'deep');
      }
    }

    // Apply explicit overrides
    if (options.inherit?.overrides) {
      finalConfig = this.mergeConfiguration(finalConfig, options.inherit.overrides, 'deep');
    }

    return finalConfig;
  }

  private mergeConfiguration(
    base: Record<string, any>,
    override: Record<string, any>,
    strategy: 'shallow' | 'deep'
  ): Record<string, any> {
    if (strategy === 'shallow') {
      return { ...base, ...override };
    }

    // Deep merge implementation
    const result = { ...base };

    for (const [key, value] of Object.entries(override)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.mergeConfiguration(result[key] || {}, value, 'deep');
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private async cacheConfiguration(adaptorId: string, configuration: AdaptorConfiguration): Promise<void> {
    const cacheKey = `config:${adaptorId}:${configuration.metadata.environment}`;
    await this.cache.set(cacheKey, configuration, 86400); // 24 hours
  }

  private async notifyConfigurationChange(
    adaptorId: string,
    oldConfig: AdaptorConfiguration | undefined,
    newConfig: AdaptorConfiguration
  ): Promise<void> {
    const event: ConfigurationChangeEvent = {
      adaptorId,
      oldConfiguration: oldConfig,
      newConfiguration: newConfig,
      timestamp: new Date(),
      source: newConfig.metadata.source,
    };

    for (const listener of this.changeListeners) {
      try {
        await listener(event);
      } catch (error) {
        this.logger.error('Configuration change listener failed', {
          adaptorId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`;
  }

  private validatePreset(preset: ConfigurationPreset): void {
    if (!preset.id || !preset.name) {
      throw new ConfigurationError('Preset must have id and name', 'INVALID_PRESET');
    }

    if (!preset.platforms || preset.platforms.length === 0) {
      throw new ConfigurationError('Preset must specify at least one platform', 'INVALID_PRESET');
    }

    if (!preset.configuration) {
      throw new ConfigurationError('Preset must have configuration object', 'INVALID_PRESET');
    }
  }

  private parseEnvironmentVariables(envString: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = envString.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          result[key.trim()] = this.parseEnvironmentValue(value);
        }
      }
    }

    return result;
  }

  private parseEnvironmentValue(value: string): any {
    // Try to parse as JSON
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    // Parse boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Parse number
    if (/^\d+$/.test(value)) return parseInt(value);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

    return value;
  }

  private async importSingleConfiguration(configData: any, options: ImportOptions): Promise<void> {
    if (!configData.adaptorId) {
      throw new Error('Configuration must have adaptorId');
    }

    await this.setConfiguration(configData.adaptorId, configData.config || configData, {
      version: configData.version,
      environment: options.environment || configData.environment,
      source: 'import',
    });
  }

  private getConfigurationsForExport(adaptorIds?: string[], options: ExportOptions = {}): any {
    const configs: Record<string, any> = {};

    const targetIds = adaptorIds || Array.from(this.configurations.keys());

    for (const adaptorId of targetIds) {
      const config = this.getConfiguration(adaptorId, options.environment);
      if (config) {
        configs[adaptorId] = options.includeMetadata ? config : config.config;
      }
    }

    return options.singleAdaptor && adaptorIds?.length === 1 ? configs[adaptorIds[0]] : configs;
  }

  private exportAsEnvironmentVariables(configs: Record<string, any>): string {
    const lines: string[] = [];

    for (const [adaptorId, config] of Object.entries(configs)) {
      lines.push(`# Configuration for ${adaptorId}`);
      this.flattenObjectToEnvVars(config, adaptorId.toUpperCase(), lines);
      lines.push('');
    }

    return lines.join('\n');
  }

  private flattenObjectToEnvVars(obj: any, prefix: string, lines: string[]): void {
    for (const [key, value] of Object.entries(obj)) {
      const envKey = `${prefix}_${key.toUpperCase()}`;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.flattenObjectToEnvVars(value, envKey, lines);
      } else {
        const envValue = Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : String(value);

        lines.push(`${envKey}="${envValue}"`);
      }
    }
  }

  private async getEnvironmentOverrides(adaptorId: string, environment: string): Promise<Record<string, any> | null> {
    // Note: Real implementation would load from environment-specific storage
    return null;
  }
}

// Type definitions

export interface AdaptorConfiguration {
  adaptorId: string;
  config: Record<string, any>;
  metadata: ConfigurationMetadata;
  inheritance?: InheritanceInfo;
}

export interface ConfigurationMetadata {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  source: string;
  environment: string;
}

export interface InheritanceInfo {
  parentId: string;
  overrides: Record<string, any>;
}

export interface ConfigurationPreset {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  configuration: Record<string, any>;
  version?: string;
  environment?: string;
  tags?: string[];
}

export interface SetConfigurationOptions {
  version?: string;
  environment?: string;
  source?: string;
  inherit?: {
    parentId: string;
    overrides?: Record<string, any>;
  };
}

export interface UpdateConfigurationOptions {
  mergeStrategy?: 'shallow' | 'deep';
  source?: string;
}

export interface SchemaMetadata {
  title?: string;
  description?: string;
  version?: string;
  deprecated?: boolean;
}

export type ConfigurationFormat = 'json' | 'yaml' | 'env';

export interface ImportOptions {
  environment?: string;
  overwrite?: boolean;
  validateOnly?: boolean;
}

export interface ExportOptions {
  environment?: string;
  includeMetadata?: boolean;
  pretty?: boolean;
  singleAdaptor?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    adaptorId: string;
    error: string;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigurationDiff {
  adaptorId: string;
  fromEnvironment: string;
  toEnvironment: string;
  differences: Array<{
    path: string;
    fromValue: any;
    toValue: any;
    type: 'added' | 'removed' | 'changed';
  }>;
  summary: string;
}

export interface ConfigurationHistoryEntry {
  version: string;
  timestamp: Date;
  changes: string[];
  author: string;
}

export interface ConfigurationChangeEvent {
  adaptorId: string;
  oldConfiguration?: AdaptorConfiguration;
  newConfiguration: AdaptorConfiguration;
  timestamp: Date;
  source: string;
}

export type ConfigurationChangeListener = (event: ConfigurationChangeEvent) => Promise<void>;

export class ConfigurationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}
