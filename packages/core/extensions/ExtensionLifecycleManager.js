"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionLifecycleManager = exports.ExtensionLifecycleManager = void 0;
const ExtensionInterfaces_1 = require("./interfaces/ExtensionInterfaces");
class ExtensionLifecycleManager {
    constructor() {
        this.extensions = new Map();
        this.contexts = new Map();
        this.eventEmitter = new EventTarget();
        this.initialized = false;
    }
    static getInstance() {
        if (!ExtensionLifecycleManager.instance) {
            ExtensionLifecycleManager.instance = new ExtensionLifecycleManager();
        }
        return ExtensionLifecycleManager.instance;
    }
    static getActiveExtensions() {
        return ExtensionLifecycleManager.getInstance().getExtensionsByState(ExtensionInterfaces_1.ExtensionLifecycleState.ACTIVE);
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.emit('manager:initialized');
    }
    async registerExtension(extension) {
        if (this.extensions.has(extension.id)) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.INITIALIZATION_ERROR, extension.id, `Extension ${extension.id} is already registered`);
        }
        const validationResult = await this.validateExtension(extension);
        if (!validationResult.valid) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.VALIDATION_ERROR, extension.id, `Extension validation failed: ${validationResult.errors.join(', ')}`);
        }
        const entry = {
            extension,
            state: ExtensionInterfaces_1.ExtensionLifecycleState.UNINITIALIZED,
            context: this.createExtensionContext(extension),
            registeredAt: new Date(),
            lastStateChange: new Date(),
            errors: [],
            healthStatus: {
                status: 'healthy',
                lastChecked: new Date()
            }
        };
        this.extensions.set(extension.id, entry);
        this.contexts.set(extension.id, entry.context);
        this.emit('extension:registered', { extension, entry });
    }
    async unregisterExtension(extensionId) {
        const entry = this.extensions.get(extensionId);
        if (!entry) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.INITIALIZATION_ERROR, extensionId, `Extension ${extensionId} is not registered`);
        }
        if (entry.state === ExtensionInterfaces_1.ExtensionLifecycleState.ACTIVE) {
            await this.deactivateExtension(extensionId);
        }
        if (entry.state === ExtensionInterfaces_1.ExtensionLifecycleState.INITIALIZED) {
            await this.disposeExtension(extensionId);
        }
        this.extensions.delete(extensionId);
        this.contexts.delete(extensionId);
        this.emit('extension:unregistered', { extensionId, entry });
    }
    async initializeExtension(extensionId) {
        const entry = this.getExtensionEntry(extensionId);
        if (entry.state !== ExtensionInterfaces_1.ExtensionLifecycleState.UNINITIALIZED) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.INITIALIZATION_ERROR, extensionId, `Extension ${extensionId} is not in uninitialized state`);
        }
        try {
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.INITIALIZING);
            await this.validateDependencies(entry.extension);
            await entry.extension.initialize();
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.INITIALIZED);
            this.emit('extension:initialized', { extensionId, entry });
        }
        catch (error) {
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.ERROR);
            this.addError(entry, error);
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.INITIALIZATION_ERROR, extensionId, `Failed to initialize extension: ${error.message}`, error);
        }
    }
    async activateExtension(extensionId) {
        const entry = this.getExtensionEntry(extensionId);
        if (entry.state !== ExtensionInterfaces_1.ExtensionLifecycleState.INITIALIZED) {
            if (entry.state === ExtensionInterfaces_1.ExtensionLifecycleState.UNINITIALIZED) {
                await this.initializeExtension(extensionId);
            }
            else {
                throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.ACTIVATION_ERROR, extensionId, `Extension ${extensionId} is not in initialized state`);
            }
        }
        try {
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.ACTIVATING);
            await this.validatePermissions(entry.extension);
            await entry.extension.activate();
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.ACTIVE);
            entry.activatedAt = new Date();
            this.emit('extension:activated', { extensionId, entry });
        }
        catch (error) {
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.ERROR);
            this.addError(entry, error);
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.ACTIVATION_ERROR, extensionId, `Failed to activate extension: ${error.message}`, error);
        }
    }
    async deactivateExtension(extensionId) {
        const entry = this.getExtensionEntry(extensionId);
        if (entry.state !== ExtensionInterfaces_1.ExtensionLifecycleState.ACTIVE) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.RUNTIME_ERROR, extensionId, `Extension ${extensionId} is not in active state`);
        }
        try {
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.DEACTIVATING);
            await entry.extension.deactivate();
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.DEACTIVATED);
            entry.deactivatedAt = new Date();
            this.emit('extension:deactivated', { extensionId, entry });
        }
        catch (error) {
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.ERROR);
            this.addError(entry, error);
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.RUNTIME_ERROR, extensionId, `Failed to deactivate extension: ${error.message}`, error);
        }
    }
    async disposeExtension(extensionId) {
        const entry = this.getExtensionEntry(extensionId);
        if (entry.state === ExtensionInterfaces_1.ExtensionLifecycleState.ACTIVE) {
            await this.deactivateExtension(extensionId);
        }
        if (entry.state !== ExtensionInterfaces_1.ExtensionLifecycleState.DEACTIVATED &&
            entry.state !== ExtensionInterfaces_1.ExtensionLifecycleState.INITIALIZED) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.RUNTIME_ERROR, extensionId, `Extension ${extensionId} cannot be disposed in current state`);
        }
        try {
            await entry.extension.dispose();
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.DISPOSED);
            entry.disposedAt = new Date();
            this.emit('extension:disposed', { extensionId, entry });
        }
        catch (error) {
            this.setState(entry, ExtensionInterfaces_1.ExtensionLifecycleState.ERROR);
            this.addError(entry, error);
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.RUNTIME_ERROR, extensionId, `Failed to dispose extension: ${error.message}`, error);
        }
    }
    getExtension(extensionId) {
        return this.extensions.get(extensionId)?.extension;
    }
    getAllExtensions() {
        return Array.from(this.extensions.values()).map(entry => entry.extension);
    }
    getExtensionsByState(state) {
        return Array.from(this.extensions.values())
            .filter(entry => entry.state === state)
            .map(entry => entry.extension);
    }
    getExtensionState(extensionId) {
        const entry = this.extensions.get(extensionId);
        return entry ? entry.state : ExtensionInterfaces_1.ExtensionLifecycleState.UNINITIALIZED;
    }
    getExtensionContext(extensionId) {
        return this.contexts.get(extensionId);
    }
    getExtensionHealth(extensionId) {
        const entry = this.extensions.get(extensionId);
        if (!entry) {
            return {
                status: 'error',
                message: 'Extension not found',
                lastChecked: new Date()
            };
        }
        return entry.healthStatus;
    }
    async checkExtensionHealth(extensionId) {
        const entry = this.getExtensionEntry(extensionId);
        try {
            const isHealthy = entry.extension.isHealthy();
            const healthStatus = entry.extension.getHealthStatus();
            entry.healthStatus = {
                ...healthStatus,
                lastChecked: new Date()
            };
            return entry.healthStatus;
        }
        catch (error) {
            entry.healthStatus = {
                status: 'error',
                message: error.message,
                lastChecked: new Date()
            };
            return entry.healthStatus;
        }
    }
    getExtensionStatistics() {
        const stats = {
            total: this.extensions.size,
            byState: {},
            byType: {},
            errors: 0,
            healthy: 0
        };
        Object.values(ExtensionInterfaces_1.ExtensionLifecycleState).forEach(state => {
            stats.byState[state] = 0;
        });
        Array.from(this.extensions.values()).forEach(entry => {
            stats.byState[entry.state]++;
            const type = entry.extension.extensionType || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            if (entry.errors.length > 0) {
                stats.errors++;
            }
            if (entry.healthStatus.status === 'healthy') {
                stats.healthy++;
            }
        });
        return stats;
    }
    on(event, listener) {
        this.eventEmitter.addEventListener(event, listener);
    }
    off(event, listener) {
        this.eventEmitter.removeEventListener(event, listener);
    }
    emit(event, data) {
        this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
    getExtensionEntry(extensionId) {
        const entry = this.extensions.get(extensionId);
        if (!entry) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.INITIALIZATION_ERROR, extensionId, `Extension ${extensionId} is not registered`);
        }
        return entry;
    }
    setState(entry, state) {
        entry.state = state;
        entry.lastStateChange = new Date();
    }
    addError(entry, error) {
        entry.errors.push({
            error,
            timestamp: new Date()
        });
    }
    async validateExtension(extension) {
        const errors = [];
        const warnings = [];
        if (!extension.id)
            errors.push('Extension ID is required');
        if (!extension.name)
            errors.push('Extension name is required');
        if (!extension.version)
            errors.push('Extension version is required');
        if (!extension.description)
            errors.push('Extension description is required');
        if (!extension.author)
            errors.push('Extension author is required');
        if (typeof extension.initialize !== 'function') {
            errors.push('Extension must implement initialize method');
        }
        if (typeof extension.activate !== 'function') {
            errors.push('Extension must implement activate method');
        }
        if (typeof extension.deactivate !== 'function') {
            errors.push('Extension must implement deactivate method');
        }
        if (typeof extension.dispose !== 'function') {
            errors.push('Extension must implement dispose method');
        }
        if (extension.version && !this.isValidVersion(extension.version)) {
            errors.push('Extension version must follow semantic versioning');
        }
        if (this.extensions.has(extension.id)) {
            errors.push(`Extension ID ${extension.id} is already registered`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    async validateDependencies(extension) {
        if (!extension.dependencies || extension.dependencies.length === 0) {
            return;
        }
        const missingDependencies = [];
        for (const dependency of extension.dependencies) {
            const dependencyEntry = this.extensions.get(dependency);
            if (!dependencyEntry) {
                missingDependencies.push(dependency);
            }
            else if (dependencyEntry.state !== ExtensionInterfaces_1.ExtensionLifecycleState.ACTIVE) {
                await this.activateExtension(dependency);
            }
        }
        if (missingDependencies.length > 0) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.DEPENDENCY_ERROR, extension.id, `Missing dependencies: ${missingDependencies.join(', ')}`);
        }
    }
    async validatePermissions(extension) {
        if (!extension.permissions || extension.permissions.length === 0) {
            return;
        }
        const invalidPermissions = [];
        for (const permission of extension.permissions) {
            if (!permission || typeof permission !== 'string') {
                invalidPermissions.push(permission);
            }
        }
        if (invalidPermissions.length > 0) {
            throw new ExtensionInterfaces_1.ExtensionError(ExtensionInterfaces_1.ExtensionErrorType.PERMISSION_ERROR, extension.id, `Invalid permissions: ${invalidPermissions.join(', ')}`);
        }
    }
    createExtensionContext(extension) {
        return {
            extensionId: extension.id,
            systemVersion: '1.0.0',
            logger: this.createLogger(extension.id),
            storage: this.createStorage(extension.id),
            events: this.createEventEmitter(extension.id),
            runtime: this.createRuntime(extension.id),
            ui: this.createUIContext(extension.id),
            api: this.createAPIContext(extension.id)
        };
    }
    createLogger(extensionId) {
        return {
            debug: (message, ...args) => console.debug(`[${extensionId}] ${message}`, ...args),
            info: (message, ...args) => console.info(`[${extensionId}] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[${extensionId}] ${message}`, ...args),
            error: (message, ...args) => console.error(`[${extensionId}] ${message}`, ...args),
            trace: (message, ...args) => console.trace(`[${extensionId}] ${message}`, ...args)
        };
    }
    createStorage(extensionId) {
        const storage = new Map();
        return {
            get: async (key) => storage.get(`${extensionId}:${key}`),
            set: async (key, value) => storage.set(`${extensionId}:${key}`, value),
            delete: async (key) => storage.delete(`${extensionId}:${key}`),
            clear: async () => {
                for (const key of storage.keys()) {
                    if (key.startsWith(`${extensionId}:`)) {
                        storage.delete(key);
                    }
                }
            },
            keys: async () => {
                return Array.from(storage.keys())
                    .filter(key => key.startsWith(`${extensionId}:`))
                    .map(key => key.substring(extensionId.length + 1));
            },
            getScoped: (scope) => this.createStorage(`${extensionId}:${scope}`)
        };
    }
    createEventEmitter(extensionId) {
        return this.eventEmitter;
    }
    createRuntime(extensionId) {
        return {
            version: '1.0.0',
            environment: 'development',
            getSystemInfo: () => ({
                version: '1.0.0',
                platform: process.platform,
                architecture: process.arch,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            }),
            getPerformanceMetrics: () => ({
                executionTime: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                activeNodes: 0,
                totalExecutions: 0
            }),
            registerNode: (nodeDefinition) => {
            },
            unregisterNode: (nodeId) => {
            },
            getRegisteredNodes: () => {
                return [];
            }
        };
    }
    createUIContext(extensionId) {
        return {
            registerComponent: (componentId, component) => {
            },
            unregisterComponent: (componentId) => {
            },
            registerInspectorEditor: (nodeType, editor) => {
            },
            unregisterInspectorEditor: (nodeType) => {
            },
            registerMenuItem: (menuId, item) => {
            },
            unregisterMenuItem: (menuId, itemId) => {
            },
            showNotification: (notification) => {
            },
            showModal: (modal) => {
            }
        };
    }
    createAPIContext(extensionId) {
        return {
            createHttpClient: () => {
                return {};
            },
            registerEndpoint: (path, handler) => {
            },
            unregisterEndpoint: (path) => {
            },
            registerMiddleware: (middleware) => {
            },
            unregisterMiddleware: (middlewareId) => {
            }
        };
    }
    isValidVersion(version) {
        const semverRegex = /^\d+\.\d+\.\d+$/;
        return semverRegex.test(version);
    }
}
exports.ExtensionLifecycleManager = ExtensionLifecycleManager;
exports.extensionLifecycleManager = ExtensionLifecycleManager.getInstance();
//# sourceMappingURL=ExtensionLifecycleManager.js.map