"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphSchema = exports.AnyNodeSchema = exports.PythonTransformNodeSchema = exports.MarkovNodeSchema = exports.SequentialNodeSchema = exports.ConditionalNodeSchema = exports.WeightedAdvancedNodeSchema = exports.GetVariableNodeSchema = exports.SetVariableNodeSchema = exports.IncludeNodeSchema = exports.OutputNodeSchema = exports.ConcatNodeSchema = exports.WeightedChoiceNodeSchema = exports.BaseNode = exports.NodeTypeEnum = void 0;
const zod_1 = require("zod");
exports.NodeTypeEnum = zod_1.z.enum([
    'WeightedChoice',
    'Concat',
    'Output',
    'Include',
    'SetVariable',
    'GetVariable',
    'WeightedAdvanced',
    'Conditional',
    'Sequential',
    'Markov',
    'PythonTransform',
]);
exports.BaseNode = zod_1.z.object({
    id: zod_1.z.string(),
    type: exports.NodeTypeEnum,
    inputs: zod_1.z.array(zod_1.z.string()).optional(),
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
    name: zod_1.z.string(),
});
exports.SetVariableNodeSchema = exports.BaseNode.extend({
    type: zod_1.z.literal('SetVariable'),
    key: zod_1.z.string(),
    value: zod_1.z.any(),
});
exports.GetVariableNodeSchema = exports.BaseNode.extend({
    type: zod_1.z.literal('GetVariable'),
    key: zod_1.z.string(),
});
exports.WeightedAdvancedNodeSchema = exports.BaseNode.extend({
    type: zod_1.z.literal('WeightedAdvanced'),
    choices: zod_1.z.array(zod_1.z.object({ value: zod_1.z.string(), weight: zod_1.z.number().min(0) })).optional(),
    distributionConfig: zod_1.z.object({
        type: zod_1.z.enum(['linear', 'exponential', 'gaussian', 'custom']),
        parameters: zod_1.z.record(zod_1.z.number()).optional(),
        normalize: zod_1.z.boolean().optional(),
        minWeight: zod_1.z.number().min(0).optional(),
    }).optional(),
});
exports.ConditionalNodeSchema = exports.BaseNode.extend({
    type: zod_1.z.literal('Conditional'),
    branches: zod_1.z.array(zod_1.z.object({
        condition: zod_1.z.string(),
        output: zod_1.z.string(),
        label: zod_1.z.string().optional()
    })).optional(),
    defaultOutput: zod_1.z.string().optional(),
    conditionalConfig: zod_1.z.object({
        allowVariableAccess: zod_1.z.boolean().optional(),
        strictMode: zod_1.z.boolean().optional(),
        customFunctions: zod_1.z.record(zod_1.z.any()).optional()
    }).optional(),
});
exports.SequentialNodeSchema = exports.BaseNode.extend({
    type: zod_1.z.literal('Sequential'),
    sequence: zod_1.z.array(zod_1.z.string()).optional(),
    pattern: zod_1.z.object({
        type: zod_1.z.enum(['linear', 'cyclical', 'random', 'weighted']),
        config: zod_1.z.object({
            weights: zod_1.z.array(zod_1.z.number()).optional(),
            allowRepeats: zod_1.z.boolean().optional(),
            custom: zod_1.z.record(zod_1.z.any()).optional()
        }).optional()
    }).optional(),
});
exports.MarkovNodeSchema = exports.BaseNode.extend({
    type: zod_1.z.literal('Markov'),
    states: zod_1.z.array(zod_1.z.string()).optional(),
    transitions: zod_1.z.record(zod_1.z.record(zod_1.z.number())).optional(),
    initialState: zod_1.z.string().optional(),
    markovConfig: zod_1.z.object({
        maxTransitions: zod_1.z.number().positive().optional(),
        normalizeProbabilities: zod_1.z.boolean().optional(),
        terminationStates: zod_1.z.array(zod_1.z.string()).optional(),
        detectLoops: zod_1.z.boolean().optional(),
        custom: zod_1.z.record(zod_1.z.any()).optional()
    }).optional(),
});
exports.PythonTransformNodeSchema = exports.BaseNode.extend({
    type: zod_1.z.literal('PythonTransform'),
    code: zod_1.z.string(),
    timeout: zod_1.z.number().positive().optional(),
    memoryLimit: zod_1.z.string().optional(),
    allowedModules: zod_1.z.array(zod_1.z.string()).optional(),
    pythonConfig: zod_1.z.object({
        strictMode: zod_1.z.boolean().optional(),
        enableCaching: zod_1.z.boolean().optional(),
        executorUrl: zod_1.z.string().optional(),
        retryAttempts: zod_1.z.number().min(0).optional(),
        fallbackBehavior: zod_1.z.enum(['error', 'skip', 'default']).optional(),
        defaultOutput: zod_1.z.string().optional(),
    }).optional(),
});
exports.AnyNodeSchema = zod_1.z.discriminatedUnion('type', [
    exports.WeightedChoiceNodeSchema,
    exports.ConcatNodeSchema,
    exports.OutputNodeSchema,
    exports.IncludeNodeSchema,
    exports.SetVariableNodeSchema,
    exports.GetVariableNodeSchema,
    exports.WeightedAdvancedNodeSchema,
    exports.ConditionalNodeSchema,
    exports.SequentialNodeSchema,
    exports.MarkovNodeSchema,
    exports.PythonTransformNodeSchema,
]);
exports.GraphSchema = zod_1.z.object({
    nodes: zod_1.z.array(exports.AnyNodeSchema),
    seed: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
});
//# sourceMappingURL=graphSchema.js.map