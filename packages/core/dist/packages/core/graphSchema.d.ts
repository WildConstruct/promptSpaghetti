import { z } from 'zod';
export declare const NodeTypeEnum: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
export declare const BaseNode: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}, {
    id?: string;
    type?: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}>;
export declare const WeightedChoiceNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"WeightedChoice">;
    choices: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value?: string;
        weight?: number;
    }, {
        value?: string;
        weight?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "WeightedChoice";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
}, {
    id?: string;
    type?: "WeightedChoice";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
}>;
export declare const ConcatNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Concat">;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Concat";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}, {
    id?: string;
    type?: "Concat";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}>;
export declare const OutputNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Output">;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Output";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}, {
    id?: string;
    type?: "Output";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}>;
export declare const IncludeNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Include">;
    name: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    type?: "Include";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}, {
    id?: string;
    name?: string;
    type?: "Include";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}>;
export declare const SetVariableNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"SetVariable">;
    key: z.ZodEffects<z.ZodString, string, string>;
    value: z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    value?: string | number | boolean | string[] | Record<string, string>;
    type?: "SetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}, {
    id?: string;
    value?: string | number | boolean | string[] | Record<string, string>;
    type?: "SetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}>;
export declare const GetVariableNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"GetVariable">;
    key: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "GetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}, {
    id?: string;
    type?: "GetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}>;
