'use strict';
// packages/core/graphSchema.ts
// Shared Zod schema for a graph JSON used by both UI and executor.
// Nodes are stored in an object keyed by node id for O(1) lookup.
Object.defineProperty(exports, '__esModule', { value: true });
exports.GraphSchema =
  exports.AnyNodeSchema =
  exports.PythonTransformNodeSchema =
  exports.MarkovNodeSchema =
  exports.SequentialNodeSchema =
  exports.ConditionalNodeSchema =
  exports.WeightedAdvancedNodeSchema =
  exports.GetVariableNodeSchema =
  exports.SetVariableNodeSchema =
  exports.IncludeNodeSchema =
  exports.OutputNodeSchema =
  exports.ConcatNodeSchema =
  exports.WeightedChoiceNodeSchema =
  exports.BaseNode =
  exports.NodeTypeEnum =
    void 0;
const zod_1 = require('zod');
const security_1 = require('./validation/security');
exports.NodeTypeEnum = zod_1.z.enum([
  'WeightedChoice',
  'Concat',
  'Output',
  'Include',
  'SetVariable',
  'GetVariable',
  // Epic 7 Advanced Node Types
  'WeightedAdvanced',
  'Conditional',
  'Sequential',
  'Markov',
  // Epic 8 Python Integration
  'PythonTransform',
]);
exports.BaseNode = zod_1.z.object({
  id: zod_1.z.string(),
  type: exports.NodeTypeEnum,
  inputs: zod_1.z.array(zod_1.z.string()).optional(), // ids of upstream nodes (ordered)
  // Epic 8.2 Template Support
  template: zod_1.z.string().optional(), // Template with {variable} syntax
  extractedVariables: zod_1.z
    .array(
      zod_1.z.object({
        name: zod_1.z.string(),
        placeholder: zod_1.z.string(),
        startIndex: zod_1.z.number(),
        endIndex: zod_1.z.number(),
        isValid: zod_1.z.boolean(),
        inferredType: zod_1.z.enum(['string', 'number', 'boolean', 'array', 'object', 'auto']).optional(),
        defaultValue: zod_1.z.string().optional(),
      })
    )
    .optional(),
});
exports.WeightedChoiceNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('WeightedChoice'),
  choices: zod_1.z.array(zod_1.z.object({ value: zod_1.z.string(), weight: zod_1.z.number().positive() })),
});
exports.ConcatNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('Concat'),
});
exports.OutputNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('Output'),
});
exports.IncludeNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('Include'),
  name: security_1.SecureValidation.safePropertyKey(),
});
exports.SetVariableNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('SetVariable'),
  key: security_1.SecureValidation.variableName(),
  value: security_1.SecureValidation.safeValue(),
});
exports.GetVariableNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('GetVariable'),
  key: security_1.SecureValidation.variableName(),
});
// Epic 7 Advanced Node Schemas
exports.WeightedAdvancedNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('WeightedAdvanced'),
  choices: zod_1.z.array(zod_1.z.object({ value: zod_1.z.string(), weight: zod_1.z.number().min(0) })).optional(),
  distributionConfig: zod_1.z
    .object({
      type: zod_1.z.enum(['linear', 'exponential', 'gaussian', 'custom']),
      parameters: zod_1.z.record(zod_1.z.number()).optional(),
      normalize: zod_1.z.boolean().optional(),
      minWeight: zod_1.z.number().min(0).optional(),
    })
    .optional(),
});
exports.ConditionalNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('Conditional'),
  branches: zod_1.z
    .array(
      zod_1.z.object({
        condition: security_1.SecureValidation.safeExpression(),
        output: security_1.SecureValidation.safeString(),
        label: security_1.SecureValidation.safeString().optional(),
      })
    )
    .optional(),
  defaultOutput: security_1.SecureValidation.safeString().optional(),
  conditionalConfig: zod_1.z
    .object({
      allowVariableAccess: zod_1.z.boolean().optional(),
      strictMode: zod_1.z.boolean().optional(),
      customFunctions: zod_1.z.record(security_1.SecureValidation.safeValue()).optional(),
    })
    .optional(),
});
exports.SequentialNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('Sequential'),
  sequence: zod_1.z.array(zod_1.z.string()).optional(),
  pattern: zod_1.z
    .object({
      type: zod_1.z.enum(['linear', 'cyclical', 'random', 'weighted']),
      config: zod_1.z
        .object({
          weights: zod_1.z.array(zod_1.z.number()).optional(),
          allowRepeats: zod_1.z.boolean().optional(),
          custom: zod_1.z.record(zod_1.z.unknown()).optional(),
        })
        .optional(),
    })
    .optional(),
});
exports.MarkovNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('Markov'),
  states: zod_1.z.array(zod_1.z.string()).optional(),
  transitions: zod_1.z.record(zod_1.z.record(zod_1.z.number())).optional(),
  initialState: zod_1.z.string().optional(),
  markovConfig: zod_1.z
    .object({
      maxTransitions: zod_1.z.number().positive().optional(),
      normalizeProbabilities: zod_1.z.boolean().optional(),
      terminationStates: zod_1.z.array(zod_1.z.string()).optional(),
      detectLoops: zod_1.z.boolean().optional(),
      custom: zod_1.z.record(zod_1.z.unknown()).optional(),
    })
    .optional(),
});
// Epic 8 Python Integration
exports.PythonTransformNodeSchema = exports.BaseNode.extend({
  type: zod_1.z.literal('PythonTransform'),
  code: zod_1.z.string(),
  timeout: zod_1.z.number().positive().optional(),
  memoryLimit: zod_1.z.string().optional(),
  allowedModules: zod_1.z.array(zod_1.z.string()).optional(),
  pythonConfig: zod_1.z
    .object({
      strictMode: zod_1.z.boolean().optional(),
      enableCaching: zod_1.z.boolean().optional(),
      executorUrl: zod_1.z.string().optional(),
      retryAttempts: zod_1.z.number().min(0).optional(),
      fallbackBehavior: zod_1.z.enum(['error', 'skip', 'default']).optional(),
      defaultOutput: zod_1.z.string().optional(),
    })
    .optional(),
});
exports.AnyNodeSchema = zod_1.z.discriminatedUnion('type', [
  exports.WeightedChoiceNodeSchema,
  exports.ConcatNodeSchema,
  exports.OutputNodeSchema,
  exports.IncludeNodeSchema,
  exports.SetVariableNodeSchema,
  exports.GetVariableNodeSchema,
  // Epic 7 Advanced Nodes
  exports.WeightedAdvancedNodeSchema,
  exports.ConditionalNodeSchema,
  exports.SequentialNodeSchema,
  exports.MarkovNodeSchema,
  // Epic 8 Python Integration
  exports.PythonTransformNodeSchema,
]);
exports.GraphSchema = zod_1.z.object({
  nodes: zod_1.z.array(exports.AnyNodeSchema),
  seed: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
});
