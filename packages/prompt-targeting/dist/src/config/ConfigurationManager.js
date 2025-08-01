/**
 * Configuration management system for prompt targeting
 * Epic 10.2.2 - Configuration System with Schema and UI Components
 */
import { z } from 'zod';
import { EventEmitter } from 'events';
/**
 * Platform-specific configuration schemas
 */
export const OpenAIConfigSchema = z.object({
    apiKey: z.string().optional(),
    model: z.enum(['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4-32k', 'gpt-4-turbo']).default('gpt-4'),
    organization: z.string().optional(),
    baseURL: z.string().url().optional(),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(128000).default(4096),
    topP: z.number().min(0).max(1).default(1),
    frequencyPenalty: z.number().min(-2).max(2).default(0),
    presencePenalty: z.number().min(-2).max(2).default(0),
    stopSequences: z.array(z.string()).max(4).default([]),
});
export const MidjourneyConfigSchema = z.object({
    version: z.enum(['5', '5.1', '5.2', '6']).default('6'),
    defaultAspectRatio: z.string().default('1:1'),
    defaultQuality: z.number().min(0.25).max(2).default(1),
    defaultStylize: z.number().min(0).max(1000).default(100),
    defaultChaos: z.number().min(0).max(100).default(0),
    enableUpscaling: z.boolean().default(true),
    enableVariations: z.boolean().default(true),
});
export const DALLEConfigSchema = z.object({
    model: z.enum(['dall-e-2', 'dall-e-3']).default('dall-e-3'),
    size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
    quality: z.enum(['standard', 'hd']).default('standard'),
    style: z.enum(['vivid', 'natural']).default('vivid'),
    n: z.number().min(1).max(10).default(1),
});
/**
 * Global configuration schema
 */
export const GlobalConfigSchema = z.object({
    // Quality and style preferences
    qualityPreference: z.number().min(0).max(1).default(0.7),
    stylePreference: z.enum(['default', 'artistic', 'photorealistic', 'minimal']).default('default'),
    enableOptimizations: z.boolean().default(true),
    // Platform overrides
    platformOverrides: z
        .object({
        openai: OpenAIConfigSchema.partial().optional(),
        midjourney: MidjourneyConfigSchema.partial().optional(),
        dalle: DALLEConfigSchema.partial().optional(),
    })
        .default({}),
    // Pipeline configuration
    pipeline: z
        .object({
        skipValidation: z.boolean().default(false),
        skipOptimization: z.boolean().default(false),
        stageTimeouts: z.record(z.number()).default({}),
        retries: z
            .object({
            maxAttempts: z.number().min(1).max(10).default(3),
            backoffMs: z.number().min(10).max(5000).default(100),
            retryableErrors: z.array(z.string()).default(['NETWORK_ERROR', 'TIMEOUT_ERROR', 'RATE_LIMIT_ERROR']),
        })
            .default({}),
    })
        .default({}),
    // Monitoring configuration
    monitoring: z
        .object({
        enableTiming: z.boolean().default(true),
        enableMemoryTracking: z.boolean().default(false),
        enableEvents: z.boolean().default(true),
        enableLogging: z.boolean().default(true),
    })
        .default({}),
    // Custom mappings
    customMappings: z.record(z.unknown()).default({}),
});
/**
 * Comprehensive configuration manager
 */
