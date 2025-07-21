/**
 * Standardized Configuration Management
 * Provides consistent configuration loading, validation, and environment handling
 */

const fs = require('fs');
const path = require('path');
const { getLogger } = require('./AutomationLogger');

class ConfigManager {
    constructor(configPath = null) {
        this.configPath = configPath || path.join(__dirname, '..', 'config');
        this.logger = getLogger('config-manager');
        this.cache = new Map();
        
        // Default configuration structure
        this.defaults = {
            automation: {
                maxRetries: 3,
                retryDelay: 1000,
                timeout: 30000,
                batchSize: 10,
                enableLogging: true,
                logLevel: 'INFO'
            },
            qa: {
                passThreshold: 3.0,
                autoApproveThreshold: 4.5,
                maxIssuesPerReject: 3,
                reviewTimeout: 300000,
                enableBatchProcessing: true
            },
            state: {
                stateFile: path.join(__dirname, '..', 'data', 'state.json'),
                backupCount: 5,
                lockTimeout: 30000,
                atomicWrites: true
            },
            github: {
                autoCreatePR: true,
                prTemplate: 'default',
                enableWebhooks: false,
                maxCommitsPerPR: 10
            },
            performance: {
                enableMetrics: true,
                metricsFile: path.join(__dirname, '..', 'logs', 'performance.json'),
                cacheSize: 1000,
                enableProfiling: false
            }
        };
    }

    /**
     * Load configuration from file or environment
     * @param {string} configName - Configuration section name
     * @returns {Object} Configuration object
     */
    loadConfig(configName) {
        const cacheKey = `config_${configName}`;
        
        if (this.cache.has(cacheKey)) {
            this.logger.debug(`Configuration loaded from cache: ${configName}`);
            return this.cache.get(cacheKey);
        }

        try {
            // Try to load from file first
            const configFile = path.join(this.configPath, `${configName}.json`);
            let config = {};

            if (fs.existsSync(configFile)) {
                const fileContent = fs.readFileSync(configFile, 'utf8');
                config = JSON.parse(fileContent);
                this.logger.debug(`Configuration loaded from file: ${configFile}`);
            } else {
                this.logger.debug(`Configuration file not found: ${configFile}, using defaults`);
            }

            // Merge with defaults
            const defaultConfig = this.defaults[configName] || {};
            const mergedConfig = { ...defaultConfig, ...config };

            // Override with environment variables
            const envConfig = this.loadFromEnvironment(configName);
            const finalConfig = { ...mergedConfig, ...envConfig };

            // Validate configuration
            this.validateConfig(configName, finalConfig);

            // Cache the result
            this.cache.set(cacheKey, finalConfig);

            this.logger.info(`Configuration loaded successfully: ${configName}`, {
                source: fs.existsSync(configFile) ? 'file' : 'defaults',
                envOverrides: Object.keys(envConfig).length,
                configKeys: Object.keys(finalConfig)
            });

            return finalConfig;
        } catch (error) {
            this.logger.error(`Failed to load configuration: ${configName}`, {
                error: error.message,
                configPath: this.configPath
            });
            
            // Return defaults if loading fails
            return this.defaults[configName] || {};
        }
    }

    /**
     * Load configuration overrides from environment variables
     * @param {string} configName - Configuration section name
     * @returns {Object} Environment configuration overrides
     */
    loadFromEnvironment(configName) {
        const envPrefix = `PS_${configName.toUpperCase()}_`;
        const envConfig = {};

        Object.keys(process.env).forEach(key => {
            if (key.startsWith(envPrefix)) {
                const configKey = key
                    .substring(envPrefix.length)
                    .toLowerCase()
                    .replace(/_/g, '');
                
                let value = process.env[key];
                
                // Try to parse as JSON for complex values
                try {
                    if (value.startsWith('{') || value.startsWith('[') || 
                        value === 'true' || value === 'false' || 
                        !isNaN(value)) {
                        value = JSON.parse(value);
                    }
                } catch (e) {
                    // Keep as string if not valid JSON
                }

                envConfig[configKey] = value;
            }
        });

        if (Object.keys(envConfig).length > 0) {
            this.logger.debug(`Environment overrides loaded for ${configName}`, { 
                keys: Object.keys(envConfig) 
            });
        }

        return envConfig;
    }