export declare const WeightedAdvancedNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"WeightedAdvanced">;
    choices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value?: string;
        weight?: number;
    }, {
        value?: string;
        weight?: number;
    }>, "many">>;
    distributionConfig: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["linear", "exponential", "gaussian", "custom"]>;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        normalize: z.ZodOptional<z.ZodBoolean>;
        minWeight: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    }, {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "WeightedAdvanced";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
    distributionConfig?: {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    };
}, {
    id?: string;
    type?: "WeightedAdvanced";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
    distributionConfig?: {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    };
}>;
export declare const ConditionalNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Conditional">;
    branches: z.ZodOptional<z.ZodArray<z.ZodObject<{
        condition: z.ZodEffects<z.ZodString, string, string>;
        output: z.ZodEffects<z.ZodString, string, string>;
        label: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        condition?: string;
        output?: string;
        label?: string;
    }, {
        condition?: string;
        output?: string;
        label?: string;
    }>, "many">>;
    defaultOutput: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    conditionalConfig: z.ZodOptional<z.ZodObject<{
        allowVariableAccess: z.ZodOptional<z.ZodBoolean>;
        strictMode: z.ZodOptional<z.ZodBoolean>;
        customFunctions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>>>;
    }, "strip", z.ZodTypeAny, {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    }, {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Conditional";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    branches?: {
        condition?: string;
        output?: string;
        label?: string;
    }[];
    defaultOutput?: string;
    conditionalConfig?: {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    };
}, {
    id?: string;
    type?: "Conditional";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    branches?: {
        condition?: string;
        output?: string;
        label?: string;
    }[];
    defaultOutput?: string;
    conditionalConfig?: {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    };
}>;
export declare const SequentialNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Sequential">;
    sequence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    pattern: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["linear", "cyclical", "random", "weighted"]>;
        config: z.ZodOptional<z.ZodObject<{
            weights: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            allowRepeats: z.ZodOptional<z.ZodBoolean>;
            custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        }, {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    }, {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Sequential";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    sequence?: string[];
    pattern?: {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    };
}, {
    id?: string;
    type?: "Sequential";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    sequence?: string[];
    pattern?: {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    };
}>;
export declare const MarkovNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Markov">;
    states: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    transitions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>>;
    initialState: z.ZodOptional<z.ZodString>;
    markovConfig: z.ZodOptional<z.ZodObject<{
        maxTransitions: z.ZodOptional<z.ZodNumber>;
        normalizeProbabilities: z.ZodOptional<z.ZodBoolean>;
        terminationStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        detectLoops: z.ZodOptional<z.ZodBoolean>;
        custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    }, {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Markov";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    states?: string[];
    transitions?: Record<string, Record<string, number>>;
    initialState?: string;
    markovConfig?: {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    };
}, {
    id?: string;
    type?: "Markov";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    states?: string[];
    transitions?: Record<string, Record<string, number>>;
    initialState?: string;
    markovConfig?: {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    };
}>;
export declare const PythonTransformNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"PythonTransform">;
    code: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    memoryLimit: z.ZodOptional<z.ZodString>;
    allowedModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    pythonConfig: z.ZodOptional<z.ZodObject<{
        strictMode: z.ZodOptional<z.ZodBoolean>;
        enableCaching: z.ZodOptional<z.ZodBoolean>;
        executorUrl: z.ZodOptional<z.ZodString>;
        retryAttempts: z.ZodOptional<z.ZodNumber>;
        fallbackBehavior: z.ZodOptional<z.ZodEnum<["error", "skip", "default"]>>;
        defaultOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    }, {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    code?: string;
    type?: "PythonTransform";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    timeout?: number;
    memoryLimit?: string;
    allowedModules?: string[];
    pythonConfig?: {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    };
}, {
    id?: string;
    code?: string;
    type?: "PythonTransform";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    timeout?: number;
    memoryLimit?: string;
    allowedModules?: string[];
    pythonConfig?: {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    };
}>;
export declare const AnyNodeSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"WeightedChoice">;
    choices: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value?: string;
        weight?: number;
    }, {
        value?: string;
        weight?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "WeightedChoice";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
}, {
    id?: string;
    type?: "WeightedChoice";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Concat">;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Concat";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}, {
    id?: string;
    type?: "Concat";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Output">;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Output";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}, {
    id?: string;
    type?: "Output";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Include">;
    name: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    type?: "Include";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}, {
    id?: string;
    name?: string;
    type?: "Include";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"SetVariable">;
    key: z.ZodEffects<z.ZodString, string, string>;
    value: z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    value?: string | number | boolean | string[] | Record<string, string>;
    type?: "SetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}, {
    id?: string;
    value?: string | number | boolean | string[] | Record<string, string>;
    type?: "SetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"GetVariable">;
    key: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "GetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}, {
    id?: string;
    type?: "GetVariable";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    key?: string;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"WeightedAdvanced">;
    choices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value?: string;
        weight?: number;
    }, {
        value?: string;
        weight?: number;
    }>, "many">>;
    distributionConfig: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["linear", "exponential", "gaussian", "custom"]>;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        normalize: z.ZodOptional<z.ZodBoolean>;
        minWeight: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    }, {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "WeightedAdvanced";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
    distributionConfig?: {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    };
}, {
    id?: string;
    type?: "WeightedAdvanced";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    choices?: {
        value?: string;
        weight?: number;
    }[];
    distributionConfig?: {
        normalize?: boolean;
        type?: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number>;
        minWeight?: number;
    };
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Conditional">;
    branches: z.ZodOptional<z.ZodArray<z.ZodObject<{
        condition: z.ZodEffects<z.ZodString, string, string>;
        output: z.ZodEffects<z.ZodString, string, string>;
        label: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        condition?: string;
        output?: string;
        label?: string;
    }, {
        condition?: string;
        output?: string;
        label?: string;
    }>, "many">>;
    defaultOutput: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    conditionalConfig: z.ZodOptional<z.ZodObject<{
        allowVariableAccess: z.ZodOptional<z.ZodBoolean>;
        strictMode: z.ZodOptional<z.ZodBoolean>;
        customFunctions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>>>;
    }, "strip", z.ZodTypeAny, {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    }, {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Conditional";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    branches?: {
        condition?: string;
        output?: string;
        label?: string;
    }[];
    defaultOutput?: string;
    conditionalConfig?: {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    };
}, {
    id?: string;
    type?: "Conditional";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    branches?: {
        condition?: string;
        output?: string;
        label?: string;
    }[];
    defaultOutput?: string;
    conditionalConfig?: {
        allowVariableAccess?: boolean;
        strictMode?: boolean;
        customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
    };
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Sequential">;
    sequence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    pattern: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["linear", "cyclical", "random", "weighted"]>;
        config: z.ZodOptional<z.ZodObject<{
            weights: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            allowRepeats: z.ZodOptional<z.ZodBoolean>;
            custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        }, {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    }, {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Sequential";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    sequence?: string[];
    pattern?: {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    };
}, {
    id?: string;
    type?: "Sequential";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    sequence?: string[];
    pattern?: {
        type?: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any>;
            weights?: number[];
            allowRepeats?: boolean;
        };
    };
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"Markov">;
    states: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    transitions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>>;
    initialState: z.ZodOptional<z.ZodString>;
    markovConfig: z.ZodOptional<z.ZodObject<{
        maxTransitions: z.ZodOptional<z.ZodNumber>;
        normalizeProbabilities: z.ZodOptional<z.ZodBoolean>;
        terminationStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        detectLoops: z.ZodOptional<z.ZodBoolean>;
        custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    }, {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "Markov";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    states?: string[];
    transitions?: Record<string, Record<string, number>>;
    initialState?: string;
    markovConfig?: {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    };
}, {
    id?: string;
    type?: "Markov";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    states?: string[];
    transitions?: Record<string, Record<string, number>>;
    initialState?: string;
    markovConfig?: {
        custom?: Record<string, any>;
        maxTransitions?: number;
        normalizeProbabilities?: boolean;
        terminationStates?: string[];
        detectLoops?: boolean;
    };
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    template: z.ZodOptional<z.ZodString>;
    extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        placeholder: z.ZodString;
        startIndex: z.ZodNumber;
        endIndex: z.ZodNumber;
        isValid: z.ZodBoolean;
        inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }, {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }>, "many">>;
} & {
    type: z.ZodLiteral<"PythonTransform">;
    code: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    memoryLimit: z.ZodOptional<z.ZodString>;
    allowedModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    pythonConfig: z.ZodOptional<z.ZodObject<{
        strictMode: z.ZodOptional<z.ZodBoolean>;
        enableCaching: z.ZodOptional<z.ZodBoolean>;
        executorUrl: z.ZodOptional<z.ZodString>;
        retryAttempts: z.ZodOptional<z.ZodNumber>;
        fallbackBehavior: z.ZodOptional<z.ZodEnum<["error", "skip", "default"]>>;
        defaultOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    }, {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    code?: string;
    type?: "PythonTransform";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    timeout?: number;
    memoryLimit?: string;
    allowedModules?: string[];
    pythonConfig?: {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    };
}, {
    id?: string;
    code?: string;
    type?: "PythonTransform";
    inputs?: string[];
    template?: string;
    extractedVariables?: {
        name?: string;
        placeholder?: string;
        startIndex?: number;
        endIndex?: number;
        isValid?: boolean;
        inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
        defaultValue?: string;
    }[];
    timeout?: number;
    memoryLimit?: string;
    allowedModules?: string[];
    pythonConfig?: {
        defaultOutput?: string;
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: "error" | "skip" | "default";
    };
}>]>;
export declare const GraphSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"WeightedChoice">;
        choices: z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            weight: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value?: string;
            weight?: number;
        }, {
            value?: string;
            weight?: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "WeightedChoice";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
    }, {
        id?: string;
        type?: "WeightedChoice";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"Concat">;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "Concat";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    }, {
        id?: string;
        type?: "Concat";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"Output">;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "Output";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    }, {
        id?: string;
        type?: "Output";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"Include">;
        name: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        type?: "Include";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    }, {
        id?: string;
        name?: string;
        type?: "Include";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"SetVariable">;
        key: z.ZodEffects<z.ZodString, string, string>;
        value: z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        value?: string | number | boolean | string[] | Record<string, string>;
        type?: "SetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    }, {
        id?: string;
        value?: string | number | boolean | string[] | Record<string, string>;
        type?: "SetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"GetVariable">;
        key: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "GetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    }, {
        id?: string;
        type?: "GetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"WeightedAdvanced">;
        choices: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            weight: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value?: string;
            weight?: number;
        }, {
            value?: string;
            weight?: number;
        }>, "many">>;
        distributionConfig: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["linear", "exponential", "gaussian", "custom"]>;
            parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            normalize: z.ZodOptional<z.ZodBoolean>;
            minWeight: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            normalize?: boolean;
            type?: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number>;
            minWeight?: number;
        }, {
            normalize?: boolean;
            type?: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number>;
            minWeight?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "WeightedAdvanced";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
        distributionConfig?: {
            normalize?: boolean;
            type?: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number>;
            minWeight?: number;
        };
    }, {
        id?: string;
        type?: "WeightedAdvanced";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
        distributionConfig?: {
            normalize?: boolean;
            type?: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number>;
            minWeight?: number;
        };
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"Conditional">;
        branches: z.ZodOptional<z.ZodArray<z.ZodObject<{
            condition: z.ZodEffects<z.ZodString, string, string>;
            output: z.ZodEffects<z.ZodString, string, string>;
            label: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        }, "strip", z.ZodTypeAny, {
            condition?: string;
            output?: string;
            label?: string;
        }, {
            condition?: string;
            output?: string;
            label?: string;
        }>, "many">>;
        defaultOutput: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        conditionalConfig: z.ZodOptional<z.ZodObject<{
            allowVariableAccess: z.ZodOptional<z.ZodBoolean>;
            strictMode: z.ZodOptional<z.ZodBoolean>;
            customFunctions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>>>;
        }, "strip", z.ZodTypeAny, {
            allowVariableAccess?: boolean;
            strictMode?: boolean;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
        }, {
            allowVariableAccess?: boolean;
            strictMode?: boolean;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "Conditional";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        branches?: {
            condition?: string;
            output?: string;
            label?: string;
        }[];
        defaultOutput?: string;
        conditionalConfig?: {
            allowVariableAccess?: boolean;
            strictMode?: boolean;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
        };
    }, {
        id?: string;
        type?: "Conditional";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        branches?: {
            condition?: string;
            output?: string;
            label?: string;
        }[];
        defaultOutput?: string;
        conditionalConfig?: {
            allowVariableAccess?: boolean;
            strictMode?: boolean;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
        };
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"Sequential">;
        sequence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pattern: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["linear", "cyclical", "random", "weighted"]>;
            config: z.ZodOptional<z.ZodObject<{
                weights: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                allowRepeats: z.ZodOptional<z.ZodBoolean>;
                custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, "strip", z.ZodTypeAny, {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            }, {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type?: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            };
        }, {
            type?: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "Sequential";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        sequence?: string[];
        pattern?: {
            type?: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            };
        };
    }, {
        id?: string;
        type?: "Sequential";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        sequence?: string[];
        pattern?: {
            type?: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            };
        };
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"Markov">;
        states: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        transitions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>>;
        initialState: z.ZodOptional<z.ZodString>;
        markovConfig: z.ZodOptional<z.ZodObject<{
            maxTransitions: z.ZodOptional<z.ZodNumber>;
            normalizeProbabilities: z.ZodOptional<z.ZodBoolean>;
            terminationStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            detectLoops: z.ZodOptional<z.ZodBoolean>;
            custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            custom?: Record<string, any>;
            maxTransitions?: number;
            normalizeProbabilities?: boolean;
            terminationStates?: string[];
            detectLoops?: boolean;
        }, {
            custom?: Record<string, any>;
            maxTransitions?: number;
            normalizeProbabilities?: boolean;
            terminationStates?: string[];
            detectLoops?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        type?: "Markov";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        states?: string[];
        transitions?: Record<string, Record<string, number>>;
        initialState?: string;
        markovConfig?: {
            custom?: Record<string, any>;
            maxTransitions?: number;
            normalizeProbabilities?: boolean;
            terminationStates?: string[];
            detectLoops?: boolean;
        };
    }, {
        id?: string;
        type?: "Markov";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        states?: string[];
        transitions?: Record<string, Record<string, number>>;
        initialState?: string;
        markovConfig?: {
            custom?: Record<string, any>;
            maxTransitions?: number;
            normalizeProbabilities?: boolean;
            terminationStates?: string[];
            detectLoops?: boolean;
        };
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        template: z.ZodOptional<z.ZodString>;
        extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            placeholder: z.ZodString;
            startIndex: z.ZodNumber;
            endIndex: z.ZodNumber;
            isValid: z.ZodBoolean;
            inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }, {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }>, "many">>;
    } & {
        type: z.ZodLiteral<"PythonTransform">;
        code: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        memoryLimit: z.ZodOptional<z.ZodString>;
        allowedModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pythonConfig: z.ZodOptional<z.ZodObject<{
            strictMode: z.ZodOptional<z.ZodBoolean>;
            enableCaching: z.ZodOptional<z.ZodBoolean>;
            executorUrl: z.ZodOptional<z.ZodString>;
            retryAttempts: z.ZodOptional<z.ZodNumber>;
            fallbackBehavior: z.ZodOptional<z.ZodEnum<["error", "skip", "default"]>>;
            defaultOutput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            defaultOutput?: string;
            strictMode?: boolean;
            enableCaching?: boolean;
            executorUrl?: string;
            retryAttempts?: number;
            fallbackBehavior?: "error" | "skip" | "default";
        }, {
            defaultOutput?: string;
            strictMode?: boolean;
            enableCaching?: boolean;
            executorUrl?: string;
            retryAttempts?: number;
            fallbackBehavior?: "error" | "skip" | "default";
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        code?: string;
        type?: "PythonTransform";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        timeout?: number;
        memoryLimit?: string;
        allowedModules?: string[];
        pythonConfig?: {
            defaultOutput?: string;
            strictMode?: boolean;
            enableCaching?: boolean;
            executorUrl?: string;
            retryAttempts?: number;
            fallbackBehavior?: "error" | "skip" | "default";
        };
    }, {
        id?: string;
        code?: string;
        type?: "PythonTransform";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        timeout?: number;
        memoryLimit?: string;
        allowedModules?: string[];
        pythonConfig?: {
            defaultOutput?: string;
            strictMode?: boolean;
            enableCaching?: boolean;
            executorUrl?: string;
            retryAttempts?: number;
            fallbackBehavior?: "error" | "skip" | "default";
        };
    }>]>, "many">;
    seed: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strip", z.ZodTypeAny, {
    nodes?: ({
        id?: string;
        type?: "WeightedChoice";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
    } | {
        id?: string;
        type?: "Concat";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        type?: "Output";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        name?: string;
        type?: "Include";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        value?: string | number | boolean | string[] | Record<string, string>;
        type?: "SetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    } | {
        id?: string;
        type?: "GetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    } | {
        id?: string;
        type?: "WeightedAdvanced";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
        distributionConfig?: {
            normalize?: boolean;
            type?: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number>;
            minWeight?: number;
        };
    } | {
        id?: string;
        type?: "Conditional";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        branches?: {
            condition?: string;
            output?: string;
            label?: string;
        }[];
        defaultOutput?: string;
        conditionalConfig?: {
            allowVariableAccess?: boolean;
            strictMode?: boolean;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
        };
    } | {
        id?: string;
        type?: "Sequential";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        sequence?: string[];
        pattern?: {
            type?: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            };
        };
    } | {
        id?: string;
        type?: "Markov";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        states?: string[];
        transitions?: Record<string, Record<string, number>>;
        initialState?: string;
        markovConfig?: {
            custom?: Record<string, any>;
            maxTransitions?: number;
            normalizeProbabilities?: boolean;
            terminationStates?: string[];
            detectLoops?: boolean;
        };
    } | {
        id?: string;
        code?: string;
        type?: "PythonTransform";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        timeout?: number;
        memoryLimit?: string;
        allowedModules?: string[];
        pythonConfig?: {
            defaultOutput?: string;
            strictMode?: boolean;
            enableCaching?: boolean;
            executorUrl?: string;
            retryAttempts?: number;
            fallbackBehavior?: "error" | "skip" | "default";
        };
    })[];
    seed?: string | number;
}, {
    nodes?: ({
        id?: string;
        type?: "WeightedChoice";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
    } | {
        id?: string;
        type?: "Concat";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        type?: "Output";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        name?: string;
        type?: "Include";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        value?: string | number | boolean | string[] | Record<string, string>;
        type?: "SetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    } | {
        id?: string;
        type?: "GetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    } | {
        id?: string;
        type?: "WeightedAdvanced";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
        distributionConfig?: {
            normalize?: boolean;
            type?: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number>;
            minWeight?: number;
        };
    } | {
        id?: string;
        type?: "Conditional";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        branches?: {
            condition?: string;
            output?: string;
            label?: string;
        }[];
        defaultOutput?: string;
        conditionalConfig?: {
            allowVariableAccess?: boolean;
            strictMode?: boolean;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
        };
    } | {
        id?: string;
        type?: "Sequential";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        sequence?: string[];
        pattern?: {
            type?: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            };
        };
    } | {
        id?: string;
        type?: "Markov";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        states?: string[];
        transitions?: Record<string, Record<string, number>>;
        initialState?: string;
        markovConfig?: {
            custom?: Record<string, any>;
            maxTransitions?: number;
            normalizeProbabilities?: boolean;
            terminationStates?: string[];
            detectLoops?: boolean;
        };
    } | {
        id?: string;
        code?: string;
        type?: "PythonTransform";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        timeout?: number;
        memoryLimit?: string;
        allowedModules?: string[];
        pythonConfig?: {
            defaultOutput?: string;
            strictMode?: boolean;
            enableCaching?: boolean;
            executorUrl?: string;
            retryAttempts?: number;
            fallbackBehavior?: "error" | "skip" | "default";
        };
    })[];
    seed?: string | number;
}>;
export type Graph = z.infer<typeof GraphSchema>;
export type Node = z.infer<typeof AnyNodeSchema>;
//# sourceMappingURL=graphSchema.d.ts.map