export class ConfigurationManager extends EventEmitter {
    config;
    presets = new Map();
    configHistory = [];
    logger = console;
    constructor(initialConfig) {
        super();
        this.config = GlobalConfigSchema.parse(initialConfig || {});
        this.initializeBuiltInPresets();
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return structuredClone(this.config);
    }
    /**
     * Update configuration with validation
     */
    updateConfig(updates, reason = 'Manual update') {
        const oldConfig = structuredClone(this.config);
        try {
            // Merge updates with current config
            const newConfig = this.mergeConfigs(this.config, updates);
            // Validate merged config
            const validationResult = this.validateConfig(newConfig);
            if (validationResult.valid) {
                this.config = newConfig;
                // Add to history
                this.configHistory.push({
                    timestamp: new Date(),
                    config: structuredClone(newConfig),
                    reason,
                });
                // Emit change events
                this.emitConfigChanges(oldConfig, newConfig);
                this.logger.log(`Configuration updated: ${reason}`);
            }
            this.emit('config:validated', validationResult);
            return validationResult;
        }
        catch (error) {
            const validationResult = {
                valid: false,
                errors: [
                    {
                        path: 'root',
                        message: error instanceof Error ? error.message : 'Unknown validation error',
                        code: 'VALIDATION_ERROR',
                    },
                ],
                warnings: [],
            };
            this.emit('config:validated', validationResult);
            return validationResult;
        }
    }
    /**
     * Set specific configuration value
     */
    setConfigValue(path, value) {
        const updates = this.createNestedUpdate(path, value);
        return this.updateConfig(updates, `Set ${path} = ${JSON.stringify(value)}`);
    }
    /**
     * Get specific configuration value
     */
    getConfigValue(path) {
        return this.getNestedValue(this.config, path);
    }
    /**
     * Validate configuration
     */
    validateConfig(config = this.config) {
        try {
            GlobalConfigSchema.parse(config);
            // Additional business logic validation
            const warnings = this.performBusinessValidation(config);
            return {
                valid: true,
                errors: [],
                warnings,
            };
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    valid: false,
                    errors: error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message,
                        code: err.code,
                    })),
                    warnings: [],
                };
            }
            return {
                valid: false,
                errors: [
                    {
                        path: 'root',
                        message: error instanceof Error ? error.message : 'Unknown error',
                        code: 'UNKNOWN_ERROR',
                    },
                ],
                warnings: [],
            };
        }
    }
    /**
     * Create configuration preset
     */
    createPreset(name, description, config = this.config, tags = []) {
        const preset = {
            name,
            description,
            config: GlobalConfigSchema.parse(config),
            tags,
            isBuiltIn: false,
            created: new Date(),
            updated: new Date(),
        };
        this.presets.set(name, preset);
        this.logger.log(`Created configuration preset: ${name}`);
    }
    /**
     * Apply configuration preset
     */
    applyPreset(name) {
        const preset = this.presets.get(name);
        if (!preset) {
            return {
                valid: false,
                errors: [
                    {
                        path: 'preset',
                        message: `Preset '${name}' not found`,
                        code: 'PRESET_NOT_FOUND',
                    },
                ],
                warnings: [],
            };
        }
        const result = this.updateConfig(preset.config, `Applied preset: ${name}`);
        if (result.valid) {
            this.emit('config:preset:applied', name, preset.config);
        }
        return result;
    }
    /**
     * List available presets
     */
    listPresets(tags) {
        const presets = Array.from(this.presets.values());
        if (tags && tags.length > 0) {
            return presets.filter(preset => tags.some(tag => preset.tags.includes(tag)));
        }
        return presets;
    }
    /**
     * Delete preset
     */
    deletePreset(name) {
        const preset = this.presets.get(name);
        if (!preset) {
            return false;
        }
        if (preset.isBuiltIn) {
            throw new Error('Cannot delete built-in presets');
        }
        this.presets.delete(name);
        this.logger.log(`Deleted configuration preset: ${name}`);
        return true;
    }
    /**
     * Export configuration
     */
    exportConfig(format = 'json') {
        const config = this.getConfig();
        let exported;
        switch (format) {
            case 'json':
                exported = JSON.stringify(config, null, 2);
                break;
            case 'yaml':
                // Simple YAML export - in production, use a proper YAML library
                exported = this.configToYaml(config);
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
        this.emit('config:exported', format, config);
        return exported;
    }
    /**
     * Import configuration
     */
    importConfig(data, format = 'json') {
        try {
            let imported;
            switch (format) {
                case 'json':
                    imported = JSON.parse(data);
                    break;
                case 'yaml':
                    // Simple YAML import - in production, use a proper YAML library
                    imported = this.yamlToConfig(data);
                    break;
                default:
                    throw new Error(`Unsupported import format: ${format}`);
            }
            const result = this.updateConfig(imported, `Imported from ${format}`);
            if (result.valid) {
                this.emit('config:imported', format, this.config);
            }
            return result;
        }
        catch (error) {
            return {
                valid: false,
                errors: [
                    {
                        path: 'import',
                        message: `Failed to import ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'IMPORT_ERROR',
                    },
                ],
                warnings: [],
            };
        }
    }
    /**
     * Get configuration history
     */
    getConfigHistory(limit = 10) {
        return this.configHistory.slice(-limit).map(entry => ({
            timestamp: entry.timestamp,
            reason: entry.reason,
        }));
    }
    /**
     * Reset to default configuration
     */
    resetToDefaults() {
        const defaultConfig = GlobalConfigSchema.parse({});
        return this.updateConfig(defaultConfig, 'Reset to defaults');
    }
    /**
     * Get configuration summary for UI
     */
    getConfigSummary() {
        const platforms = Object.keys(this.config.platformOverrides).filter(platform => Object.keys(this.config.platformOverrides[platform] || {})
            .length > 0);
        const qualityLevel = this.config.qualityPreference > 0.8 ? 'High' : this.config.qualityPreference > 0.5 ? 'Medium' : 'Low';
        const lastEntry = this.configHistory[this.configHistory.length - 1];
        return {
            platforms,
            qualityLevel,
            optimizationsEnabled: this.config.enableOptimizations,
            presetCount: this.presets.size,
            lastUpdated: lastEntry?.timestamp || null,
        };
    }
    /**
     * Initialize built-in presets
     */
    initializeBuiltInPresets() {
        // High Quality Preset
        this.presets.set('high-quality', {
            name: 'High Quality',
            description: 'Optimized for highest quality output with minimal creativity',
            config: GlobalConfigSchema.parse({
                qualityPreference: 0.9,
                stylePreference: 'photorealistic',
                enableOptimizations: true,
                platformOverrides: {
                    openai: { temperature: 0.2, topP: 0.8 },
                    midjourney: { defaultQuality: 2, defaultStylize: 50 },
                },
            }),
            tags: ['quality', 'professional', 'precise'],
            isBuiltIn: true,
            created: new Date(),
            updated: new Date(),
        });
        // Creative Preset
        this.presets.set('creative', {
            name: 'Creative',
            description: 'Optimized for creative and artistic output',
            config: GlobalConfigSchema.parse({
                qualityPreference: 0.6,
                stylePreference: 'artistic',
                enableOptimizations: true,
                platformOverrides: {
                    openai: { temperature: 0.8, topP: 0.9 },
                    midjourney: { defaultQuality: 1, defaultStylize: 250, defaultChaos: 25 },
                },
            }),
            tags: ['creative', 'artistic', 'experimental'],
            isBuiltIn: true,
            created: new Date(),
            updated: new Date(),
        });
        // Fast Processing Preset
        this.presets.set('fast', {
            name: 'Fast Processing',
            description: 'Optimized for speed with basic quality',
            config: GlobalConfigSchema.parse({
                qualityPreference: 0.5,
                stylePreference: 'minimal',
                enableOptimizations: false,
                pipeline: {
                    skipOptimization: true,
                    stageTimeouts: {
                        validation: 1000,
                        transformation: 2000,
                    },
                },
                platformOverrides: {
                    openai: { temperature: 0.7, maxTokens: 1000 },
                    midjourney: { defaultQuality: 0.5 },
                },
            }),
            tags: ['fast', 'basic', 'efficient'],
            isBuiltIn: true,
            created: new Date(),
            updated: new Date(),
        });
        this.logger.log('Initialized built-in configuration presets');
    }
    /**
     * Merge configurations deeply
     */
    mergeConfigs(base, updates) {
        const merged = structuredClone(base);
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    merged[key] = this.mergeObjects(merged[key] || {}, value);
                }
                else {
                    merged[key] = value;
                }
            }
        }
        return merged;
    }
    /**
     * Merge objects recursively
     */
    mergeObjects(target, source) {
        const result = { ...target };
        for (const [key, value] of Object.entries(source)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result[key] = this.mergeObjects(result[key] || {}, value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    /**
     * Create nested update object from path
     */
    createNestedUpdate(path, value) {
        const parts = path.split('.');
        const update = {};
        let current = update;
        for (let i = 0; i < parts.length - 1; i++) {
            current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return update;
    }
    /**
     * Get nested value from object
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    /**
     * Perform business logic validation
     */
    performBusinessValidation(config) {
        const warnings = [];
        // Check for conflicting settings
        if (config.qualityPreference > 0.8 && config.stylePreference === 'minimal') {
            warnings.push({
                path: 'stylePreference',
                message: 'High quality preference with minimal style may produce unexpected results',
                suggestion: 'Consider using photorealistic or artistic style for high quality',
            });
        }
        // Check OpenAI settings
        const openaiConfig = config.platformOverrides.openai;
        if (openaiConfig?.temperature && openaiConfig.temperature > 1.5 && config.qualityPreference > 0.7) {
            warnings.push({
                path: 'platformOverrides.openai.temperature',
                message: 'High temperature with high quality preference may reduce output consistency',
                suggestion: 'Lower temperature for more consistent high-quality results',
            });
        }
        // Check Midjourney settings
        const midjourneyConfig = config.platformOverrides.midjourney;
        if (midjourneyConfig?.defaultChaos && midjourneyConfig.defaultChaos > 50 && config.qualityPreference > 0.8) {
            warnings.push({
                path: 'platformOverrides.midjourney.defaultChaos',
                message: 'High chaos with high quality preference may produce unpredictable results',
                suggestion: 'Lower chaos value for more predictable high-quality images',
            });
        }
        return warnings;
    }
    /**
     * Emit configuration change events
     */
    emitConfigChanges(oldConfig, newConfig) {
        const changes = this.getConfigChanges(oldConfig, newConfig);
        for (const change of changes) {
            this.emit('config:changed', change.path, change.newValue, change.oldValue);
        }
    }
    /**
     * Get configuration changes between two configs
     */
    getConfigChanges(oldConfig, newConfig, path = '') {
        const changes = [];
        const allKeys = new Set([...Object.keys(oldConfig || {}), ...Object.keys(newConfig || {})]);
        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            const oldValue = oldConfig?.[key];
            const newValue = newConfig?.[key];
            if (oldValue !== newValue) {
                if (typeof oldValue === 'object' &&
                    typeof newValue === 'object' &&
                    oldValue !== null &&
                    newValue !== null &&
                    !Array.isArray(oldValue) &&
                    !Array.isArray(newValue)) {
                    changes.push(...this.getConfigChanges(oldValue, newValue, currentPath));
                }
                else {
                    changes.push({
                        path: currentPath,
                        oldValue,
                        newValue,
                    });
                }
            }
        }
        return changes;
    }
    /**
     * Simple config to YAML conversion
     */
    configToYaml(config, indent = 0) {
        const spaces = ' '.repeat(indent);
        let yaml = '';
        for (const [key, value] of Object.entries(config)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                yaml += this.configToYaml(value, indent + 2);
            }
            else if (Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                for (const item of value) {
                    yaml += `${spaces}  - ${item}\n`;
                }
            }
            else {
                yaml += `${spaces}${key}: ${value}\n`;
            }
        }
        return yaml;
    }
    /**
     * Simple YAML to config conversion
     */
    yamlToConfig(yaml) {
        // Very basic YAML parser - in production, use a proper library
        const lines = yaml.split('\n').filter(line => line.trim());
        const config = {};
        for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            if (valueParts.length > 0) {
                const value = valueParts.join(':').trim();
                config[key.trim()] = this.parseYamlValue(value);
            }
        }
        return config;
    }
    /**
     * Parse YAML value to appropriate type
     */
    parseYamlValue(value) {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        if (value === 'null')
            return null;
        if (/^-?\d+$/.test(value))
            return parseInt(value, 10);
        if (/^-?\d*\.\d+$/.test(value))
            return parseFloat(value);
        return value;
    }
}
//# sourceMappingURL=ConfigurationManager.js.map