    /**
     * Validate configuration values
     * @param {string} configName - Configuration section name  
     * @param {Object} config - Configuration to validate
     */
    validateConfig(configName, config) {
        const validators = {
            automation: (cfg) => {
                if (cfg.maxRetries < 0 || cfg.maxRetries > 10) {
                    throw new Error('maxRetries must be between 0 and 10');
                }
                if (cfg.retryDelay < 100 || cfg.retryDelay > 10000) {
                    throw new Error('retryDelay must be between 100ms and 10s');
                }
                if (!['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(cfg.logLevel)) {
                    throw new Error('Invalid logLevel');
                }
            },
            qa: (cfg) => {
                if (cfg.passThreshold < 0 || cfg.passThreshold > 5) {
                    throw new Error('passThreshold must be between 0 and 5');
                }
                if (cfg.autoApproveThreshold < cfg.passThreshold) {
                    throw new Error('autoApproveThreshold must be >= passThreshold');
                }
            },
            state: (cfg) => {
                if (!cfg.stateFile || typeof cfg.stateFile !== 'string') {
                    throw new Error('stateFile must be a valid file path');
                }
                if (cfg.backupCount < 1 || cfg.backupCount > 50) {
                    throw new Error('backupCount must be between 1 and 50');
                }
            },
            performance: (cfg) => {
                if (cfg.cacheSize < 10 || cfg.cacheSize > 10000) {
                    throw new Error('cacheSize must be between 10 and 10000');
                }
            }
        };

        if (validators[configName]) {
            try {
                validators[configName](config);
                this.logger.debug(`Configuration validation passed: ${configName}`);
            } catch (error) {
                this.logger.error(`Configuration validation failed: ${configName}`, { 
                    error: error.message 
                });
                throw error;
            }
        }
    }

    /**
     * Save configuration to file
     * @param {string} configName - Configuration section name
     * @param {Object} config - Configuration to save
     */
    saveConfig(configName, config) {
        try {
            // Validate before saving
            this.validateConfig(configName, config);

            // Ensure config directory exists
            if (!fs.existsSync(this.configPath)) {
                fs.mkdirSync(this.configPath, { recursive: true });
            }

            const configFile = path.join(this.configPath, `${configName}.json`);
            
            // Atomic write using temporary file
            const tempFile = configFile + '.tmp';
            fs.writeFileSync(tempFile, JSON.stringify(config, null, 2));
            fs.renameSync(tempFile, configFile);

            // Clear cache
            this.cache.delete(`config_${configName}`);

            this.logger.info(`Configuration saved: ${configName}`, {
                file: configFile,
                keys: Object.keys(config)
            });
        } catch (error) {
            this.logger.error(`Failed to save configuration: ${configName}`, {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get all available configuration sections
     * @returns {Array} List of available configuration names
     */
    getAvailableConfigs() {
        const configs = Object.keys(this.defaults);
        
        try {
            if (fs.existsSync(this.configPath)) {
                const files = fs.readdirSync(this.configPath)
                    .filter(file => file.endsWith('.json'))
                    .map(file => file.replace('.json', ''));
                
                // Merge with defaults, removing duplicates
                configs.push(...files.filter(f => !configs.includes(f)));
            }
        } catch (error) {
            this.logger.warn('Failed to read config directory', { error: error.message });
        }

        return configs.sort();
    }

    /**
     * Clear configuration cache
     * @param {string} configName - Optional specific config to clear
     */
    clearCache(configName = null) {
        if (configName) {
            this.cache.delete(`config_${configName}`);
            this.logger.debug(`Configuration cache cleared: ${configName}`);
        } else {
            this.cache.clear();
            this.logger.debug('All configuration cache cleared');
        }
    }

    /**
     * Get configuration with automatic type conversion
     * @param {string} configName - Configuration section name
     * @param {string} key - Configuration key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Configuration value
     */
    get(configName, key, defaultValue = null) {
        const config = this.loadConfig(configName);
        return config[key] !== undefined ? config[key] : defaultValue;
    }

    /**
     * Set configuration value
     * @param {string} configName - Configuration section name
     * @param {string} key - Configuration key
     * @param {*} value - Configuration value
     */
    set(configName, key, value) {
        const config = this.loadConfig(configName);
        config[key] = value;
        this.saveConfig(configName, config);
    }

    /**
     * Get configuration status for debugging
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            configPath: this.configPath,
            cacheSize: this.cache.size,
            availableConfigs: this.getAvailableConfigs(),
            loadedConfigs: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance for convenience
let defaultConfigManager = null;

function getConfigManager(configPath = null) {
    if (!defaultConfigManager || configPath) {
        defaultConfigManager = new ConfigManager(configPath);
    }
    return defaultConfigManager;
}

module.exports = {
    ConfigManager,
    getConfigManager,
    // Convenience exports
    config: getConfigManager()
};