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
    createdAt?: string;
    name?: string;
    description?: string;
    tags?: string[];
    version?: string;
    lastModified?: string;
    author?: string;
    fileFormatVersion?: string;
}, {
    createdAt?: string;
    name?: string;
    description?: string;
    tags?: string[];
    version?: string;
    lastModified?: string;
    author?: string;
    fileFormatVersion?: string;
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
    autoSave?: boolean;
    backupInterval?: number;
    maxBackups?: number;
    gridSnapping?: boolean;
    gridSize?: number;
    theme?: "auto" | "light" | "dark";
    showMinimap?: boolean;
    autoLayout?: boolean;
}, {
    autoSave?: boolean;
    backupInterval?: number;
    maxBackups?: number;
    gridSnapping?: boolean;
    gridSize?: number;
    theme?: "auto" | "light" | "dark";
    showMinimap?: boolean;
    autoLayout?: boolean;
}>;
export declare const CollaborationDataSchema: z.ZodObject<{
    stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x?: number;
            y?: number;
        }, {
            x?: number;
            y?: number;
        }>;
        size: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width?: number;
            height?: number;
        }, {
            width?: number;
            height?: number;
        }>;
        color: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: {
            width?: number;
            height?: number;
        };
        position?: {
            x?: number;
            y?: number;
        };
        author?: string;
        content?: string;
        color?: string;
        timestamp?: string;
    }, {
        id?: string;
        size?: {
            width?: number;
            height?: number;
        };
        position?: {
            x?: number;
            y?: number;
        };
        author?: string;
        content?: string;
        color?: string;
        timestamp?: string;
    }>, "many">>;
    annotations: z.ZodDefault<z.ZodObject<{
        nodeLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        regionGroups: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            nodeIds: z.ZodArray<z.ZodString, "many">;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x?: number;
                y?: number;
            }, {
                x?: number;
                y?: number;
            }>;
            size: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>;
            color: z.ZodString;
            collapsed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            name?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            color?: string;
            nodeIds?: string[];
            collapsed?: boolean;
        }, {
            id?: string;
            name?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            color?: string;
            nodeIds?: string[];
            collapsed?: boolean;
        }>, "many">>;
        connectionLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        nodeLabels?: Record<string, string>;
        regionGroups?: {
            id?: string;
            name?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            color?: string;
            nodeIds?: string[];
            collapsed?: boolean;
        }[];
        connectionLabels?: Record<string, string>;
    }, {
        nodeLabels?: Record<string, string>;
        regionGroups?: {
            id?: string;
            name?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            color?: string;
            nodeIds?: string[];
            collapsed?: boolean;
        }[];
        connectionLabels?: Record<string, string>;
    }>>;
}, "strip", z.ZodTypeAny, {
    stickyNotes?: {
        id?: string;
        size?: {
            width?: number;
            height?: number;
        };
        position?: {
            x?: number;
            y?: number;
        };
        author?: string;
        content?: string;
        color?: string;
        timestamp?: string;
    }[];
    annotations?: {
        nodeLabels?: Record<string, string>;
        regionGroups?: {
            id?: string;
            name?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            color?: string;
            nodeIds?: string[];
            collapsed?: boolean;
        }[];
        connectionLabels?: Record<string, string>;
    };
}, {
    stickyNotes?: {
        id?: string;
        size?: {
            width?: number;
            height?: number;
        };
        position?: {
            x?: number;
            y?: number;
        };
        author?: string;
        content?: string;
        color?: string;
        timestamp?: string;
    }[];
    annotations?: {
        nodeLabels?: Record<string, string>;
        regionGroups?: {
            id?: string;
            name?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            color?: string;
            nodeIds?: string[];
            collapsed?: boolean;
        }[];
        connectionLabels?: Record<string, string>;
    };
}>;
export declare const PsgFileSchema: z.ZodObject<{
    fileType: z.ZodLiteral<"psg">;
    formatVersion: z.ZodString;
    metadata: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        createdAt: z.ZodString;
        lastModified: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        fileFormatVersion: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        createdAt?: string;
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        lastModified?: string;
        author?: string;
        fileFormatVersion?: string;
    }, {
        createdAt?: string;
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        lastModified?: string;
        author?: string;
        fileFormatVersion?: string;
    }>;
    settings: z.ZodObject<{
        autoSave: z.ZodDefault<z.ZodBoolean>;
        backupInterval: z.ZodDefault<z.ZodNumber>;
        maxBackups: z.ZodDefault<z.ZodNumber>;
        gridSnapping: z.ZodDefault<z.ZodBoolean>;
        gridSize: z.ZodDefault<z.ZodNumber>;
        theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
        showMinimap: z.ZodDefault<z.ZodBoolean>;
        autoLayout: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        autoSave?: boolean;
        backupInterval?: number;
        maxBackups?: number;
        gridSnapping?: boolean;
        gridSize?: number;
        theme?: "auto" | "light" | "dark";
        showMinimap?: boolean;
        autoLayout?: boolean;
    }, {
        autoSave?: boolean;
        backupInterval?: number;
        maxBackups?: number;
        gridSnapping?: boolean;
        gridSize?: number;
        theme?: "auto" | "light" | "dark";
        showMinimap?: boolean;
        autoLayout?: boolean;
    }>;
    graph: z.ZodObject<{
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
    collaboration: z.ZodOptional<z.ZodObject<{
        stickyNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x?: number;
                y?: number;
            }, {
                x?: number;
                y?: number;
            }>;
            size: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>;
            color: z.ZodString;
            author: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            author?: string;
            content?: string;
            color?: string;
            timestamp?: string;
        }, {
            id?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            author?: string;
            content?: string;
            color?: string;
            timestamp?: string;
        }>, "many">>;
        annotations: z.ZodDefault<z.ZodObject<{
            nodeLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
            regionGroups: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                nodeIds: z.ZodArray<z.ZodString, "many">;
                position: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x?: number;
                    y?: number;
                }, {
                    x?: number;
                    y?: number;
                }>;
                size: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width?: number;
                    height?: number;
                }, {
                    width?: number;
                    height?: number;
                }>;
                color: z.ZodString;
                collapsed: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }, {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }>, "many">>;
            connectionLabels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            nodeLabels?: Record<string, string>;
            regionGroups?: {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }[];
            connectionLabels?: Record<string, string>;
        }, {
            nodeLabels?: Record<string, string>;
            regionGroups?: {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }[];
            connectionLabels?: Record<string, string>;
        }>>;
    }, "strip", z.ZodTypeAny, {
        stickyNotes?: {
            id?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            author?: string;
            content?: string;
            color?: string;
            timestamp?: string;
        }[];
        annotations?: {
            nodeLabels?: Record<string, string>;
            regionGroups?: {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }[];
            connectionLabels?: Record<string, string>;
        };
    }, {
        stickyNotes?: {
            id?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            author?: string;
            content?: string;
            color?: string;
            timestamp?: string;
        }[];
        annotations?: {
            nodeLabels?: Record<string, string>;
            regionGroups?: {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }[];
            connectionLabels?: Record<string, string>;
        };
    }>>;
    extensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    checksum: z.ZodOptional<z.ZodString>;
    exportedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fileType?: "psg";
    formatVersion?: string;
    metadata?: {
        createdAt?: string;
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        lastModified?: string;
        author?: string;
        fileFormatVersion?: string;
    };
    settings?: {
        autoSave?: boolean;
        backupInterval?: number;
        maxBackups?: number;
        gridSnapping?: boolean;
        gridSize?: number;
        theme?: "auto" | "light" | "dark";
        showMinimap?: boolean;
        autoLayout?: boolean;
    };
    graph?: {
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
    };
    collaboration?: {
        stickyNotes?: {
            id?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            author?: string;
            content?: string;
            color?: string;
            timestamp?: string;
        }[];
        annotations?: {
            nodeLabels?: Record<string, string>;
            regionGroups?: {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }[];
            connectionLabels?: Record<string, string>;
        };
    };
    extensions?: Record<string, unknown>;
    checksum?: string;
    exportedAt?: string;
}, {
    fileType?: "psg";
    formatVersion?: string;
    metadata?: {
        createdAt?: string;
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        lastModified?: string;
        author?: string;
        fileFormatVersion?: string;
    };
    settings?: {
        autoSave?: boolean;
        backupInterval?: number;
        maxBackups?: number;
        gridSnapping?: boolean;
        gridSize?: number;
        theme?: "auto" | "light" | "dark";
        showMinimap?: boolean;
        autoLayout?: boolean;
    };
    graph?: {
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
    };
    collaboration?: {
        stickyNotes?: {
            id?: string;
            size?: {
                width?: number;
                height?: number;
            };
            position?: {
                x?: number;
                y?: number;
            };
            author?: string;
            content?: string;
            color?: string;
            timestamp?: string;
        }[];
        annotations?: {
            nodeLabels?: Record<string, string>;
            regionGroups?: {
                id?: string;
                name?: string;
                size?: {
                    width?: number;
                    height?: number;
                };
                position?: {
                    x?: number;
                    y?: number;
                };
                color?: string;
                nodeIds?: string[];
                collapsed?: boolean;
            }[];
            connectionLabels?: Record<string, string>;
        };
    };
    extensions?: Record<string, unknown>;
    checksum?: string;
    exportedAt?: string;
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