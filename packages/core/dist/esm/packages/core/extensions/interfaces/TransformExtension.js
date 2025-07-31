/**
 * Transform Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the data transformation system
 */
import { z } from 'zod';
export var TransformType;
(function (TransformType) {
  TransformType['TEXT'] = 'text';
  TransformType['JSON'] = 'json';
  TransformType['ARRAY'] = 'array';
  TransformType['OBJECT'] = 'object';
  TransformType['STRING'] = 'string';
  TransformType['NUMBER'] = 'number';
  TransformType['BOOLEAN'] = 'boolean';
  TransformType['DATE'] = 'date';
  TransformType['CUSTOM'] = 'custom';
})(TransformType || (TransformType = {}));
export var TransformExtensionHelpers;
(function (TransformExtensionHelpers) {
  function createTransformDefinition(config) {
    return {
      id: config.id || 'custom-transform',
      name: config.name || 'Custom Transform',
      description: config.description || 'A custom data transform',
      version: config.version || '1.0.0',
      type: config.type || TransformType.CUSTOM,
      transformClass:
        config.transformClass ||
        class {
          id = config.id || 'custom-transform';
          name = config.name || 'Custom Transform';
          type = config.type || TransformType.CUSTOM;
          version = config.version || '1.0.0';
          transform(input) {
            return input;
          }
          validateInput() {
            return { valid: true, errors: [], warnings: [] };
          }
          validateOutput() {
            return { valid: true, errors: [], warnings: [] };
          }
          getInputSchema() {
            return z.any();
          }
          getOutputSchema() {
            return z.any();
          }
          getConfiguration() {
            return {};
          }
          setConfiguration() {}
          getMetadata() {
            return { author: 'Unknown', license: 'MIT' };
          }
          async initialize() {}
          async dispose() {}
        },
      inputSchema: config.inputSchema || z.any(),
      outputSchema: config.outputSchema || z.any(),
      configSchema: config.configSchema || z.object({}),
      ui: config.ui || {},
      runtime: config.runtime || {},
      pipeline: config.pipeline || {},
      metadata: config.metadata || {
        author: 'Unknown',
        license: 'MIT',
      },
    };
  }
  TransformExtensionHelpers.createTransformDefinition = createTransformDefinition;
  function validateTransformDefinition(definition) {
    const errors = [];
    const warnings = [];
    // Basic validation
    if (!definition.id) errors.push('Transform ID is required');
    if (!definition.name) errors.push('Transform name is required');
    if (!definition.transformClass) errors.push('Transform class is required');
    // Schema validation
    if (!definition.inputSchema) errors.push('Input schema is required');
    if (!definition.outputSchema) errors.push('Output schema is required');
    return {
      valid: errors.length === 0,
      errors,
      warnings,
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
        return Array.from(registry.values()).filter(
          def =>
            def.name.toLowerCase().includes(lowercaseQuery) || def.description.toLowerCase().includes(lowercaseQuery)
        );
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
      },
    };
  }
  TransformExtensionHelpers.createTransformRegistry = createTransformRegistry;
})(TransformExtensionHelpers || (TransformExtensionHelpers = {}));
