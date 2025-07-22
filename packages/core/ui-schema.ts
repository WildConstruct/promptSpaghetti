// packages/core/ui-schema.ts
// User-facing schema definitions - what designers actually see and interact with
// These schemas hide all technical implementation details from users

import { z } from 'zod';

// Base UI Node - only user-relevant fields
export const UIBaseNode = z.object({
  name: z.string().optional(),           // User-friendly label (optional)
  description: z.string().optional(),    // User description (optional)
});

// UI schemas for each node type - simplified for designers
export const UIWeightedChoiceNode = UIBaseNode.extend({
  type: z.literal('WeightedChoice'),
  choices: z.array(z.string()).default([]),
  // Weights are managed automatically or through simple UI controls
});

export const UIConcatNode = UIBaseNode.extend({
  type: z.literal('Concat'),
  separator: z.string().default(' '),    // Simple separator option
});

export const UIOutputNode = UIBaseNode.extend({
  type: z.literal('Output'),
  template: z.string().optional(),       // Optional template for output formatting
});

// Template-based nodes use {variable} syntax
export const UIPromptNode = UIBaseNode.extend({
  type: z.literal('Prompt'),
  template: z.string(),                  // e.g., "A {creature} in a {setting}"
  // Variables are auto-extracted from template, not manually entered
});

// Simplified variable nodes
export const UISetVariableNode = UIBaseNode.extend({
  type: z.literal('SetVariable'),
  variableName: z.string(),
  value: z.string(),
  // All scope/persistence details hidden - use sensible defaults
});

export const UIGetVariableNode = UIBaseNode.extend({
  type: z.literal('GetVariable'),
  variableName: z.string(),
  defaultValue: z.string().optional(),
  // Required/optional status inferred from usage
});

// Advanced nodes with simplified interfaces
export const UIConditionalNode = UIBaseNode.extend({
  type: z.literal('Conditional'),
  conditions: z.array(z.object({
    when: z.string(),                    // Simple condition text
    then: z.string(),                    // Output when true
    label: z.string().optional(),        // User label for this condition
  })).default([]),
  otherwise: z.string().optional(),      // Default case
});

export const UISequentialNode = UIBaseNode.extend({
  type: z.literal('Sequential'),
  items: z.array(z.string()).default([]),
  mode: z.enum(['in-order', 'cycle', 'random']).default('in-order'),
});

// Union of all UI node types
export const UIAnyNode = z.discriminatedUnion('type', [
  UIWeightedChoiceNode,
  UIConcatNode,
  UIOutputNode,
  UIPromptNode,
  UISetVariableNode,
  UIGetVariableNode,
  UIConditionalNode,
  UISequentialNode,
]);

// UI Graph structure
export const UIGraph = z.object({
  nodes: z.array(UIAnyNode),
  // Connections handled visually, not as raw data
});

// Type exports
export type UINode = z.infer<typeof UIAnyNode>;
export type UIGraph = z.infer<typeof UIGraph>;

// Utility type for extracting variables from templates
export interface ExtractedVariable {
  name: string;                          // Variable name (without braces)
  placeholder: string;                   // Full placeholder text {name}
  position: number;                      // Position in template
}

// UI State management for progressive disclosure
export interface NodeUIState {
  basic: UINode;                         // Always visible fields
  advanced?: {                           // Advanced options (collapsed by default)
    performance?: boolean;               // Show performance settings
    debugging?: boolean;                 // Show debug information
  };
  connections?: {                        // Visual connection state
    inputs: string[];                    // Connected input node IDs
    outputs: string[];                   // Connected output node IDs
  };
}

// Template parsing utilities interface
export interface TemplateParser {
  extractVariables(template: string): ExtractedVariable[];
  validateTemplate(template: string): { valid: boolean; errors: string[] };
  previewTemplate(template: string, variables: Record<string, string>): string;
}