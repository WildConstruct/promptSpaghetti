import { z } from 'zod';

/**
 * User-facing schema definitions for designing prompt graphs without leaking
 * implementation details. These schemas intentionally stay lightweight so
 * UI builders can reason about the available fields.
 */

// Minimal base fields common to every UI node.
export const UIBaseNode = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});

export const UIWeightedChoiceNode = UIBaseNode.extend({
  type: z.literal('WeightedChoice'),
  choices: z.array(z.string()).default([])
});

export const UIConcatNode = UIBaseNode.extend({
  type: z.literal('Concat'),
  separator: z.string().default(' ')
});

export const UIOutputNode = UIBaseNode.extend({
  type: z.literal('Output'),
  template: z.string().optional()
});

export const UIPromptNode = UIBaseNode.extend({
  type: z.literal('Prompt'),
  template: z.string()
});

export const UISetVariableNode = UIBaseNode.extend({
  type: z.literal('SetVariable'),
  variableName: z.string(),
  value: z.string()
});

export const UIGetVariableNode = UIBaseNode.extend({
  type: z.literal('GetVariable'),
  variableName: z.string(),
  defaultValue: z.string().optional()
});

const UICondition = z.object({
  when: z.string(),
  then: z.string(),
  label: z.string().optional()
});

export const UIConditionalNode = UIBaseNode.extend({
  type: z.literal('Conditional'),
  conditions: z.array(UICondition).default([]),
  otherwise: z.string().optional()
});

export const UISequentialNode = UIBaseNode.extend({
  type: z.literal('Sequential'),
  items: z.array(z.string()).default([]),
  mode: z.enum(['in-order', 'cycle', 'random']).default('in-order')
});

export const UIAnyNode = z.discriminatedUnion('type', [
  UIWeightedChoiceNode,
  UIConcatNode,
  UIOutputNode,
  UIPromptNode,
  UISetVariableNode,
  UIGetVariableNode,
  UIConditionalNode,
  UISequentialNode
]);

export const UIGraphSchema = z.object({
  nodes: z.array(UIAnyNode)
});

export type UINode = z.infer<typeof UIAnyNode>;
export type UIGraph = z.infer<typeof UIGraphSchema>;

export interface ExtractedVariable {
  name: string;
  placeholder: string;
  position: number;
}

export interface NodeUIState {
  basic: UINode;
  advanced?: {
    performance?: boolean;
    debugging?: boolean;
  };
  connections?: {
    inputs: string[];
    outputs: string[];
  };
}

export interface TemplateParser {
  extractVariables(template: string): ExtractedVariable[];
  validateTemplate(
    template: string
  ): {
    valid: boolean;
    errors: string[];
  };
  previewTemplate(
    template: string,
    variables: Record<string, string>
  ): string;
}
