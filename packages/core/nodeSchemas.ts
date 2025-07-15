import { z } from "zod";

// Base schema for all node types
const baseNodeSchema = z.object({
  label: z.string().default("Node"),
  id: z.string().default(""),
  variations: z.array(z.string()).default([]),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  category: z.string().default("general"),
});

// Enhanced schemas for each node type
export const nodeSchemas: Record<string, z.ZodSchema<any>> = {
  Subject: baseNodeSchema.extend({
    type: z.literal("Subject").default("Subject"),
    subjects: z.array(z.string()).default(["subject"]),
    singularForm: z.string().default("subject"),
    pluralForm: z.string().default("subjects"),
    defaultWeight: z.number().default(1),
  }),
  
  Connector: baseNodeSchema.extend({
    type: z.literal("Connector").default("Connector"),
    connectors: z.array(z.string()).default(["and"]),
    grammarType: z.enum(["coordinating", "subordinating", "correlative"]).default("coordinating"),
    position: z.enum(["before", "after", "between"]).default("between"),
  }),
  
  Attribute: baseNodeSchema.extend({
    type: z.literal("Attribute").default("Attribute"),
    attributes: z.array(z.string()).default(["attribute"]),
    targetNoun: z.string().default(""),
    adjectiveType: z.enum(["descriptive", "quantitative", "demonstrative"]).default("descriptive"),
    position: z.enum(["before", "after"]).default("before"),
  }),
  
  Action: baseNodeSchema.extend({
    type: z.literal("Action").default("Action"),
    actions: z.array(z.string()).default(["action"]),
    tense: z.enum(["present", "past", "future"]).default("present"),
    voice: z.enum(["active", "passive"]).default("active"),
    intensity: z.enum(["low", "medium", "high"]).default("medium"),
  }),
  
  WeightedChoice: baseNodeSchema.extend({
    type: z.literal("WeightedChoice").default("WeightedChoice"),
    weights: z.array(z.number()).default([1]),
    options: z.array(z.string()).default(["option"]),
  }),
  
  Concat: baseNodeSchema.extend({
    type: z.literal("Concat").default("Concat"),
    delimiter: z.string().default(", "),
    formatType: z.enum(["sentence", "list", "paragraph"]).default("sentence"),
  }),
  
  Output: baseNodeSchema.extend({
    type: z.literal("Output").default("Output"),
    prompt: z.string().default(""),
    outputFormat: z.enum(["text", "markdown", "json"]).default("text"),
  }),
  
  Include: baseNodeSchema.extend({
    type: z.literal("Include").default("Include"),
    ref: z.string().default(""),
    includeType: z.enum(["bundle", "template", "component"]).default("bundle"),
  }),
  
  SetVariable: baseNodeSchema.extend({
    type: z.literal("SetVariable").default("SetVariable"),
    name: z.string().default(""),
    value: z.string().default(""),
    variableType: z.enum(["string", "number", "boolean", "object"]).default("string"),
  }),
  
  GetVariable: baseNodeSchema.extend({
    type: z.literal("GetVariable").default("GetVariable"),
    name: z.string().default(""),
    defaultValue: z.string().default(""),
  }),
};
