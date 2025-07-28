import { z } from 'zod';
export declare const NodeTypeEnum: z.ZodEnum<[string, ...string[]]>;
export declare const BaseNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const WeightedChoiceNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ConcatNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const OutputNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const IncludeNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SetVariableNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const GetVariableNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const WeightedAdvancedNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ConditionalNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SequentialNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const MarkovNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const PythonTransformNodeSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AnyNodeSchema: z.ZodDiscriminatedUnion<"type", readonly [z.ZodDiscriminatedUnionOption<"type">, ...z.ZodDiscriminatedUnionOption<"type">[]]>;
export declare const GraphSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Graph = z.infer<typeof GraphSchema>;
export type Node = z.infer<typeof AnyNodeSchema>;
//# sourceMappingURL=graphSchema.d.ts.map