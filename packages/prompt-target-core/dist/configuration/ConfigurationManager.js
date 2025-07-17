import { z } from 'zod';
/**
 * Comprehensive configuration management system for adaptors
 */
export class ConfigurationManager {
    constructor(logger, cache) {
        this.logger = logger;
        this.cache = cache;
        this.configurations = new Map();
        this.presets = new Map();
        this.schemas = new Map();
        this.changeListeners = new Set();
        this.setupDefaultSchemas();
    }
    /**
     * Register configuration schema for an adaptor
     */
    registerSchema(adaptorId, schema, metadata) {
        this.schemas.set(adaptorId, schema);
        this.logger.info('Configuration schema registered', {
            adaptorId,
            hasMetadata: !!metadata
        });
    }
    /**
     * Set configuration for an adaptor with validation
     */
    async setConfiguration(adaptorId, config, options = {}) {
        // Validate configuration
        const schema = this.schemas.get(adaptorId);
        if (schema) {
            try {
                const validatedConfig = schema.parse(config);
                config = validatedConfig;
            }
            catch (error) {
                throw new ConfigurationError(`Invalid configuration for ${adaptorId}: ${error.message}`, 'VALIDATION_ERROR', { adaptorId, validationErrors: error.errors });
            }
        }
        // Apply inheritance and overrides
        const finalConfig = await this.applyInheritanceAndOverrides(adaptorId, config, options);
        // Store configuration
        const configuration = {
            adaptorId,
            config: finalConfig,
            metadata: {
                version: options.version || '1.0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                source: options.source || 'manual',
                environment: options.environment || 'default'
            },
            inheritance: options.inherit ? {
                parentId: options.inherit.parentId,
                overrides: options.inherit.overrides || {}
            } : undefined
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
            environment: configuration.metadata.environment
        });
    }
    /**
     * Get configuration for an adaptor
     */
    getConfiguration(adaptorId, environment) {
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
    getConfigurationValue(adaptorId, path, defaultValue) {
        const config = this.getConfiguration(adaptorId);
        if (!config) {
            return defaultValue;
        }
        return this.getNestedValue(config.config, path) ?? defaultValue;
    }
    /**
     * Update specific configuration values
     */
    async updateConfiguration(adaptorId, updates, options = {}) {
        const existingConfig = this.getConfiguration(adaptorId);
        if (!existingConfig) {
            throw new ConfigurationError(`No configuration found for adaptor: ${adaptorId}`, 'NOT_FOUND', { adaptorId });
        }
        const updatedConfig = this.mergeConfiguration(existingConfig.config, updates, options.mergeStrategy || 'deep');
        await this.setConfiguration(adaptorId, updatedConfig, {
            version: this.incrementVersion(existingConfig.metadata.version),
            environment: existingConfig.metadata.environment,
            source: options.source || 'update'
        });
    }
    /**
     * Create configuration preset
     */
    createPreset(preset) {
        this.validatePreset(preset);
        this.presets.set(preset.id, preset);
        this.logger.info('Configuration preset created', {
            presetId: preset.id,
            platforms: preset.platforms
        });
    }
    /**
     * Apply configuration preset to an adaptor
     */
    async applyPreset(adaptorId, presetId, overrides) {
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
            environment: preset.environment || 'default'
        });
    }
    /**
     * Import configuration from various formats
     */
    async importConfiguration(data, format, options = {}) {
        let parsedData;
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
                    parsedData = this.parseEnvironmentVariables(data);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            const result = {
                success: true,
                imported: 0,
                failed: 0,
                errors: []
            };
            // Import configurations
            if (Array.isArray(parsedData)) {
                // Multiple configurations
                for (const configData of parsedData) {
                    try {
                        await this.importSingleConfiguration(configData, options);
                        result.imported++;
                    }
                    catch (error) {
                        result.failed++;
                        result.errors.push({
                            adaptorId: configData.adaptorId || 'unknown',
                            error: error.message
                        });
                    }
                }
            }
            else if (parsedData.adaptorId) {
                // Single configuration
                try {
                    await this.importSingleConfiguration(parsedData, options);
                    result.imported++;
                }
                catch (error) {
                    result.failed++;
                    result.errors.push({
                        adaptorId: parsedData.adaptorId,
                        error: error.message
                    });
                }
            }
            else {
                // Bulk configurations by adaptor ID
                for (const [adaptorId, config] of Object.entries(parsedData)) {
                    try {
                        await this.setConfiguration(adaptorId, config, {
                            source: 'import',
                            environment: options.environment
                        });
                        result.imported++;
                    }
                    catch (error) {
                        result.failed++;
                        result.errors.push({
                            adaptorId,
                            error: error.message
                        });
                    }
                }
            }
            this.logger.info('Configuration import completed', {
                imported: result.imported,
                failed: result.failed,
                format
            });
            return result;
        }
        catch (error) {
            this.logger.error('Configuration import failed', {
                error: error.message,
                format
            });
            return {
                success: false,
                imported: 0,
                failed: 1,
                errors: [{ adaptorId: 'unknown', error: error.message }]
            };
        }
    }
    /**
     * Export configurations in various formats
     */
    exportConfiguration(adaptorIds, format = 'json', options = {}) {
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
    validateConfiguration(adaptorId, config) {
        const schema = this.schemas.get(adaptorId);
        if (!schema) {
            return {
                valid: true,
                errors: [],
                warnings: [`No schema registered for adaptor: ${adaptorId}`]
            };
        }
        try {
            schema.parse(config);
            return {
                valid: true,
                errors: [],
                warnings: []
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: error.errors || [error.message],
                warnings: []
            };
        }
    }
    /**
     * Get configuration differences between environments
     */
    getConfigurationDiff(adaptorId, fromEnvironment, toEnvironment) {
        const fromConfig = this.getConfiguration(adaptorId);
        const toConfig = this.getConfiguration(adaptorId);
        // Note: This is simplified - real implementation would maintain separate configs per environment
        return {
            adaptorId,
            fromEnvironment,
            toEnvironment,
            differences: [],
            summary: 'No differences found (single environment implementation)'
        };
    }
    /**
     * Add configuration change listener
     */
    addChangeListener(listener) {
        this.changeListeners.add(listener);
    }
    /**
     * Remove configuration change listener
     */
    removeChangeListener(listener) {
        this.changeListeners.delete(listener);
    }
    /**
     * Get available presets
     */
    getPresets(platform) {
        const allPresets = Array.from(this.presets.values());
        if (platform) {
            return allPresets.filter(preset => preset.platforms.includes(platform));
        }
        return allPresets;
    }
    /**
     * Get configuration history (simplified implementation)
     */
    getConfigurationHistory(adaptorId) {
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
                author: 'system'
            }
        ];
    }
    // Private helper methods
    setupDefaultSchemas() {
        // Setup common configuration schemas
        const baseConfigSchema = z.object({
            enabled: z.boolean().default(true),
            timeout: z.number().min(0).default(30000),
            retries: z.number().min(0).max(10).default(3),
            cacheTTL: z.number().min(0).default(3600)
        });
        // Register base schema for all adaptors
        this.schemas.set('base', baseConfigSchema);
    }
    async applyInheritanceAndOverrides(adaptorId, config, options) {
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
    mergeConfiguration(base, override, strategy) {
        if (strategy === 'shallow') {
            return { ...base, ...override };
        }
        // Deep merge implementation
        const result = { ...base };
        for (const [key, value] of Object.entries(override)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this.mergeConfiguration(result[key] || {}, value, 'deep');
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    async cacheConfiguration(adaptorId, configuration) {
        const cacheKey = `config:${adaptorId}:${configuration.metadata.environment}`;
        await this.cache.set(cacheKey, configuration, 86400); // 24 hours
    }
    async notifyConfigurationChange(adaptorId, oldConfig, newConfig) {
        const event = {
            adaptorId,
            oldConfiguration: oldConfig,
            newConfiguration: newConfig,
            timestamp: new Date(),
            source: newConfig.metadata.source
        };
        for (const listener of this.changeListeners) {
            try {
                await listener(event);
            }
            catch (error) {
                this.logger.error('Configuration change listener failed', {
                    adaptorId,
                    error: error.message
                });
            }
        }
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    incrementVersion(version) {
        const parts = version.split('.');
        const patch = parseInt(parts[2] || '0') + 1;
        return `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`;
    }
    validatePreset(preset) {
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
    parseEnvironmentVariables(envString) {
        const result = {};
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
    parseEnvironmentValue(value) {
        // Try to parse as JSON
        if (value.startsWith('{') || value.startsWith('[')) {
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        // Parse boolean
        if (value.toLowerCase() === 'true')
            return true;
        if (value.toLowerCase() === 'false')
            return false;
        // Parse number
        if (/^\d+$/.test(value))
            return parseInt(value);
        if (/^\d+\.\d+$/.test(value))
            return parseFloat(value);
        return value;
    }
    async importSingleConfiguration(configData, options) {
        if (!configData.adaptorId) {
            throw new Error('Configuration must have adaptorId');
        }
        await this.setConfiguration(configData.adaptorId, configData.config || configData, {
            version: configData.version,
            environment: options.environment || configData.environment,
            source: 'import'
        });
    }
    getConfigurationsForExport(adaptorIds, options = {}) {
        const configs = {};
        const targetIds = adaptorIds || Array.from(this.configurations.keys());
        for (const adaptorId of targetIds) {
            const config = this.getConfiguration(adaptorId, options.environment);
            if (config) {
                configs[adaptorId] = options.includeMetadata ? config : config.config;
            }
        }
        return options.singleAdaptor && adaptorIds?.length === 1
            ? configs[adaptorIds[0]]
            : configs;
    }
    exportAsEnvironmentVariables(configs) {
        const lines = [];
        for (const [adaptorId, config] of Object.entries(configs)) {
            lines.push(`# Configuration for ${adaptorId}`);
            this.flattenObjectToEnvVars(config, adaptorId.toUpperCase(), lines);
            lines.push('');
        }
        return lines.join('\n');
    }
    flattenObjectToEnvVars(obj, prefix, lines) {
        for (const [key, value] of Object.entries(obj)) {
            const envKey = `${prefix}_${key.toUpperCase()}`;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                this.flattenObjectToEnvVars(value, envKey, lines);
            }
            else {
                const envValue = Array.isArray(value) || typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value);
                lines.push(`${envKey}="${envValue}"`);
            }
        }
    }
    async getEnvironmentOverrides(adaptorId, environment) {
        // Note: Real implementation would load from environment-specific storage
        return null;
    }
}
export class ConfigurationError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ConfigurationError';
    }
}
