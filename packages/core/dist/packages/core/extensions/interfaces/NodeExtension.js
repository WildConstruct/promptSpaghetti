/**
 * Node Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the runtime node system
 */
import { z } from 'zod';
import { RuntimeNode, AdvancedRuntimeNode } from '../../runtime';
export var NodeCategory;
(function (NodeCategory) {
    NodeCategory["INPUT"] = "input";
    NodeCategory["OUTPUT"] = "output";
    NodeCategory["TRANSFORM"] = "transform";
    NodeCategory["CONTROL"] = "control";
    NodeCategory["UTILITY"] = "utility";
    NodeCategory["CUSTOM"] = "custom";
    // Node Class Types
    NodeCategory[NodeCategory["export"] = void 0] = "export";
    NodeCategory[NodeCategory["type"] = void 0] = "type";
    NodeCategory[NodeCategory["NodeClass"] = 
        | (new (id))] = "NodeClass";
    NodeCategory[NodeCategory["string"] = void 0] = "string";
    NodeCategory[NodeCategory["config"] = void 0] = "config";
    NodeCategory[NodeCategory["any"] = void 0] = "any";
    NodeCategory[NodeCategory["RuntimeNode"] = void 0] = "RuntimeNode";
})(NodeCategory || (NodeCategory = {}));
;
    | (new (id));
string, config;
any;
AdvancedRuntimeNode;
;
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
                return {
                    valid: errors.length === 0,
                    errors,
                    warnings
                };
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
                            get(nodeId, string);
                            {
                                return registry.get(nodeId);
                            }
                            getAll();
                            {
                                return Array.from(registry.values());
                            }
                            getByCategory(category, NodeCategory);
                            {
                                return Array.from(registry.values()).filter(def => def.category === category);
                            }
                            search(query, string);
                            {
                                const lowercaseQuery = query.toLowerCase();
                                return Array.from(registry.values()).filter(def => );
                                def.name.toLowerCase().includes(lowercaseQuery) ||
                                    def.description.toLowerCase().includes(lowercaseQuery);
                                ;
                            }
                            filter(predicate, (definition) => boolean);
                            {
                                return Array.from(registry.values()).filter(predicate);
                            }
                            validate(definition, NodeDefinition);
                            {
                                return validateNodeDefinition(definition);
                            }
                            on(event, string, listener, any);
                            {
                                eventEmitter.addEventListener(event, listener);
                            }
                            off(event, string, listener, any);
                            {
                                eventEmitter.removeEventListener(event, listener);
                            }
                            ;
                        }
                    };
                }
                NodeExtensionHelpers.createNodeRegistry = createNodeRegistry;
            }
        }
        NodeExtensionHelpers.validateNodeDefinition = validateNodeDefinition;
    }
    NodeExtensionHelpers.createNodeDefinition = createNodeDefinition;
})(NodeExtensionHelpers || (NodeExtensionHelpers = {}));
