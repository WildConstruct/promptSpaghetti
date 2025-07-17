import { z } from 'zod';
export declare const NodeTypeEnum: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
export declare const BaseNode: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    inputs?: string[] | undefined;
}>;
export declare const WeightedChoiceNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"WeightedChoice">;
    choices: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: string;
        weight: number;
    }, {
        value: string;
        weight: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "WeightedChoice";
    choices: {
        value: string;
        weight: number;
    }[];
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "WeightedChoice";
    choices: {
        value: string;
        weight: number;
    }[];
    inputs?: string[] | undefined;
}>;
export declare const ConcatNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Concat">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Concat";
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "Concat";
    inputs?: string[] | undefined;
}>;
export declare const OutputNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Output">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Output";
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "Output";
    inputs?: string[] | undefined;
}>;
export declare const IncludeNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Include">;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Include";
    name: string;
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "Include";
    name: string;
    inputs?: string[] | undefined;
}>;
export declare const SetVariableNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"SetVariable">;
    key: z.ZodString;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "SetVariable";
    key: string;
    value?: any;
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "SetVariable";
    key: string;
    value?: any;
    inputs?: string[] | undefined;
}>;
export declare const GetVariableNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"GetVariable">;
    key: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "GetVariable";
    key: string;
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "GetVariable";
    key: string;
    inputs?: string[] | undefined;
}>;
export declare const WeightedAdvancedNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"WeightedAdvanced">;
    choices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: string;
        weight: number;
    }, {
        value: string;
        weight: number;
    }>, "many">>;
    distributionConfig: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["linear", "exponential", "gaussian", "custom"]>;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        normalize: z.ZodOptional<z.ZodBoolean>;
        minWeight: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    }, {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "WeightedAdvanced";
    inputs?: string[] | undefined;
    choices?: {
        value: string;
        weight: number;
    }[] | undefined;
    distributionConfig?: {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    } | undefined;
}, {
    id: string;
    type: "WeightedAdvanced";
    inputs?: string[] | undefined;
    choices?: {
        value: string;
        weight: number;
    }[] | undefined;
    distributionConfig?: {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    } | undefined;
}>;
export declare const ConditionalNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Conditional">;
    branches: z.ZodOptional<z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        output: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        condition: string;
        output: string;
        label?: string | undefined;
    }, {
        condition: string;
        output: string;
        label?: string | undefined;
    }>, "many">>;
    defaultOutput: z.ZodOptional<z.ZodString>;
    conditionalConfig: z.ZodOptional<z.ZodObject<{
        allowVariableAccess: z.ZodOptional<z.ZodBoolean>;
        strictMode: z.ZodOptional<z.ZodBoolean>;
        customFunctions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    }, {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Conditional";
    inputs?: string[] | undefined;
    branches?: {
        condition: string;
        output: string;
        label?: string | undefined;
    }[] | undefined;
    defaultOutput?: string | undefined;
    conditionalConfig?: {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    } | undefined;
}, {
    id: string;
    type: "Conditional";
    inputs?: string[] | undefined;
    branches?: {
        condition: string;
        output: string;
        label?: string | undefined;
    }[] | undefined;
    defaultOutput?: string | undefined;
    conditionalConfig?: {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    } | undefined;
}>;
export declare const SequentialNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        }, {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    }, {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Sequential";
    inputs?: string[] | undefined;
    sequence?: string[] | undefined;
    pattern?: {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    } | undefined;
}, {
    id: string;
    type: "Sequential";
    inputs?: string[] | undefined;
    sequence?: string[] | undefined;
    pattern?: {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const MarkovNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    }, {
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Markov";
    inputs?: string[] | undefined;
    states?: string[] | undefined;
    transitions?: Record<string, Record<string, number>> | undefined;
    initialState?: string | undefined;
    markovConfig?: {
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    } | undefined;
}, {
    id: string;
    type: "Markov";
    inputs?: string[] | undefined;
    states?: string[] | undefined;
    transitions?: Record<string, Record<string, number>> | undefined;
    initialState?: string | undefined;
    markovConfig?: {
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    } | undefined;
}>;
export declare const PythonTransformNodeSchema: z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    }, {
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "PythonTransform";
    code: string;
    inputs?: string[] | undefined;
    timeout?: number | undefined;
    memoryLimit?: string | undefined;
    allowedModules?: string[] | undefined;
    pythonConfig?: {
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    } | undefined;
}, {
    id: string;
    type: "PythonTransform";
    code: string;
    inputs?: string[] | undefined;
    timeout?: number | undefined;
    memoryLimit?: string | undefined;
    allowedModules?: string[] | undefined;
    pythonConfig?: {
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    } | undefined;
}>;
export declare const AnyNodeSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"WeightedChoice">;
    choices: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: string;
        weight: number;
    }, {
        value: string;
        weight: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "WeightedChoice";
    choices: {
        value: string;
        weight: number;
    }[];
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "WeightedChoice";
    choices: {
        value: string;
        weight: number;
    }[];
    inputs?: string[] | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Concat">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Concat";
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "Concat";
    inputs?: string[] | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Output">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Output";
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "Output";
    inputs?: string[] | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Include">;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Include";
    name: string;
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "Include";
    name: string;
    inputs?: string[] | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"SetVariable">;
    key: z.ZodString;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "SetVariable";
    key: string;
    value?: any;
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "SetVariable";
    key: string;
    value?: any;
    inputs?: string[] | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"GetVariable">;
    key: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "GetVariable";
    key: string;
    inputs?: string[] | undefined;
}, {
    id: string;
    type: "GetVariable";
    key: string;
    inputs?: string[] | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"WeightedAdvanced">;
    choices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: string;
        weight: number;
    }, {
        value: string;
        weight: number;
    }>, "many">>;
    distributionConfig: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["linear", "exponential", "gaussian", "custom"]>;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        normalize: z.ZodOptional<z.ZodBoolean>;
        minWeight: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    }, {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "WeightedAdvanced";
    inputs?: string[] | undefined;
    choices?: {
        value: string;
        weight: number;
    }[] | undefined;
    distributionConfig?: {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    } | undefined;
}, {
    id: string;
    type: "WeightedAdvanced";
    inputs?: string[] | undefined;
    choices?: {
        value: string;
        weight: number;
    }[] | undefined;
    distributionConfig?: {
        type: "custom" | "linear" | "exponential" | "gaussian";
        parameters?: Record<string, number> | undefined;
        normalize?: boolean | undefined;
        minWeight?: number | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    type: z.ZodLiteral<"Conditional">;
    branches: z.ZodOptional<z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        output: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        condition: string;
        output: string;
        label?: string | undefined;
    }, {
        condition: string;
        output: string;
        label?: string | undefined;
    }>, "many">>;
    defaultOutput: z.ZodOptional<z.ZodString>;
    conditionalConfig: z.ZodOptional<z.ZodObject<{
        allowVariableAccess: z.ZodOptional<z.ZodBoolean>;
        strictMode: z.ZodOptional<z.ZodBoolean>;
        customFunctions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    }, {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Conditional";
    inputs?: string[] | undefined;
    branches?: {
        condition: string;
        output: string;
        label?: string | undefined;
    }[] | undefined;
    defaultOutput?: string | undefined;
    conditionalConfig?: {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    } | undefined;
}, {
    id: string;
    type: "Conditional";
    inputs?: string[] | undefined;
    branches?: {
        condition: string;
        output: string;
        label?: string | undefined;
    }[] | undefined;
    defaultOutput?: string | undefined;
    conditionalConfig?: {
        allowVariableAccess?: boolean | undefined;
        strictMode?: boolean | undefined;
        customFunctions?: Record<string, any> | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        }, {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    }, {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Sequential";
    inputs?: string[] | undefined;
    sequence?: string[] | undefined;
    pattern?: {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    } | undefined;
}, {
    id: string;
    type: "Sequential";
    inputs?: string[] | undefined;
    sequence?: string[] | undefined;
    pattern?: {
        type: "linear" | "cyclical" | "random" | "weighted";
        config?: {
            custom?: Record<string, any> | undefined;
            weights?: number[] | undefined;
            allowRepeats?: boolean | undefined;
        } | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    }, {
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "Markov";
    inputs?: string[] | undefined;
    states?: string[] | undefined;
    transitions?: Record<string, Record<string, number>> | undefined;
    initialState?: string | undefined;
    markovConfig?: {
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    } | undefined;
}, {
    id: string;
    type: "Markov";
    inputs?: string[] | undefined;
    states?: string[] | undefined;
    transitions?: Record<string, Record<string, number>> | undefined;
    initialState?: string | undefined;
    markovConfig?: {
        custom?: Record<string, any> | undefined;
        maxTransitions?: number | undefined;
        normalizeProbabilities?: boolean | undefined;
        terminationStates?: string[] | undefined;
        detectLoops?: boolean | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    }, {
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "PythonTransform";
    code: string;
    inputs?: string[] | undefined;
    timeout?: number | undefined;
    memoryLimit?: string | undefined;
    allowedModules?: string[] | undefined;
    pythonConfig?: {
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    } | undefined;
}, {
    id: string;
    type: "PythonTransform";
    code: string;
    inputs?: string[] | undefined;
    timeout?: number | undefined;
    memoryLimit?: string | undefined;
    allowedModules?: string[] | undefined;
    pythonConfig?: {
        defaultOutput?: string | undefined;
        strictMode?: boolean | undefined;
        enableCaching?: boolean | undefined;
        executorUrl?: string | undefined;
        retryAttempts?: number | undefined;
        fallbackBehavior?: "error" | "skip" | "default" | undefined;
    } | undefined;
}>]>;
export declare const GraphSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"WeightedChoice">;
        choices: z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            weight: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: string;
            weight: number;
        }, {
            value: string;
            weight: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "WeightedChoice";
        choices: {
            value: string;
            weight: number;
        }[];
        inputs?: string[] | undefined;
    }, {
        id: string;
        type: "WeightedChoice";
        choices: {
            value: string;
            weight: number;
        }[];
        inputs?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"Concat">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "Concat";
        inputs?: string[] | undefined;
    }, {
        id: string;
        type: "Concat";
        inputs?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"Output">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "Output";
        inputs?: string[] | undefined;
    }, {
        id: string;
        type: "Output";
        inputs?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"Include">;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "Include";
        name: string;
        inputs?: string[] | undefined;
    }, {
        id: string;
        type: "Include";
        name: string;
        inputs?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"SetVariable">;
        key: z.ZodString;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "SetVariable";
        key: string;
        value?: any;
        inputs?: string[] | undefined;
    }, {
        id: string;
        type: "SetVariable";
        key: string;
        value?: any;
        inputs?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"GetVariable">;
        key: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "GetVariable";
        key: string;
        inputs?: string[] | undefined;
    }, {
        id: string;
        type: "GetVariable";
        key: string;
        inputs?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"WeightedAdvanced">;
        choices: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            weight: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: string;
            weight: number;
        }, {
            value: string;
            weight: number;
        }>, "many">>;
        distributionConfig: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["linear", "exponential", "gaussian", "custom"]>;
            parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            normalize: z.ZodOptional<z.ZodBoolean>;
            minWeight: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number> | undefined;
            normalize?: boolean | undefined;
            minWeight?: number | undefined;
        }, {
            type: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number> | undefined;
            normalize?: boolean | undefined;
            minWeight?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "WeightedAdvanced";
        inputs?: string[] | undefined;
        choices?: {
            value: string;
            weight: number;
        }[] | undefined;
        distributionConfig?: {
            type: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number> | undefined;
            normalize?: boolean | undefined;
            minWeight?: number | undefined;
        } | undefined;
    }, {
        id: string;
        type: "WeightedAdvanced";
        inputs?: string[] | undefined;
        choices?: {
            value: string;
            weight: number;
        }[] | undefined;
        distributionConfig?: {
            type: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number> | undefined;
            normalize?: boolean | undefined;
            minWeight?: number | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        type: z.ZodLiteral<"Conditional">;
        branches: z.ZodOptional<z.ZodArray<z.ZodObject<{
            condition: z.ZodString;
            output: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            condition: string;
            output: string;
            label?: string | undefined;
        }, {
            condition: string;
            output: string;
            label?: string | undefined;
        }>, "many">>;
        defaultOutput: z.ZodOptional<z.ZodString>;
        conditionalConfig: z.ZodOptional<z.ZodObject<{
            allowVariableAccess: z.ZodOptional<z.ZodBoolean>;
            strictMode: z.ZodOptional<z.ZodBoolean>;
            customFunctions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            allowVariableAccess?: boolean | undefined;
            strictMode?: boolean | undefined;
            customFunctions?: Record<string, any> | undefined;
        }, {
            allowVariableAccess?: boolean | undefined;
            strictMode?: boolean | undefined;
            customFunctions?: Record<string, any> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "Conditional";
        inputs?: string[] | undefined;
        branches?: {
            condition: string;
            output: string;
            label?: string | undefined;
        }[] | undefined;
        defaultOutput?: string | undefined;
        conditionalConfig?: {
            allowVariableAccess?: boolean | undefined;
            strictMode?: boolean | undefined;
            customFunctions?: Record<string, any> | undefined;
        } | undefined;
    }, {
        id: string;
        type: "Conditional";
        inputs?: string[] | undefined;
        branches?: {
            condition: string;
            output: string;
            label?: string | undefined;
        }[] | undefined;
        defaultOutput?: string | undefined;
        conditionalConfig?: {
            allowVariableAccess?: boolean | undefined;
            strictMode?: boolean | undefined;
            customFunctions?: Record<string, any> | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            }, {
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            } | undefined;
        }, {
            type: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "Sequential";
        inputs?: string[] | undefined;
        sequence?: string[] | undefined;
        pattern?: {
            type: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            } | undefined;
        } | undefined;
    }, {
        id: string;
        type: "Sequential";
        inputs?: string[] | undefined;
        sequence?: string[] | undefined;
        pattern?: {
            type: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            } | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
            custom?: Record<string, any> | undefined;
            maxTransitions?: number | undefined;
            normalizeProbabilities?: boolean | undefined;
            terminationStates?: string[] | undefined;
            detectLoops?: boolean | undefined;
        }, {
            custom?: Record<string, any> | undefined;
            maxTransitions?: number | undefined;
            normalizeProbabilities?: boolean | undefined;
            terminationStates?: string[] | undefined;
            detectLoops?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "Markov";
        inputs?: string[] | undefined;
        states?: string[] | undefined;
        transitions?: Record<string, Record<string, number>> | undefined;
        initialState?: string | undefined;
        markovConfig?: {
            custom?: Record<string, any> | undefined;
            maxTransitions?: number | undefined;
            normalizeProbabilities?: boolean | undefined;
            terminationStates?: string[] | undefined;
            detectLoops?: boolean | undefined;
        } | undefined;
    }, {
        id: string;
        type: "Markov";
        inputs?: string[] | undefined;
        states?: string[] | undefined;
        transitions?: Record<string, Record<string, number>> | undefined;
        initialState?: string | undefined;
        markovConfig?: {
            custom?: Record<string, any> | undefined;
            maxTransitions?: number | undefined;
            normalizeProbabilities?: boolean | undefined;
            terminationStates?: string[] | undefined;
            detectLoops?: boolean | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
            defaultOutput?: string | undefined;
            strictMode?: boolean | undefined;
            enableCaching?: boolean | undefined;
            executorUrl?: string | undefined;
            retryAttempts?: number | undefined;
            fallbackBehavior?: "error" | "skip" | "default" | undefined;
        }, {
            defaultOutput?: string | undefined;
            strictMode?: boolean | undefined;
            enableCaching?: boolean | undefined;
            executorUrl?: string | undefined;
            retryAttempts?: number | undefined;
            fallbackBehavior?: "error" | "skip" | "default" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "PythonTransform";
        code: string;
        inputs?: string[] | undefined;
        timeout?: number | undefined;
        memoryLimit?: string | undefined;
        allowedModules?: string[] | undefined;
        pythonConfig?: {
            defaultOutput?: string | undefined;
            strictMode?: boolean | undefined;
            enableCaching?: boolean | undefined;
            executorUrl?: string | undefined;
            retryAttempts?: number | undefined;
            fallbackBehavior?: "error" | "skip" | "default" | undefined;
        } | undefined;
    }, {
        id: string;
        type: "PythonTransform";
        code: string;
        inputs?: string[] | undefined;
        timeout?: number | undefined;
        memoryLimit?: string | undefined;
        allowedModules?: string[] | undefined;
        pythonConfig?: {
            defaultOutput?: string | undefined;
            strictMode?: boolean | undefined;
            enableCaching?: boolean | undefined;
            executorUrl?: string | undefined;
            retryAttempts?: number | undefined;
            fallbackBehavior?: "error" | "skip" | "default" | undefined;
        } | undefined;
    }>]>, "many">;
    seed: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strip", z.ZodTypeAny, {
    nodes: ({
        id: string;
        type: "WeightedChoice";
        choices: {
            value: string;
            weight: number;
        }[];
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Concat";
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Output";
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Include";
        name: string;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "SetVariable";
        key: string;
        value?: any;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "GetVariable";
        key: string;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "WeightedAdvanced";
        inputs?: string[] | undefined;
        choices?: {
            value: string;
            weight: number;
        }[] | undefined;
        distributionConfig?: {
            type: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number> | undefined;
            normalize?: boolean | undefined;
            minWeight?: number | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Conditional";
        inputs?: string[] | undefined;
        branches?: {
            condition: string;
            output: string;
            label?: string | undefined;
        }[] | undefined;
        defaultOutput?: string | undefined;
        conditionalConfig?: {
            allowVariableAccess?: boolean | undefined;
            strictMode?: boolean | undefined;
            customFunctions?: Record<string, any> | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Sequential";
        inputs?: string[] | undefined;
        sequence?: string[] | undefined;
        pattern?: {
            type: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            } | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Markov";
        inputs?: string[] | undefined;
        states?: string[] | undefined;
        transitions?: Record<string, Record<string, number>> | undefined;
        initialState?: string | undefined;
        markovConfig?: {
            custom?: Record<string, any> | undefined;
            maxTransitions?: number | undefined;
            normalizeProbabilities?: boolean | undefined;
            terminationStates?: string[] | undefined;
            detectLoops?: boolean | undefined;
        } | undefined;
    } | {
        id: string;
        type: "PythonTransform";
        code: string;
        inputs?: string[] | undefined;
        timeout?: number | undefined;
        memoryLimit?: string | undefined;
        allowedModules?: string[] | undefined;
        pythonConfig?: {
            defaultOutput?: string | undefined;
            strictMode?: boolean | undefined;
            enableCaching?: boolean | undefined;
            executorUrl?: string | undefined;
            retryAttempts?: number | undefined;
            fallbackBehavior?: "error" | "skip" | "default" | undefined;
        } | undefined;
    })[];
    seed?: string | number | undefined;
}, {
    nodes: ({
        id: string;
        type: "WeightedChoice";
        choices: {
            value: string;
            weight: number;
        }[];
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Concat";
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Output";
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Include";
        name: string;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "SetVariable";
        key: string;
        value?: any;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "GetVariable";
        key: string;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "WeightedAdvanced";
        inputs?: string[] | undefined;
        choices?: {
            value: string;
            weight: number;
        }[] | undefined;
        distributionConfig?: {
            type: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number> | undefined;
            normalize?: boolean | undefined;
            minWeight?: number | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Conditional";
        inputs?: string[] | undefined;
        branches?: {
            condition: string;
            output: string;
            label?: string | undefined;
        }[] | undefined;
        defaultOutput?: string | undefined;
        conditionalConfig?: {
            allowVariableAccess?: boolean | undefined;
            strictMode?: boolean | undefined;
            customFunctions?: Record<string, any> | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Sequential";
        inputs?: string[] | undefined;
        sequence?: string[] | undefined;
        pattern?: {
            type: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any> | undefined;
                weights?: number[] | undefined;
                allowRepeats?: boolean | undefined;
            } | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Markov";
        inputs?: string[] | undefined;
        states?: string[] | undefined;
        transitions?: Record<string, Record<string, number>> | undefined;
        initialState?: string | undefined;
        markovConfig?: {
            custom?: Record<string, any> | undefined;
            maxTransitions?: number | undefined;
            normalizeProbabilities?: boolean | undefined;
            terminationStates?: string[] | undefined;
            detectLoops?: boolean | undefined;
        } | undefined;
    } | {
        id: string;
        type: "PythonTransform";
        code: string;
        inputs?: string[] | undefined;
        timeout?: number | undefined;
        memoryLimit?: string | undefined;
        allowedModules?: string[] | undefined;
        pythonConfig?: {
            defaultOutput?: string | undefined;
            strictMode?: boolean | undefined;
            enableCaching?: boolean | undefined;
            executorUrl?: string | undefined;
            retryAttempts?: number | undefined;
            fallbackBehavior?: "error" | "skip" | "default" | undefined;
        } | undefined;
    })[];
    seed?: string | number | undefined;
}>;
export type Graph = z.infer<typeof GraphSchema>;
export type Node = z.infer<typeof AnyNodeSchema>;
//# sourceMappingURL=graphSchema.d.ts.map