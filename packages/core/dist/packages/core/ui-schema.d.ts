import { z } from 'zod';
export declare const UIBaseNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIWeightedChoiceNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIConcatNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIOutputNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIPromptNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UISetVariableNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIGetVariableNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIConditionalNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UISequentialNode: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIAnyNode: z.ZodDiscriminatedUnion<"type", readonly [z.ZodDiscriminatedUnionOption<"type">, ...z.ZodDiscriminatedUnionOption<"type">[]]>;
export declare const UIGraph: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type UINode = z.infer<typeof UIAnyNode>;
export type UIGraph = z.infer<typeof UIGraph>;
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
        inputs: string;
        outputs: string;
    };
}
export interface TemplateParser {
    extractVariables(template: string): ExtractedVariable;
    validateTemplate(template: string): {
        valid: boolean;
        errors: string;
    };
    previewTemplate(template: string, variables: Record<string, string>): string;
}
//# sourceMappingURL=ui-schema.d.ts.map