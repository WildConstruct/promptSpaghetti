"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformExtensionHelpers = exports.TransformType = void 0;
const zod_1 = require("zod");
var TransformType;
(function (TransformType) {
    TransformType["TEXT"] = "text";
    TransformType["JSON"] = "json";
    TransformType["ARRAY"] = "array";
    TransformType["OBJECT"] = "object";
    TransformType["STRING"] = "string";
    TransformType["NUMBER"] = "number";
    TransformType["BOOLEAN"] = "boolean";
    TransformType["DATE"] = "date";
    TransformType["CUSTOM"] = "custom";
})(TransformType || (exports.TransformType = TransformType = {}));
var TransformExtensionHelpers;
(function (TransformExtensionHelpers) {
    function createTransformDefinition(config) {
        return {
            id: config.id || 'custom-transform',
            name: config.name || 'Custom Transform',
            description: config.description || 'A custom data transform',
            version: config.version || '1.0.0',
            type: config.type || TransformType.CUSTOM,
            transformClass: config.transformClass || class {
                constructor() {
                    this.id = config.id || 'custom-transform';
                    this.name = config.name || 'Custom Transform';
                    this.type = config.type || TransformType.CUSTOM;
                    this.version = config.version || '1.0.0';
                }
                transform(input) { return input; }
                validateInput() { return { valid: true, errors: [], warnings: [] }; }
                validateOutput() { return { valid: true, errors: [], warnings: [] }; }
                getInputSchema() { return zod_1.z.any(); }
                getOutputSchema() { return zod_1.z.any(); }
                getConfiguration() { return {}; }
                setConfiguration() { }
                getMetadata() { return { author: 'Unknown', license: 'MIT' }; }
                async initialize() { }
                async dispose() { }
            },
            inputSchema: config.inputSchema || zod_1.z.any(),
            outputSchema: config.outputSchema || zod_1.z.any(),
            configSchema: config.configSchema || zod_1.z.object({}),
            ui: config.ui || {},
            runtime: config.runtime || {},
            pipeline: config.pipeline || {},
            metadata: config.metadata || {
                author: 'Unknown',
                license: 'MIT'
            }
        };
    }
    TransformExtensionHelpers.createTransformDefinition = createTransformDefinition;
    function validateTransformDefinition(definition) {
        const errors = [];
        const warnings = [];
        if (!definition.id)
            errors.push('Transform ID is required');
        if (!definition.name)
            errors.push('Transform name is required');
        if (!definition.transformClass)
            errors.push('Transform class is required');
        if (!definition.inputSchema)
            errors.push('Input schema is required');
        if (!definition.outputSchema)
            errors.push('Output schema is required');
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    TransformExtensionHelpers.validateTransformDefinition = validateTransformDefinition;
    function createTransformRegistry() {
        const registry = new Map();
        const eventEmitter = new EventTarget();
        return {
            register(definition) {
                registry.set(definition.id, definition);
                eventEmitter.dispatchEvent(new CustomEvent('registered', { detail: definition }));
            },
            unregister(transformId) {
                const definition = registry.get(transformId);
                if (definition) {
                    registry.delete(transformId);
                    eventEmitter.dispatchEvent(new CustomEvent('unregistered', { detail: definition }));
                }
            },
            get(transformId) {
                return registry.get(transformId);
            },
            getAll() {
                return Array.from(registry.values());
            },
            getByType(type) {
                return Array.from(registry.values()).filter(def => def.type === type);
            },
            getByCategory(category) {
                return Array.from(registry.values()).filter(def => def.ui.category === category);
            },
            search(query) {
                const lowercaseQuery = query.toLowerCase();
                return Array.from(registry.values()).filter(def => def.name.toLowerCase().includes(lowercaseQuery) ||
                    def.description.toLowerCase().includes(lowercaseQuery));
            },
            filter(predicate) {
                return Array.from(registry.values()).filter(predicate);
            },
            getCompatible(inputType, outputType) {
                return Array.from(registry.values()).filter(def => {
                    const inputCompatible = def.pipeline.inputCompatibility?.includes(inputType) ?? true;
                    const outputCompatible = def.pipeline.outputCompatibility?.includes(outputType) ?? true;
                    return inputCompatible && outputCompatible;
                });
            },
            validate(definition) {
                return validateTransformDefinition(definition);
            },
            on(event, listener) {
                eventEmitter.addEventListener(event, listener);
            },
            off(event, listener) {
                eventEmitter.removeEventListener(event, listener);
            }
        };
    }
    TransformExtensionHelpers.createTransformRegistry = createTransformRegistry;
})(TransformExtensionHelpers || (exports.TransformExtensionHelpers = TransformExtensionHelpers = {}));
//# sourceMappingURL=TransformExtension.js.map