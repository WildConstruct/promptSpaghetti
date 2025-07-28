/**
 * .psg (PromptSpaghetti Graph) File Format Schema - Story 6.1
 *
 * Defines the schema and validation for .psg project files using Zod.
 * Provides versioning support and comprehensive metadata structure.
 */
import { z } from 'zod';
export declare export declare const ProjectMetadataSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodString;
    lastModified: z.ZodString;
    author: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    fileFormatVersion: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    name: string;
    tags: string[];
    version: string;
    lastModified: string;
    fileFormatVersion: string;
    description?: string | undefined;
    author?: string | undefined;
}, {
    createdAt: string;
    name: string;
    lastModified: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    version?: string | undefined;
    author?: string | undefined;
    fileFormatVersion?: string | undefined;
}>;
export declare const ProjectSettingsSchema: z.ZodObject<{
    autoSave: z.ZodDefault<z.ZodBoolean>;
    backupInterval: z.ZodDefault<z.ZodNumber>;
    maxBackups: z.ZodDefault<z.ZodNumber>;
    gridSnapping: z.ZodDefault<z.ZodBoolean>;
    gridSize: z.ZodDefault<z.ZodNumber>;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
    showMinimap: z.ZodDefault<z.ZodBoolean>;
    autoLayout: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    autoSave: boolean;
    backupInterval: number;
    maxBackups: number;
    gridSnapping: boolean;
    gridSize: number;
    theme: "auto" | "light" | "dark";
    showMinimap: boolean;
    autoLayout: boolean;
}, {
    autoSave?: boolean | undefined;
    backupInterval?: number | undefined;
    maxBackups?: number | undefined;
    gridSnapping?: boolean | undefined;
    gridSize?: number | undefined;
    theme?: "auto" | "light" | "dark" | undefined;
    showMinimap?: boolean | undefined;
    autoLayout?: boolean | undefined;
}>;
export declare const CollaborationDataSchema: z.ZodObject<{
    stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{,
        id: z.ZodString;
        content: z.ZodString;
        position: z.ZodObject<{,
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        size: z.ZodObject<{,
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
        }, {
            width: number;
            height: number;
        }>;
        color: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        position: {,
            x: number;
            y: number;
        };
        content: string;
        size: {,
            width: number;
            height: number;
        };
        color: string;
        timestamp: string;
        author?: string | undefined;
    }, {
        id: string;
        position: {,
            x: number;
            y: number;
        };
        content: string;
        size: {,
            width: number;
            height: number;
        };
        color: string;
        timestamp: string;
        author?: string | undefined;
    }>, "many">>;
    annotations: z.ZodDefault<z.ZodObject<{,
        nodeLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        regionGroups: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            id: z.ZodString;
            name: z.ZodString;
            nodeIds: z.ZodArray<z.ZodString, "many">;
            position: z.ZodObject<{,
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            size: z.ZodObject<{,
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            color: z.ZodString;
            collapsed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            position: {,
                x: number;
                y: number;
            };
            size: {,
                width: number;
                height: number;
            };
            color: string;
            nodeIds: string[];
            collapsed: boolean;
        }, {
            id: string;
            name: string;
            position: {,
                x: number;
                y: number;
            };
            size: {,
                width: number;
                height: number;
            };
            color: string;
            nodeIds: string[];
            collapsed?: boolean | undefined;
        }>, "many">>;
        connectionLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        nodeLabels: Record<string, string>;
        regionGroups: {,
            id: string;
            name: string;
            position: {,
                x: number;
                y: number;
            };
            size: {,
                width: number;
                height: number;
            };
            color: string;
            nodeIds: string[];
            collapsed: boolean;
        }[];
        connectionLabels: Record<string, string>;
    }, {
        nodeLabels?: Record<string, string> | undefined;
        regionGroups?: {
            id: string;
            name: string;
            position: {,
                x: number;
                y: number;
            };
            size: {,
                width: number;
                height: number;
            };
            color: string;
            nodeIds: string[];
            collapsed?: boolean | undefined;
        }[] | undefined;
        connectionLabels?: Record<string, string> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    stickyNotes: {,
        id: string;
        position: {,
            x: number;
            y: number;
        };
        content: string;
        size: {,
            width: number;
            height: number;
        };
        color: string;
        timestamp: string;
        author?: string | undefined;
    }[];
    annotations: {,
        nodeLabels: Record<string, string>;
        regionGroups: {,
            id: string;
            name: string;
            position: {,
                x: number;
                y: number;
            };
            size: {,
                width: number;
                height: number;
            };
            color: string;
            nodeIds: string[];
            collapsed: boolean;
        }[];
        connectionLabels: Record<string, string>;
    };
}, {
    stickyNotes?: {
        id: string;
        position: {,
            x: number;
            y: number;
        };
        content: string;
        size: {,
            width: number;
            height: number;
        };
        color: string;
        timestamp: string;
        author?: string | undefined;
    }[] | undefined;
    annotations?: {
        nodeLabels?: Record<string, string> | undefined;
        regionGroups?: {
            id: string;
            name: string;
            position: {,
                x: number;
                y: number;
            };
            size: {,
                width: number;
                height: number;
            };
            color: string;
            nodeIds: string[];
            collapsed?: boolean | undefined;
        }[] | undefined;
        connectionLabels?: Record<string, string> | undefined;
    } | undefined;
}>;
export declare const PsgFileSchema: z.ZodObject<{
    fileType: z.ZodLiteral<"psg">;
    formatVersion: z.ZodString;
    metadata: z.ZodObject<{,
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        createdAt: z.ZodString;
        lastModified: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        fileFormatVersion: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        name: string;
        tags: string[];
        version: string;
        lastModified: string;
        fileFormatVersion: string;
        description?: string | undefined;
        author?: string | undefined;
    }, {
        createdAt: string;
        name: string;
        lastModified: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        author?: string | undefined;
        fileFormatVersion?: string | undefined;
    }>;
    settings: z.ZodObject<{,
        autoSave: z.ZodDefault<z.ZodBoolean>;
        backupInterval: z.ZodDefault<z.ZodNumber>;
        maxBackups: z.ZodDefault<z.ZodNumber>;
        gridSnapping: z.ZodDefault<z.ZodBoolean>;
        gridSize: z.ZodDefault<z.ZodNumber>;
        theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
        showMinimap: z.ZodDefault<z.ZodBoolean>;
        autoLayout: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        autoSave: boolean;
        backupInterval: number;
        maxBackups: number;
        gridSnapping: boolean;
        gridSize: number;
        theme: "auto" | "light" | "dark";
        showMinimap: boolean;
        autoLayout: boolean;
    }, {
        autoSave?: boolean | undefined;
        backupInterval?: number | undefined;
        maxBackups?: number | undefined;
        gridSnapping?: boolean | undefined;
        gridSize?: number | undefined;
        theme?: "auto" | "light" | "dark" | undefined;
        showMinimap?: boolean | undefined;
        autoLayout?: boolean | undefined;
    }>;
    graph: z.ZodObject<{,
        nodes: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"WeightedChoice">;
            choices: z.ZodArray<z.ZodObject<{,
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
            choices: {,
                value: string;
                weight: number;
            }[];
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }, {
            id: string;
            type: "WeightedChoice";
            choices: {,
                value: string;
                weight: number;
            }[];
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"Concat">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "Concat";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }, {
            id: string;
            type: "Concat";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"Output">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "Output";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }, {
            id: string;
            type: "Output";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"Include">;
            name: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            type: "Include";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }, {
            id: string;
            name: string;
            type: "Include";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"SetVariable">;
            key: z.ZodEffects<z.ZodString, string, string>;
            value: z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "SetVariable";
            key: string;
            value?: string | number | boolean | string[] | Record<string, string> | null | undefined;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }, {
            id: string;
            type: "SetVariable";
            key: string;
            value?: string | number | boolean | string[] | Record<string, string> | null | undefined;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"GetVariable">;
            key: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "GetVariable";
            key: string;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }, {
            id: string;
            type: "GetVariable";
            key: string;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"WeightedAdvanced">;
            choices: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                value: z.ZodString;
                weight: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                value: string;
                weight: number;
            }, {
                value: string;
                weight: number;
            }>, "many">>;
            distributionConfig: z.ZodOptional<z.ZodObject<{,
                type: z.ZodEnum<["linear", "exponential", "gaussian", "custom"]>;
                parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
                normalize: z.ZodOptional<z.ZodBoolean>;
                minWeight: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            }, {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "WeightedAdvanced";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            choices?: {
                value: string;
                weight: number;
            }[] | undefined;
            distributionConfig?: {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            } | undefined;
        }, {
            id: string;
            type: "WeightedAdvanced";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            choices?: {
                value: string;
                weight: number;
            }[] | undefined;
            distributionConfig?: {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            } | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"Conditional">;
            branches: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                condition: z.ZodEffects<z.ZodString, string, string>;
                output: z.ZodEffects<z.ZodString, string, string>;
                label: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            }, "strip", z.ZodTypeAny, {
                condition: string;
                output: string;
                label?: string | undefined;
            }, {
                condition: string;
                output: string;
                label?: string | undefined;
            }>, "many">>;
            defaultOutput: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            conditionalConfig: z.ZodOptional<z.ZodObject<{,
                allowVariableAccess: z.ZodOptional<z.ZodBoolean>;
                strictMode: z.ZodOptional<z.ZodBoolean>;
                customFunctions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>>>;
            }, "strip", z.ZodTypeAny, {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            }, {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "Conditional";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            branches?: {
                condition: string;
                output: string;
                label?: string | undefined;
            }[] | undefined;
            defaultOutput?: string | undefined;
            conditionalConfig?: {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            } | undefined;
        }, {
            id: string;
            type: "Conditional";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            branches?: {
                condition: string;
                output: string;
                label?: string | undefined;
            }[] | undefined;
            defaultOutput?: string | undefined;
            conditionalConfig?: {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            } | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            inputs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"Sequential">;
            sequence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            pattern: z.ZodOptional<z.ZodObject<{,
                type: z.ZodEnum<["linear", "cyclical", "random", "weighted"]>;
                config: z.ZodOptional<z.ZodObject<{,
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"Markov">;
            states: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            transitions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            initialState: z.ZodOptional<z.ZodString>;
            markovConfig: z.ZodOptional<z.ZodObject<{,
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template: z.ZodOptional<z.ZodString>;
            extractedVariables: z.ZodOptional<z.ZodArray<z.ZodObject<{,
                name: z.ZodString;
                placeholder: z.ZodString;
                startIndex: z.ZodNumber;
                endIndex: z.ZodNumber;
                isValid: z.ZodBoolean;
                inferredType: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "array", "object", "auto"]>>;
                defaultValue: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }, {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }>, "many">>;
        } & {
            type: z.ZodLiteral<"PythonTransform">;
            code: z.ZodString;
            timeout: z.ZodOptional<z.ZodNumber>;
            memoryLimit: z.ZodOptional<z.ZodString>;
            allowedModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            pythonConfig: z.ZodOptional<z.ZodObject<{,
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
            code: string;
            type: "PythonTransform";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            code: string;
            type: "PythonTransform";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
        nodes: ({),
            id: string;
            type: "WeightedChoice";
            choices: {,
                value: string;
                weight: number;
            }[];
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Concat";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Output";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            name: string;
            type: "Include";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "SetVariable";
            key: string;
            value?: string | number | boolean | string[] | Record<string, string> | null | undefined;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "GetVariable";
            key: string;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "WeightedAdvanced";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            choices?: {
                value: string;
                weight: number;
            }[] | undefined;
            distributionConfig?: {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Conditional";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            branches?: {
                condition: string;
                output: string;
                label?: string | undefined;
            }[] | undefined;
            defaultOutput?: string | undefined;
            conditionalConfig?: {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Sequential";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            code: string;
            type: "PythonTransform";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
        nodes: ({),
            id: string;
            type: "WeightedChoice";
            choices: {,
                value: string;
                weight: number;
            }[];
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Concat";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Output";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            name: string;
            type: "Include";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "SetVariable";
            key: string;
            value?: string | number | boolean | string[] | Record<string, string> | null | undefined;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "GetVariable";
            key: string;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "WeightedAdvanced";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            choices?: {
                value: string;
                weight: number;
            }[] | undefined;
            distributionConfig?: {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Conditional";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            branches?: {
                condition: string;
                output: string;
                label?: string | undefined;
            }[] | undefined;
            defaultOutput?: string | undefined;
            conditionalConfig?: {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Sequential";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            code: string;
            type: "PythonTransform";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
    collaboration: z.ZodOptional<z.ZodObject<{,
        stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{,
            id: z.ZodString;
            content: z.ZodString;
            position: z.ZodObject<{,
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            size: z.ZodObject<{,
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            color: z.ZodString;
            author: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            position: {,
                x: number;
                y: number;
            };
            content: string;
            size: {,
                width: number;
                height: number;
            };
            color: string;
            timestamp: string;
            author?: string | undefined;
        }, {
            id: string;
            position: {,
                x: number;
                y: number;
            };
            content: string;
            size: {,
                width: number;
                height: number;
            };
            color: string;
            timestamp: string;
            author?: string | undefined;
        }>, "many">>;
        annotations: z.ZodDefault<z.ZodObject<{,
            nodeLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
            regionGroups: z.ZodDefault<z.ZodArray<z.ZodObject<{,
                id: z.ZodString;
                name: z.ZodString;
                nodeIds: z.ZodArray<z.ZodString, "many">;
                position: z.ZodObject<{,
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                }, {
                    x: number;
                    y: number;
                }>;
                size: z.ZodObject<{,
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                color: z.ZodString;
                collapsed: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed: boolean;
            }, {
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed?: boolean | undefined;
            }>, "many">>;
            connectionLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            nodeLabels: Record<string, string>;
            regionGroups: {,
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed: boolean;
            }[];
            connectionLabels: Record<string, string>;
        }, {
            nodeLabels?: Record<string, string> | undefined;
            regionGroups?: {
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed?: boolean | undefined;
            }[] | undefined;
            connectionLabels?: Record<string, string> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        stickyNotes: {,
            id: string;
            position: {,
                x: number;
                y: number;
            };
            content: string;
            size: {,
                width: number;
                height: number;
            };
            color: string;
            timestamp: string;
            author?: string | undefined;
        }[];
        annotations: {,
            nodeLabels: Record<string, string>;
            regionGroups: {,
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed: boolean;
            }[];
            connectionLabels: Record<string, string>;
        };
    }, {
        stickyNotes?: {
            id: string;
            position: {,
                x: number;
                y: number;
            };
            content: string;
            size: {,
                width: number;
                height: number;
            };
            color: string;
            timestamp: string;
            author?: string | undefined;
        }[] | undefined;
        annotations?: {
            nodeLabels?: Record<string, string> | undefined;
            regionGroups?: {
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed?: boolean | undefined;
            }[] | undefined;
            connectionLabels?: Record<string, string> | undefined;
        } | undefined;
    }>>;
    extensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    checksum: z.ZodOptional<z.ZodString>;
    exportedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fileType: "psg";
    formatVersion: string;
    metadata: {,
        createdAt: string;
        name: string;
        tags: string[];
        version: string;
        lastModified: string;
        fileFormatVersion: string;
        description?: string | undefined;
        author?: string | undefined;
    };
    settings: {,
        autoSave: boolean;
        backupInterval: number;
        maxBackups: number;
        gridSnapping: boolean;
        gridSize: number;
        theme: "auto" | "light" | "dark";
        showMinimap: boolean;
        autoLayout: boolean;
    };
    graph: {,
        nodes: ({),
            id: string;
            type: "WeightedChoice";
            choices: {,
                value: string;
                weight: number;
            }[];
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Concat";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Output";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            name: string;
            type: "Include";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "SetVariable";
            key: string;
            value?: string | number | boolean | string[] | Record<string, string> | null | undefined;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "GetVariable";
            key: string;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "WeightedAdvanced";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            choices?: {
                value: string;
                weight: number;
            }[] | undefined;
            distributionConfig?: {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Conditional";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            branches?: {
                condition: string;
                output: string;
                label?: string | undefined;
            }[] | undefined;
            defaultOutput?: string | undefined;
            conditionalConfig?: {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Sequential";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            code: string;
            type: "PythonTransform";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
    };
    exportedAt: string;
    collaboration?: {
        stickyNotes: {,
            id: string;
            position: {,
                x: number;
                y: number;
            };
            content: string;
            size: {,
                width: number;
                height: number;
            };
            color: string;
            timestamp: string;
            author?: string | undefined;
        }[];
        annotations: {,
            nodeLabels: Record<string, string>;
            regionGroups: {,
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed: boolean;
            }[];
            connectionLabels: Record<string, string>;
        };
    } | undefined;
    extensions?: Record<string, unknown> | undefined;
    checksum?: string | undefined;
}, {
    fileType: "psg";
    formatVersion: string;
    metadata: {,
        createdAt: string;
        name: string;
        lastModified: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        author?: string | undefined;
        fileFormatVersion?: string | undefined;
    };
    settings: {,
        autoSave?: boolean | undefined;
        backupInterval?: number | undefined;
        maxBackups?: number | undefined;
        gridSnapping?: boolean | undefined;
        gridSize?: number | undefined;
        theme?: "auto" | "light" | "dark" | undefined;
        showMinimap?: boolean | undefined;
        autoLayout?: boolean | undefined;
    };
    graph: {,
        nodes: ({),
            id: string;
            type: "WeightedChoice";
            choices: {,
                value: string;
                weight: number;
            }[];
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Concat";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "Output";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            name: string;
            type: "Include";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "SetVariable";
            key: string;
            value?: string | number | boolean | string[] | Record<string, string> | null | undefined;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "GetVariable";
            key: string;
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
        } | {
            id: string;
            type: "WeightedAdvanced";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            choices?: {
                value: string;
                weight: number;
            }[] | undefined;
            distributionConfig?: {
                type: "custom" | "linear" | "exponential" | "gaussian";
                normalize?: boolean | undefined;
                parameters?: Record<string, number> | undefined;
                minWeight?: number | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Conditional";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
            branches?: {
                condition: string;
                output: string;
                label?: string | undefined;
            }[] | undefined;
            defaultOutput?: string | undefined;
            conditionalConfig?: {
                allowVariableAccess?: boolean | undefined;
                strictMode?: boolean | undefined;
                customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
            } | undefined;
        } | {
            id: string;
            type: "Sequential";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
            code: string;
            type: "PythonTransform";
            inputs?: string[] | undefined;
            template?: string | undefined;
            extractedVariables?: {
                name: string;
                placeholder: string;
                startIndex: number;
                endIndex: number;
                isValid: boolean;
                inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto" | undefined;
                defaultValue?: string | undefined;
            }[] | undefined;
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
    };
    exportedAt: string;
    collaboration?: {
        stickyNotes?: {
            id: string;
            position: {,
                x: number;
                y: number;
            };
            content: string;
            size: {,
                width: number;
                height: number;
            };
            color: string;
            timestamp: string;
            author?: string | undefined;
        }[] | undefined;
        annotations?: {
            nodeLabels?: Record<string, string> | undefined;
            regionGroups?: {
                id: string;
                name: string;
                position: {,
                    x: number;
                    y: number;
                };
                size: {,
                    width: number;
                    height: number;
                };
                color: string;
                nodeIds: string[];
                collapsed?: boolean | undefined;
            }[] | undefined;
            connectionLabels?: Record<string, string> | undefined;
        } | undefined;
    } | undefined;
    extensions?: Record<string, unknown> | undefined;
    checksum?: string | undefined;
}>;
export type PsgFile = z.infer<typeof PsgFileSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;
export type CollaborationData = z.infer<typeof CollaborationDataSchema>;
export declare function validatePsgFile(data: unknown): {
    success: true;
    data: PsgFile;
} | {
    success: false;
    error: string;
    issues: z.ZodIssue[];
};
export declare function isVersionCompatible(fileVersion: string): {
    compatible: boolean;
    requiresMigration: boolean;
    message?: string;
};
export declare function createDefaultMetadata(name: string, author?: string): ProjectMetadata;
export declare function createDefaultSettings(): ProjectSettings;
//# sourceMappingURL=psgSchema.d.ts.map