import { z } from "zod";

// Example: Zod schemas for each node type
export const nodeSchemas: Record<string, z.ZodSchema<any>> = {
  WeightedChoice: z.object({
    label: z.string().default("WeightedChoice"),
    weights: z.array(z.number()),
    options: z.array(z.string()),
  }),
  Concat: z.object({
    label: z.string().default("Concat"),
    delimiter: z.string().default(", "),
  }),
  Output: z.object({
    label: z.string().default("Output"),
    prompt: z.string(),
  }),
  Include: z.object({
    label: z.string().default("Include"),
    ref: z.string(),
  }),
  SetVariable: z.object({
    label: z.string().default("SetVariable"),
    name: z.string(),
    value: z.string(),
  }),
  GetVariable: z.object({
    label: z.string().default("GetVariable"),
    name: z.string(),
  }),
};
