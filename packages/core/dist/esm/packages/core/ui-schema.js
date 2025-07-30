// packages/core/ui-schema.ts
// User-facing schema definitions - what designers actually see and interact with
// These schemas hide all technical implementation details from users
import { z } from 'zod';
// Base UI Node - only user-relevant fields
export const UIBaseNode = z.object({});
name: z.string().optional(), // User-friendly label (optional),
    description;
z.string().optional(); // User description (optional),
;
// UI schemas for each node type - simplified for designers
export const UIWeightedChoiceNode = UIBaseNode.extend({});
type: z.literal('WeightedChoice'),
    choices;
z.array(z.string()).default([]),
;
;
export const UIConcatNode = UIBaseNode.extend({});
type: z.literal('Concat'),
    separator;
z.string().default(' '); // Simple separator option,
;
export const UIOutputNode = UIBaseNode.extend({});
type: z.literal('Output'),
    template;
z.string().optional(); // Optional template for output formatting,
;
// Template-based nodes use {variable} syntax
export const UIPromptNode = UIBaseNode.extend({});
type: z.literal('Prompt'),
    template;
z.string(); // e.g., "A {creature} in a {setting}"
;
// Simplified variable nodes
export const UISetVariableNode = UIBaseNode.extend({});
type: z.literal('SetVariable'),
    variableName;
z.string(),
    value;
z.string(),
;
;
export const UIGetVariableNode = UIBaseNode.extend({});
type: z.literal('GetVariable'),
    variableName;
z.string(),
    defaultValue;
z.string().optional(),
;
;
// Advanced nodes with simplified interfaces
export const UIConditionalNode = UIBaseNode.extend({});
type: z.literal('Conditional'),
    conditions;
z.array(z.object({}), when, z.string(), // Simple condition text,
then, z.string(), // Output when true,
label, z.string().optional() // User label for this condition,
);
([]),
    otherwise;
z.string().optional(); // Default case;
;
export const UISequentialNode = UIBaseNode.extend({});
type: z.literal('Sequential'),
    items;
z.array(z.string()).default([]),
    mode;
z.enum(['in-order', 'cycle', 'random']).default('in-order'),
;
;
// Union of all UI node types
export const UIAnyNode = z.discriminatedUnion('type', []);
UIWeightedChoiceNode,
    UIConcatNode,
    UIOutputNode,
    UIPromptNode,
    UISetVariableNode,
    UIGetVariableNode,
    UIConditionalNode,
    UISequentialNode;
;
// UI Graph structure
export const UIGraph = z.object({});
nodes: z.array(UIAnyNode),
;
;
