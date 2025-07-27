import { z } from 'zod';
export declare const UIBaseNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
}, {
    name?: string;
    description?: string;
}>;
export declare const UIWeightedChoiceNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"WeightedChoice">;
    choices: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "WeightedChoice";
    choices?: string[];
}, {
    name?: string;
    description?: string;
    type?: "WeightedChoice";
    choices?: string[];
}>;
export declare const UIConcatNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Concat">;
    separator: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Concat";
    separator?: string;
}, {
    name?: string;
    description?: string;
    type?: "Concat";
    separator?: string;
}>;
export declare const UIOutputNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Output">;
    template: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Output";
    template?: string;
}, {
    name?: string;
    description?: string;
    type?: "Output";
    template?: string;
}>;
export declare const UIPromptNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Prompt">;
    template: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Prompt";
    template?: string;
}, {
    name?: string;
    description?: string;
    type?: "Prompt";
    template?: string;
}>;
export declare const UISetVariableNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"SetVariable">;
    variableName: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    value?: string;
    type?: "SetVariable";
    variableName?: string;
}, {
    name?: string;
    description?: string;
    value?: string;
    type?: "SetVariable";
    variableName?: string;
}>;
export declare const UIGetVariableNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"GetVariable">;
    variableName: z.ZodString;
    defaultValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "GetVariable";
    defaultValue?: string;
    variableName?: string;
}, {
    name?: string;
    description?: string;
    type?: "GetVariable";
    defaultValue?: string;
    variableName?: string;
}>;
export declare const UIConditionalNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Conditional">;
    conditions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        when: z.ZodString;
        then: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        label?: string;
        then?: string;
        when?: string;
    }, {
        label?: string;
        then?: string;
        when?: string;
    }>, "many">>;
    otherwise: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Conditional";
    conditions?: {
        label?: string;
        then?: string;
        when?: string;
    }[];
    otherwise?: string;
}, {
    name?: string;
    description?: string;
    type?: "Conditional";
    conditions?: {
        label?: string;
        then?: string;
        when?: string;
    }[];
    otherwise?: string;
}>;
export declare const UISequentialNode: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Sequential">;
    items: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    mode: z.ZodDefault<z.ZodEnum<["in-order", "cycle", "random"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Sequential";
    items?: string[];
    mode?: "random" | "in-order" | "cycle";
}, {
    name?: string;
    description?: string;
    type?: "Sequential";
    items?: string[];
    mode?: "random" | "in-order" | "cycle";
}>;
export declare const UIAnyNode: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"WeightedChoice">;
    choices: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "WeightedChoice";
    choices?: string[];
}, {
    name?: string;
    description?: string;
    type?: "WeightedChoice";
    choices?: string[];
}>, z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Concat">;
    separator: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Concat";
    separator?: string;
}, {
    name?: string;
    description?: string;
    type?: "Concat";
    separator?: string;
}>, z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Output">;
    template: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Output";
    template?: string;
}, {
    name?: string;
    description?: string;
    type?: "Output";
    template?: string;
}>, z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Prompt">;
    template: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Prompt";
    template?: string;
}, {
    name?: string;
    description?: string;
    type?: "Prompt";
    template?: string;
}>, z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"SetVariable">;
    variableName: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    value?: string;
    type?: "SetVariable";
    variableName?: string;
}, {
    name?: string;
    description?: string;
    value?: string;
    type?: "SetVariable";
    variableName?: string;
}>, z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"GetVariable">;
    variableName: z.ZodString;
    defaultValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "GetVariable";
    defaultValue?: string;
    variableName?: string;
}, {
    name?: string;
    description?: string;
    type?: "GetVariable";
    defaultValue?: string;
    variableName?: string;
}>, z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Conditional">;
    conditions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        when: z.ZodString;
        then: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        label?: string;
        then?: string;
        when?: string;
    }, {
        label?: string;
        then?: string;
        when?: string;
    }>, "many">>;
    otherwise: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Conditional";
    conditions?: {
        label?: string;
        then?: string;
        when?: string;
    }[];
    otherwise?: string;
}, {
    name?: string;
    description?: string;
    type?: "Conditional";
    conditions?: {
        label?: string;
        then?: string;
        when?: string;
    }[];
    otherwise?: string;
}>, z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"Sequential">;
    items: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    mode: z.ZodDefault<z.ZodEnum<["in-order", "cycle", "random"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    type?: "Sequential";
    items?: string[];
    mode?: "random" | "in-order" | "cycle";
}, {
    name?: string;
    description?: string;
    type?: "Sequential";
    items?: string[];
    mode?: "random" | "in-order" | "cycle";
}>]>;
export declare const UIGraph: z.ZodObject<{
    nodes: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"WeightedChoice">;
        choices: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        type?: "WeightedChoice";
        choices?: string[];
    }, {
        name?: string;
        description?: string;
        type?: "WeightedChoice";
        choices?: string[];
    }>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"Concat">;
        separator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        type?: "Concat";
        separator?: string;
    }, {
        name?: string;
        description?: string;
        type?: "Concat";
        separator?: string;
    }>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"Output">;
        template: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        type?: "Output";
        template?: string;
    }, {
        name?: string;
        description?: string;
        type?: "Output";
        template?: string;
    }>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"Prompt">;
        template: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        type?: "Prompt";
        template?: string;
    }, {
        name?: string;
        description?: string;
        type?: "Prompt";
        template?: string;
    }>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"SetVariable">;
        variableName: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        value?: string;
        type?: "SetVariable";
        variableName?: string;
    }, {
        name?: string;
        description?: string;
        value?: string;
        type?: "SetVariable";
        variableName?: string;
    }>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"GetVariable">;
        variableName: z.ZodString;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        type?: "GetVariable";
        defaultValue?: string;
        variableName?: string;
    }, {
        name?: string;
        description?: string;
        type?: "GetVariable";
        defaultValue?: string;
        variableName?: string;
    }>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"Conditional">;
        conditions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            when: z.ZodString;
            then: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            label?: string;
            then?: string;
            when?: string;
        }, {
            label?: string;
            then?: string;
            when?: string;
        }>, "many">>;
        otherwise: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        type?: "Conditional";
        conditions?: {
            label?: string;
            then?: string;
            when?: string;
        }[];
        otherwise?: string;
    }, {
        name?: string;
        description?: string;
        type?: "Conditional";
        conditions?: {
            label?: string;
            then?: string;
            when?: string;
        }[];
        otherwise?: string;
    }>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    } & {
        type: z.ZodLiteral<"Sequential">;
        items: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        mode: z.ZodDefault<z.ZodEnum<["in-order", "cycle", "random"]>>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        type?: "Sequential";
        items?: string[];
        mode?: "random" | "in-order" | "cycle";
    }, {
        name?: string;
        description?: string;
        type?: "Sequential";
        items?: string[];
        mode?: "random" | "in-order" | "cycle";
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    nodes?: ({
        name?: string;
        description?: string;
        type?: "WeightedChoice";
        choices?: string[];
    } | {
        name?: string;
        description?: string;
        type?: "Concat";
        separator?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Output";
        template?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Prompt";
        template?: string;
    } | {
        name?: string;
        description?: string;
        value?: string;
        type?: "SetVariable";
        variableName?: string;
    } | {
        name?: string;
        description?: string;
        type?: "GetVariable";
        defaultValue?: string;
        variableName?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Conditional";
        conditions?: {
            label?: string;
            then?: string;
            when?: string;
        }[];
        otherwise?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Sequential";
        items?: string[];
        mode?: "random" | "in-order" | "cycle";
    })[];
}, {
    nodes?: ({
        name?: string;
        description?: string;
        type?: "WeightedChoice";
        choices?: string[];
    } | {
        name?: string;
        description?: string;
        type?: "Concat";
        separator?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Output";
        template?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Prompt";
        template?: string;
    } | {
        name?: string;
        description?: string;
        value?: string;
        type?: "SetVariable";
        variableName?: string;
    } | {
        name?: string;
        description?: string;
        type?: "GetVariable";
        defaultValue?: string;
        variableName?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Conditional";
        conditions?: {
            label?: string;
            then?: string;
            when?: string;
        }[];
        otherwise?: string;
    } | {
        name?: string;
        description?: string;
        type?: "Sequential";
        items?: string[];
        mode?: "random" | "in-order" | "cycle";
    })[];
}>;
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
        inputs: string[];
        outputs: string[];
    };
}
export interface TemplateParser {
    extractVariables(template: string): ExtractedVariable[];
    validateTemplate(template: string): {
        valid: boolean;
        errors: string[];
    };
    previewTemplate(template: string, variables: Record<string, string>): string;
}
//# sourceMappingURL=ui-schema.d.ts.map