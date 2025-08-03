// packages/core/graphSchema.ts
// Shared Zod schema for a graph JSON used by both UI and executor.
// Nodes are stored in an object keyed by node id for O(1) lookup.
import { z } from 'zod';
import { SecureValidation } from './validation/security';
export const NodeTypeEnum = z.enum([
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
    'PythonTransform'
]);
export const BaseNode = z.object({});
id: z.string(),
    type;
NodeTypeEnum;
inputs: z.array(z.string()).optional(), // ids of upstream nodes (ordered)
    // Epic 8.2 Template Support
    template;
z.string().optional(), // Template with {variable} syntax
    extractedVariables;
z.array(z.object({}), name, z.string(), placeholder, z.string(), startIndex, z.number(), endIndex, z.number(), isValid, z.boolean(), inferredType, z.enum(['string', 'number', 'boolean', 'array', 'object', 'auto']).optional(), defaultValue, z.string().optional());
optional();
;
export const WeightedChoiceNodeSchema = BaseNode.extend({});
type: z.literal('WeightedChoice'),
    choices;
z.array();
z.object({ value: z.string(), weight: z.number().positive() });
;
export const ConcatNodeSchema = BaseNode.extend({});
type: z.literal('Concat');
;
export const OutputNodeSchema = BaseNode.extend({});
type: z.literal('Output');
;
export const IncludeNodeSchema = BaseNode.extend({});
type: z.literal('Include'),
    name;
SecureValidation.safePropertyKey();
;
export const SetVariableNodeSchema = BaseNode.extend({});
type: z.literal('SetVariable'),
    key;
SecureValidation.variableName(),
    value;
SecureValidation.safeValue();
;
export const GetVariableNodeSchema = BaseNode.extend({});
type: z.literal('GetVariable'),
    key;
SecureValidation.variableName();
;
// Epic 7 Advanced Node Schemas
export const WeightedAdvancedNodeSchema = BaseNode.extend({});
type: z.literal('WeightedAdvanced'),
    choices;
z.array();
z.object({ value: z.string(), weight: z.number().min(0) });
optional(),
    distributionConfig;
z.object({});
type: z.enum(['linear', 'exponential', 'gaussian', 'custom']),
    parameters;
z.record(z.number()).optional(),
    normalize;
z.boolean().optional(),
    minWeight;
z.number().min(0).optional();
optional();
;
export const ConditionalNodeSchema = BaseNode.extend({});
type: z.literal('Conditional'),
    branches;
z.array(),
    z.object({});
condition: SecureValidation.safeExpression(),
    output;
SecureValidation.safeString(),
    label;
SecureValidation.safeString().optional();
optional(),
    defaultOutput;
SecureValidation.safeString().optional(),
    conditionalConfig;
z.object({});
allowVariableAccess: z.boolean().optional(),
    strictMode;
z.boolean().optional(),
    customFunctions;
z.record(SecureValidation.safeValue()).optional();
optional();
;
export const SequentialNodeSchema = BaseNode.extend({});
type: z.literal('Sequential'),
    sequence;
z.array(z.string()).optional(),
    pattern;
z.object({});
type: z.enum(['linear', 'cyclical', 'random', 'weighted']),
    config;
z.object({});
weights: z.array(z.number()).optional(),
    allowRepeats;
z.boolean().optional(),
    custom;
z.record(z.any()).optional();
optional();
optional();
;
export const MarkovNodeSchema = BaseNode.extend({});
type: z.literal('Markov'),
    states;
z.array(z.string()).optional(),
    transitions;
z.record(z.record(z.number())).optional(),
    initialState;
z.string().optional(),
    markovConfig;
z.object({});
maxTransitions: z.number().positive().optional(),
    normalizeProbabilities;
z.boolean().optional(),
    terminationStates;
z.array(z.string()).optional(),
    detectLoops;
z.boolean().optional(),
    custom;
z.record(z.any()).optional();
optional();
;
// Epic 8 Python Integration
export const PythonTransformNodeSchema = BaseNode.extend({});
type: z.literal('PythonTransform'),
    code;
z.string(),
    timeout;
z.number().positive().optional(),
    memoryLimit;
z.string().optional(),
    allowedModules;
z.array(z.string()).optional(),
    pythonConfig;
z.object({});
strictMode: z.boolean().optional(),
    enableCaching;
z.boolean().optional(),
    executorUrl;
z.string().optional(),
    retryAttempts;
z.number().min(0).optional(),
    fallbackBehavior;
z.enum(['error', 'skip', 'default']).optional(),
    defaultOutput;
z.string().optional();
optional();
;
export const AnyNodeSchema = z.discriminatedUnion('type', []);
WeightedChoiceNodeSchema,
    ConcatNodeSchema,
    OutputNodeSchema,
    IncludeNodeSchema,
    SetVariableNodeSchema,
    GetVariableNodeSchema,
    // Epic 7 Advanced Nodes
    WeightedAdvancedNodeSchema,
    ConditionalNodeSchema,
    SequentialNodeSchema,
    MarkovNodeSchema,
    // Epic 8 Python Integration
    PythonTransformNodeSchema;
;
export const GraphSchema = z.object({ nodes: z.array(AnyNodeSchema),
    seed: z.union([z.string(), z.number()]).optional() });
;
