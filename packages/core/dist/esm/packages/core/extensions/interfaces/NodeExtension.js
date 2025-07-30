/**
 * Node Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the runtime node system
 */
import { z } from 'zod';
import { RuntimeNode } from '../../runtime';
export var NodeCategory;
(function (NodeCategory) {
    NodeCategory["INPUT"] = "input";
    NodeCategory["OUTPUT"] = "output";
    NodeCategory["TRANSFORM"] = "transform";
    NodeCategory["CONTROL"] = "control";
    NodeCategory["UTILITY"] = "utility";
    NodeCategory["CUSTOM"] = "custom";
})(NodeCategory || (NodeCategory = {}));
export var NodeExtensionHelpers;
(function (NodeExtensionHelpers) {
    function createNodeDefinition(config) {
        return {
            id: config.id || 'custom-node',
            name: config.name || 'Custom Node',
            category: config.category || NodeCategory.CUSTOM,
            description: config.description || 'A custom node',
            version: config.version || '1.0.0',
            nodeClass: config.nodeClass || class extends RuntimeNode {
                run() { return null; }
            },
            configSchema: config.configSchema || z.object({}),
            ui: config.ui || {},
            runtime: config.runtime || {},
            metadata: config.metadata || {
                author: 'Unknown',
                license: 'MIT',
            },
            ...config
        };
    }
    NodeExtensionHelpers.createNodeDefinition = createNodeDefinition;
    function validateNodeDefinition(definition) {
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!definition.id)
            errors.push('Node ID is required');
        if (!definition.name)
            errors.push('Node name is required');
        if (!definition.nodeClass)
            errors.push('Node class is required');
        // Schema validation
        try {
            definition.configSchema.parse({});
        }
        catch (e) {
            warnings.push('Configuration schema validation failed');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    NodeExtensionHelpers.validateNodeDefinition = validateNodeDefinition;
    function createNodeRegistry() {
        const registry = new Map();
        const eventEmitter = new EventTarget();
        return {
            register(definition) {
                registry.set(definition.id, definition);
                eventEmitter.dispatchEvent(new CustomEvent('registered', { detail: definition }));
            },
            unregister(nodeId) {
                const definition = registry.get(nodeId);
                if (definition) {
                    registry.delete(nodeId);
                    eventEmitter.dispatchEvent(new CustomEvent('unregistered', { detail: definition }));
                }
            },
            get(nodeId) {
                return registry.get(nodeId);
            },
            getAll() {
                return Array.from(registry.values());
            },
            getByCategory(category) {
                return Array.from(registry.values()).filter(def => def.category === category);
            },
            search(query) {
                const lowercaseQuery = query.toLowerCase();
                return Array.from(registry.values()).filter(def => def.name.toLowerCase().includes(lowercaseQuery) ||
                    def.description.toLowerCase().includes(lowercaseQuery));
            },
            filter(predicate) {
                return Array.from(registry.values()).filter(predicate);
            },
            validate(definition) {
                return validateNodeDefinition(definition);
            },
            on(event, listener) {
                eventEmitter.addEventListener(event, listener);
            },
            off(event, listener) {
                eventEmitter.removeEventListener(event, listener);
            }
        };
    }
    NodeExtensionHelpers.createNodeRegistry = createNodeRegistry;
})(NodeExtensionHelpers || (NodeExtensionHelpers = {}));
